/*
 * ============================================================================
 * 文件位置: functions/api/prayer.js
 * 作用: Cloudflare Pages Function — 处理来自前端代祷墙的代祷请求
 * 路由: POST /api/prayer（前端通过 fetch 发送 POST 请求到 /api/prayer）
 * 架构:
 *   前端代祷表单（prayer.astro）→ fetch POST → 本文件
 *     ├── 解析 JSON 请求体
 *     ├── 校验必填字段（email、代祷内容）
 *     ├── 写入 D1 数据库（Cloudflare D1，SQLite 兼容）
 *     ├── 转发到 Google Sheets（通过 Webhook，可选）
 *     └── 返回 JSON 响应 { success: true, id } 或 { error: "..." }
 *
 * 依赖:
 *   - Cloudflare Pages Functions 运行时（env 对象自动注入）
 *   - Cloudflare D1 数据库（需在 Cloudflare Dashboard 创建并绑定到 Pages）
 *   - Google Sheets Webhook（可选，通过 GOOGLE_SHEETS_WEBHOOK secret 配置）
 *
 * 数据库表结构（需在 D1 中提前创建）:
 *   CREATE TABLE IF NOT EXISTS prayer_requests (
 *     id          TEXT PRIMARY KEY,
 *     name        TEXT NOT NULL,
 *     email       TEXT NOT NULL,
 *     request     TEXT NOT NULL,
 *     lang        TEXT DEFAULT 'en',
 *     anonymous   INTEGER DEFAULT 0,
 *     created_at  TEXT NOT NULL
 *   );
 *
 * 修改指南:
 *   - 【修改】添加新字段: 同时修改前端表单、本文件校验/解构、D1 INSERT 语句、Google Sheets payload
 *   - 【修改】数据库表名: 编辑 INSERT 语句中的表名 prayer_requests
 *   - 【修改】启用/禁用 Google Sheets: 在 Cloudflare Dashboard 设置/删除 GOOGLE_SHEETS_WEBHOOK secret
 *   - 【修改】返回值格式: 编辑最后的 return new Response(...) 部分
 *   - 注意: 本文件运行在 Cloudflare Workers 沙箱中，只能用 Web 标准 API + Cloudflare 特有 API
 *           不能用 Node.js 模块（如 fs、path），不能 import 需要在 esbuild 中标记 external 的包
 * ============================================================================
 */

/**
 * POST /api/prayer 请求处理函数
 *
 * Cloudflare Pages Functions 自动根据文件名路由：
 *   functions/api/prayer.js → POST /api/prayer
 *   函数名 onRequestPost 表示只处理 POST 方法
 *
 * @param {Object}  context          - Cloudflare Pages Function 上下文
 * @param {Request} context.request  - 原始 Fetch API Request 对象
 * @param {Object}  context.env      - Cloudflare 环境变量 / 绑定（D1、KV、Secrets 等）
 * @returns {Response} JSON 响应，成功 { success: true, id }，失败 { error: "..." }
 */
export async function onRequestPost({ request, env }) {
  // ===== try-catch 最外层：捕获所有未预期的异常 =====
  // 包括 JSON 解析失败、数据库连接失败等，统一返回 500
  try {

    /*
     * =========================================================================
     * 步骤 1: 解析请求体
     * =========================================================================
     * 从前端发来的 POST 请求中读取 JSON body。
     *
     * 前端发送的字段（与 prayer.astro 表单保持一致）:
     *   name      - 代祷者姓名（匿名时可缺省）
     *   anonymous - 是否匿名（boolean）
     *   email     - 联系邮箱（必填，用于后续反馈代祷结果）
     *   request   - 代祷内容（必填，长文本）
     *   lang      - 语言代码 'en' | 'zh'，默认为 'en'
     *   timestamp - ISO 时间戳，前端生成用于时区一致性
     *
     * 【修改】新增字段时，在此解构添加
     */
    const body = await request.json();
    const { name, anonymous, email, request: prayerRequest, lang, timestamp } = body;

    /*
     * =========================================================================
     * 步骤 2: 必填字段校验
     * =========================================================================
     * 校验 email 和代祷内容（prayerRequest）不能为空。
     * name 可以为空（匿名代祷场景），前端将 anonymous=true 时不要求填写。
     *
     * 返回 400 Bad Request：
     *   前端应显示错误提示，让用户补充必填字段后重新提交。
     *
     * 【修改】修改校验规则时，同时更新前端 prayer.astro 的表单验证逻辑
     */
    if (!email || !prayerRequest) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    /*
     * =========================================================================
     * 步骤 3: 数据整理
     * =========================================================================
     * 生成唯一 ID（UUID v4），确定显示名称。
     * 匿名用户 displayName 固定为 'Anonymous'，非匿名用户取填写的 name。
     * 兜底策略: 如果 name 也为空，仍然显示 'Anonymous'（避免数据库空值）。
     *
     * 【修改】修改默认匿名显示名时改 'Anonymous' 为其他文案（注意前端也需同步）
     */
    const displayName = anonymous ? 'Anonymous' : (name || 'Anonymous');
    const id = crypto.randomUUID();

    /*
     * =========================================================================
     * 步骤 4: 写入 Cloudflare D1 数据库
     * =========================================================================
     * D1 是 Cloudflare 的 serverless SQLite 数据库。
     * env.DB 是 Cloudflare Dashboard 中绑定的 D1 数据库对象，
     * 如果未绑定则 env.DB 为 undefined —— 此时跳过数据库写入（不报错）。
     *
     * 写入字段:
     *   id         - 代祷记录唯一 ID
     *   name       - 显示名称（匿名则存 'Anonymous'）
     *   email      - 联系邮箱
     *   request    - 代祷内容正文
     *   lang       - 语言代码，前端未传时默认 'en'
     *   anonymous  - 是否匿名，存储为 0/1（SQLite 无 boolean 类型）
     *   created_at - 创建时间，优先用前端 timestamp，否则用服务端当前时间
     *
     * 安全性: 使用参数化查询 .bind() 防止 SQL 注入
     *
     * 【修改】表名/字段名: 编辑 SQL 语句
     * 【修改】D1 绑定名: 如果 Dashboard 中绑定名不是 DB，改 env.OTHER_NAME
     */
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO prayer_requests (id, name, email, request, lang, anonymous, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, displayName, email, prayerRequest, lang || 'en', anonymous ? 1 : 0, timestamp || new Date().toISOString())
        .run();
    }

    /*
     * =========================================================================
     * 步骤 5: 转发到 Google Sheets（可选）
     * =========================================================================
     * 如果配置了 GOOGLE_SHEETS_WEBHOOK secret，则将代祷数据转发到 Google Apps Script
     * 部署的 Web App（作为 Google Sheets 的写入接口）。
     *
     * Google Sheets Webhook 设置步骤:
     *   1. 在 Google Sheets 中打开「扩展程序 > Apps Script」
     *   2. 编写 doPost(e) 函数解析参数并写入工作表
     *   3. 部署为「Web 应用」，获取 Webhook URL
     *   4. 在 Cloudflare Dashboard > Pages > 设置 > 环境变量中，
     *      添加 GOOGLE_SHEETS_WEBHOOK secret（勾选加密）
     *
     * 注意: Google Apps Script Web App URL 较长（~200 字符），
     *       且每个请求需要 1-3 秒响应时间。
     *
     * 此步骤失败不会影响整体请求处理:
     *   即使 Google Sheets 写入失败，只要 D1 写入成功，仍返回 success。
     *   catch 块仅记录日志，不抛出异常 —— 保证用户体验不受第三方服务影响。
     *
     * 【修改】启用: 在 Cloudflare Dashboard 添加 GOOGLE_SHEETS_WEBHOOK secret
     * 【修改】禁用: 在 Cloudflare Dashboard 删除 GOOGLE_SHEETS_WEBHOOK secret
     *         删除后此 if 块不再执行，代祷数据仅存 D1
     */
    if (env.GOOGLE_SHEETS_WEBHOOK) {
      try {
        await fetch(env.GOOGLE_SHEETS_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name: displayName,
            email,
            request: prayerRequest,
            lang: lang || 'en',
            anonymous: anonymous ? 'Yes' : 'No',
            timestamp: timestamp || new Date().toISOString(),
          }),
        });
      } catch (e) {
        /*
         * Google Sheets webhook 调用失败
         *
         * 可能原因:
         *   - Webhook URL 配置错误或已过期
         *   - Google Apps Script 配额超限（免费版每日 ~20000 次）
         *   - 网络超时（Google 服务在国内访问不稳定）
         *
         * 处理策略: 仅 console.error 记录日志，不阻塞主流程。
         *           代祷数据已写入 D1，不算丢失。
         *           Cloudflare Dashboard > Pages > Functions > Logs 可查看日志。
         *
         * 【修改】如需通知管理员 webhook 失败，可在此添加发送告警逻辑
         */
        console.error('Google Sheets webhook failed:', e);
        // Non-critical, continue —— 不影响请求整体成功
      }
    }

    /*
     * =========================================================================
     * 步骤 6: 返回成功响应
     * =========================================================================
     * 返回 200 OK，携带新生成的代祷记录 ID。
     * 前端收到 success: true 后显示成功提示，并可记录 id 用于后续追踪。
     *
     * 【修改】返回额外信息: 在 JSON.stringify 对象中添加更多字段
     */
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    /*
     * =========================================================================
     * 全局错误处理
     * =========================================================================
     * 捕获 try 块中未预期的所有错误:
     *   - JSON 解析失败（request.json() 抛出，如请求体为空或格式错误）
     *   - D1 数据库写入异常（表不存在、字段类型不匹配、配额超限）
     *   - crypto.randomUUID() 失败（理论上不会，但在极老的 Workers 运行时可能不支持）
     *
     * 处理策略:
     *   1. console.error 输出详细错误到 Cloudflare Functions 日志
     *   2. 向前端返回通用的 500 Internal Server Error
     *      注意: 不暴露内部错误细节给前端（防止信息泄露）
     *
     * 调试验证:
     *   Cloudflare Dashboard → Workers & Pages → 你的项目 → Functions → 实时日志
     *
     * 【修改】如需返回详细错误信息（仅开发环境），可在 .dev.vars 中添加 DEBUG 开关
     */
    console.error('Prayer request error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
