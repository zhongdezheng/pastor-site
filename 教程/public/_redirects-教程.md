# `_redirects` 教程 —— Cloudflare Pages URL 重定向规则

## 文件位置

```
public/_redirects
```

## 用途

这是 Cloudflare Pages 的 **URL 重定向规则文件**。部署到 Cloudflare Pages 后，CF 会自动读取此文件并应用其中定义的重定向规则。

## 规则格式

每行一条规则，格式为：

```
源路径  目标路径  HTTP状态码
```

- **源路径（Source）**：用户访问的原始 URL 路径（相对路径，以 `/` 开头）
- **目标路径（Destination）**：重定向到的新 URL 路径
- **HTTP 状态码**：通常是 `301`（永久重定向）或 `302`（临时重定向）

> ⚠️ 注意：分隔符是 **制表符（Tab）** 或 **空格**，三部分之间可以有多个空格。

## 当前规则逐条解释

```
/  /zh/  301
```
- **作用**：访问网站根路径 `/` 时，自动跳转到 `/zh/`（中文首页）
- **原因**：目标受众主要是中文用户，所以默认进入中文版

```
/en/products  /en/products/  301
/en/prayer    /en/prayer/    301
/en/contact   /en/contact/   301
/zh/products  /zh/products/  301
/zh/prayer    /zh/prayer/    301
/zh/contact   /zh/contact/   301
```
- **作用**：将 **无尾斜杠** 的 URL 重定向到 **有尾斜杠** 的版本
- **原因**：Astro 构建输出目录时，每个页面对应一个 `index.html` 文件放在以页面命名的目录中（如 `en/products/index.html`）。浏览器访问 `/en/products/` 会自动读取该 `index.html`，但访问 `/en/products`（无尾斜杠）可能找不到文件。301 重定向统一到有尾斜杠版本
- **状态码 301**：永久重定向，浏览器和搜索引擎会缓存这个映射

## 如何新增规则

假设新增了一个英文页面 "about"（对应路径 `/en/about/`）：

### 1. 添加尾斜杠规范化规则

```
/en/about  /en/about/  301
```

### 2. 添加中文版（如果有）

```
/zh/about  /zh/about/  301
```

### 3. 规则顺序

- 常规做法：先放根路径重定向，再放各语言页面
- 规则按行顺序匹配，第一匹配的生效
- 更具体的规则应该放在更通用的规则前面

### 4. 验证

部署后访问无尾斜杠的 URL，浏览器地址栏应自动变为有尾斜杠版本。

## 注意事项

- Cloudflare Pages 每次部署时读取 `public/_redirects`，修改后需要重新部署才生效
- 最多支持 2000 条规则（Cloudflare 限制），一般网站用不了这么多
- 支持 `*` 通配符和 `:splat` 占位符做高级匹配，但当前项目用不到
- 规则文件不需要手动添加到 `.gitignore`，正常情况下应提交到 Git

## 相关文件

- 所有页面的 `.astro` 源文件位于 `src/pages/` 下
- 构建输出目录 `dist/` 中会包含一份拷贝的 `_redirects`
