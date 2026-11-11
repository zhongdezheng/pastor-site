var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/paypal/capture-order.js
async function getToken(env) {
  const auth8 = btoa(env.PAYPAL_CLIENT_ID + ":" + env.PAYPAL_SECRET);
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: { "Authorization": "Basic " + auth8, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  const d = await res.json();
  return d.access_token;
}
__name(getToken, "getToken");
async function onRequest(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
  try {
    const body = await request.json();
    const orderId = body.orderID || body.orderId;
    const token = await getToken(env);
    const res = await fetch("https://api-m.paypal.com/v2/checkout/orders/" + orderId + "/capture", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
    });
    const d = await res.json();
    if (d.status === "COMPLETED") {
      return new Response(JSON.stringify({ status: d.status, id: d.id }), { headers: h });
    }
    return new Response(JSON.stringify({ error: d.details?.[0]?.issue || d.name || "Capture failed", status: d.status }), { status: res.status, headers: h });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: h });
  }
}
__name(onRequest, "onRequest");

// api/paypal/config.js
async function onRequest2(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (!env.PAYPAL_CLIENT_ID) return new Response(JSON.stringify({ error: "PayPal not configured" }), { status: 503, headers: h });
  return new Response(JSON.stringify({ enabled: true, clientId: env.PAYPAL_CLIENT_ID, mode: "live" }), { headers: h });
}
__name(onRequest2, "onRequest");

// api/paypal/create-order.js
async function getToken2(env) {
  const auth8 = btoa(env.PAYPAL_CLIENT_ID + ":" + env.PAYPAL_SECRET);
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: { "Authorization": "Basic " + auth8, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  const d = await res.json();
  return d.access_token;
}
__name(getToken2, "getToken");
async function onRequest3(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
  try {
    const body = await request.json();
    const items = body.items || [];
    let total = parseFloat(body.amount) || 0;
    if (items.length) total = items.reduce((s, i) => s + parseFloat(i.price || 0) * parseInt(i.quantity || 1), 0);
    if (total <= 0) return new Response(JSON.stringify({ error: "No items or amount" }), { status: 400, headers: h });
    const token = await getToken2(env);
    const purchaseUnit = items.length ? { amount: { currency_code: "USD", value: total.toFixed(2), breakdown: { item_total: { currency_code: "USD", value: total.toFixed(2) } } }, items: items.map((i) => ({ name: i.name, quantity: String(i.quantity), unit_amount: { currency_code: "USD", value: parseFloat(i.price).toFixed(2) } })) } : { amount: { currency_code: "USD", value: total.toFixed(2) } };
    const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json", "Prefer": "return=representation" },
      body: JSON.stringify({ intent: "CAPTURE", purchase_units: [purchaseUnit] })
    });
    const d = await res.json();
    if (d.id) return new Response(JSON.stringify({ id: d.id, status: d.status }), { headers: h });
    return new Response(JSON.stringify({ error: d.details?.[0]?.issue || d.name || "Create failed" }), { status: res.status, headers: h });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: h });
  }
}
__name(onRequest3, "onRequest");

// api/products/reorder.js
function checkAuth(r, env) {
  const auth8 = r.headers.get("Authorization") || "";
  return (auth8.startsWith("Bearer ") ? auth8.slice(7) : auth8).trim() === env.ADMIN_TOKEN;
}
__name(checkAuth, "checkAuth");
async function onRequest4(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
  }
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  }
  const d = await request.json();
  const ids = Array.isArray(d.ids) ? d.ids : [];
  if (ids.length) {
    await env.DB.batch(ids.map(function(pid, i) {
      return env.DB.prepare("UPDATE products SET sort_order=? WHERE id=?").bind(i + 1, pid);
    }));
  }
  return new Response(JSON.stringify({ ok: true, count: ids.length }), { headers: h });
}
__name(onRequest4, "onRequest");

// api/products/[id].js
function checkAuth2(r, env) {
  const auth8 = r.headers.get("Authorization") || "";
  return (auth8.startsWith("Bearer ") ? auth8.slice(7) : auth8).trim() === env.ADMIN_TOKEN;
}
__name(checkAuth2, "checkAuth");
function formatProduct(r) {
  return {
    id: r.id,
    name_zh: r.name_zh,
    name_en: r.name_en,
    price: r.price,
    colors: (() => {
      try {
        return JSON.parse(r.colors || "[]");
      } catch (e) {
        return [];
      }
    })(),
    sizes: (() => {
      try {
        return JSON.parse(r.sizes || "[]");
      } catch (e) {
        return [];
      }
    })(),
    material: r.material,
    description_zh: r.description_zh,
    description_en: r.description_en,
    images: (() => {
      try {
        return JSON.parse(r.images || "[]");
      } catch (e) {
        return [];
      }
    })(),
    category_id: r.category_id,
    status: r.status,
    sort_order: r.sort_order,
    created_at: r.created_at,
    deleted: r.deleted
    // 【修改】2026-08-24：返回 deleted 字段（与 index.js 一致）
  };
}
__name(formatProduct, "formatProduct");
async function onRequest5(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/products\/(\d+)/)?.[1];
  if (!id) return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400, headers: h });
  if (m === "GET") {
    const r = await env.DB.prepare("SELECT * FROM products WHERE id=? AND deleted=0").bind(id).first();
    if (!r) return new Response(JSON.stringify({ ok: true, data: null }), { headers: h });
    return new Response(JSON.stringify({ ok: true, data: formatProduct(r) }), { headers: h });
  }
  if (!checkAuth2(request, env))
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "PUT" && url.pathname.endsWith("/status")) {
    const d = await request.json();
    await env.DB.prepare("UPDATE products SET status=? WHERE id=?").bind(d.status === 0 ? 0 : 1, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "PUT" && url.pathname.endsWith("/delete")) {
    await env.DB.prepare("UPDATE products SET deleted=1 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "PUT" && url.pathname.endsWith("/restore")) {
    await env.DB.prepare("UPDATE products SET deleted=0 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "PUT") {
    const d = await request.json();
    ["colors", "sizes", "images"].forEach(function(k) {
      if (d[k] !== void 0) d[k] = Array.isArray(d[k]) ? JSON.stringify(d[k]) : d[k];
    });
    const fields = ["name_zh", "name_en", "price", "colors", "sizes", "material", "description_zh", "description_en", "images", "category_id", "status", "sort_order", "deleted"];
    const sets = fields.filter((f) => d[f] !== void 0).map((f) => f + "=?").join(",");
    const vals = fields.filter((f) => d[f] !== void 0).map((f) => d[f]);
    await env.DB.prepare("UPDATE products SET " + sets + " WHERE id=?").bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "DELETE") {
    await env.DB.prepare("UPDATE products SET deleted=1 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest5, "onRequest");

// api/leads.js
function checkAuth3(r, env) {
  const auth8 = r.headers.get("Authorization") || "";
  return (auth8.startsWith("Bearer ") ? auth8.slice(7) : auth8).trim() === env.ADMIN_TOKEN;
}
__name(checkAuth3, "checkAuth");
function json(h, obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: h });
}
__name(json, "json");
async function onRequestGet({ request, env }) {
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (!checkAuth3(request, env)) return json(h, { error: "Unauthorized" }, 401);
  const rows = await env.DB.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  const data = rows.results.map((r) => ({
    ...r,
    materials: (() => {
      try {
        return JSON.parse(r.materials || "[]");
      } catch (e) {
        return [];
      }
    })()
  }));
  return json(h, { ok: true, data });
}
__name(onRequestGet, "onRequestGet");
async function onRequestPost({ request, env }) {
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  try {
    const d = await request.json();
    if (d.website) return json(h, { success: true, id: "skipped" });
    const name = String(d.name || "").trim();
    const contact = String(d.contact || "").trim();
    if (!name || !contact || name.length > 100 || contact.length > 200) {
      return json(h, { error: "Name and contact are required" }, 400);
    }
    const id = crypto.randomUUID();
    const materials = Array.isArray(d.materials) ? JSON.stringify(d.materials.slice(0, 12).map(String)) : "[]";
    const message = String(d.message || "").slice(0, 5e3);
    const company = String(d.company || "").slice(0, 200);
    const country = String(d.country || "").slice(0, 100);
    const lang = d.lang === "zh" ? "zh" : "en";
    const created = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    await env.DB.prepare(
      "INSERT INTO leads (id,name,company,country,contact,materials,message,lang,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)"
    ).bind(id, name, company, country, contact, materials, message, lang, "new", created).run();
    return json(h, { success: true, id });
  } catch (e) {
    return json(h, { error: "Server error" }, 500);
  }
}
__name(onRequestPost, "onRequestPost");
async function onRequestPut({ request, env }) {
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (!checkAuth3(request, env)) return json(h, { error: "Unauthorized" }, 401);
  try {
    const d = await request.json();
    const id = String(d.id || "");
    const status = ["new", "contacted", "quoted", "archived"].includes(d.status) ? d.status : null;
    if (!id || !status) return json(h, { error: "id and status required" }, 400);
    await env.DB.prepare("UPDATE leads SET status=? WHERE id=?").bind(status, id).run();
    return json(h, { ok: true });
  } catch (e) {
    return json(h, { error: "Server error" }, 500);
  }
}
__name(onRequestPut, "onRequestPut");

// api/prayer.js
async function onRequestPost2({ request, env }) {
  try {
    const body = await request.json();
    const { name, anonymous, email, request: prayerRequest, lang, timestamp } = body;
    if (!email || !prayerRequest) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const displayName = anonymous ? "Anonymous" : name || "Anonymous";
    const id = crypto.randomUUID();
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO prayer_requests (id, name, email, request, lang, anonymous, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, displayName, email, prayerRequest, lang || "en", anonymous ? 1 : 0, timestamp || (/* @__PURE__ */ new Date()).toISOString()).run();
    }
    if (env.GOOGLE_SHEETS_WEBHOOK) {
      try {
        await fetch(env.GOOGLE_SHEETS_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            name: displayName,
            email,
            request: prayerRequest,
            lang: lang || "en",
            anonymous: anonymous ? "Yes" : "No",
            timestamp: timestamp || (/* @__PURE__ */ new Date()).toISOString()
          })
        });
      } catch (e) {
        console.error("Google Sheets webhook failed:", e);
      }
    }
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Prayer request error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost2, "onRequestPost");

// api/auth.js
async function onRequest6(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (request.method === "GET") {
    const a = request.headers.get("Authorization") || "";
    const t = (a.startsWith("***") ? a.slice(3) : a).trim();
    if (t === env.ADMIN_TOKEN) return new Response(JSON.stringify({ ok: true }), { headers: h });
    return new Response(JSON.stringify({ ok: false }), { status: 401, headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest6, "onRequest");

// api/carousel.js
function checkAuth4(r, env) {
  const auth8 = r.headers.get("Authorization") || "";
  return (auth8.startsWith("***") ? auth8.slice(3) : auth8).trim() === env.ADMIN_TOKEN;
}
__name(checkAuth4, "checkAuth");
async function onRequest7(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/carousel\/(\d+)/)?.[1];
  if (m === "GET") {
    if (id) {
      const r = await env.DB.prepare("SELECT * FROM carousel_verses WHERE id=?").bind(id).first();
      return new Response(JSON.stringify({ ok: true, data: r || null }), { headers: h });
    }
    const rows = await env.DB.prepare("SELECT * FROM carousel_verses WHERE status=1 ORDER BY sort_order, id").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  if (!checkAuth4(request, env))
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "POST") {
    const d = await request.json();
    const r = await env.DB.prepare(
      "INSERT INTO carousel_verses (title_en,title_zh,content_en,content_zh,image,sort_order) VALUES (?1,?2,?3,?4,?5,?6)"
    ).bind(d.title_en || "", d.title_zh || "", d.content_en || "", d.content_zh || "", d.image || "", d.sort_order || 0).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }
  if (m === "PUT" && id) {
    const d = await request.json();
    const fields = ["title_en", "title_zh", "content_en", "content_zh", "image", "sort_order", "status"];
    const sets = fields.filter((f) => d[f] !== void 0).map((f) => `${f}=?`).join(", ");
    const vals = fields.filter((f) => d[f] !== void 0).map((f) => d[f]);
    await env.DB.prepare(`UPDATE carousel_verses SET ${sets} WHERE id=?`).bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "DELETE" && id) {
    await env.DB.prepare("UPDATE carousel_verses SET status=0 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest7, "onRequest");

// api/categories.js
function checkAuth5(r, env) {
  const auth8 = r.headers.get("Authorization") || "";
  return (auth8.startsWith("Bearer ") ? auth8.slice(7) : auth8).trim() === env.ADMIN_TOKEN;
}
__name(checkAuth5, "checkAuth");
async function onRequest8(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/categories\/(\d+)/)?.[1];
  if (m === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM categories ORDER BY sort_order, id").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  if (!checkAuth5(request, env))
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "POST") {
    const d = await request.json();
    const r = await env.DB.prepare(
      "INSERT INTO categories (name_zh, name_en, slug, sort_order, status) VALUES (?1, ?2, ?3, ?4, ?5)"
    ).bind(d.name_zh || "", d.name_en || "", d.slug || "", d.sort_order || 0, d.status === void 0 ? 1 : d.status).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }
  if (!id) return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400, headers: h });
  if (m === "PUT") {
    const d = await request.json();
    const fields = ["name_zh", "name_en", "slug", "sort_order", "status"];
    const sets = fields.filter((f) => d[f] !== void 0).map((f) => f + "=?").join(",");
    const vals = fields.filter((f) => d[f] !== void 0).map((f) => d[f]);
    if (!sets) return new Response(JSON.stringify({ ok: true }), { headers: h });
    await env.DB.prepare("UPDATE categories SET " + sets + " WHERE id=?").bind(...vals, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "DELETE") {
    await env.DB.prepare("UPDATE categories SET status=0 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest8, "onRequest");

// api/courses.js
function auth(r, e) {
  const t = r.headers.get("Authorization") || "";
  return (t.startsWith("***") ? t.slice(3) : t).trim() === e.ADMIN_TOKEN;
}
__name(auth, "auth");
async function onRequest9(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  const id = new URL(request.url).pathname.match(/\/api\/courses\/(\d+)/)?.[1];
  if (m === "GET") {
    if (id) {
      const r = await env.DB.prepare("SELECT * FROM courses WHERE id=?").bind(id).first();
      return new Response(JSON.stringify({ ok: true, data: r || null }), { headers: h });
    }
    const rows = await env.DB.prepare("SELECT * FROM courses WHERE status=1 ORDER BY sort_order,id").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  if (!auth(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "POST") {
    const d = await request.json();
    const r = await env.DB.prepare("INSERT INTO courses (title_zh,title_en,description_zh,description_en,icon,level,lessons,is_free,sort_order) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)").bind(d.title_zh || "", d.title_en || "", d.description_zh || "", d.description_en || "", d.icon || "\u{1F4D6}", d.level || "\u5165\u95E8", d.lessons || 6, d.is_free || 1, d.sort_order || 0).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }
  if (m === "PUT" && id) {
    const d = await request.json();
    const fs = ["title_zh", "title_en", "description_zh", "description_en", "icon", "level", "lessons", "is_free", "sort_order", "status"];
    const sets = fs.filter((f) => d[f] !== void 0).map((f) => f + "=?").join(",");
    const vs = fs.filter((f) => d[f] !== void 0).map((f) => d[f]);
    await env.DB.prepare(`UPDATE courses SET ${sets} WHERE id=?`).bind(...vs, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "DELETE" && id) {
    await env.DB.prepare("UPDATE courses SET status=0 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest9, "onRequest");

// api/dashboard.js
function auth2(r, e) {
  var t = r.headers.get("Authorization") || "";
  var v = (t.startsWith("***") ? t.slice(3) : t).trim();
  return v === e.ADMIN_TOKEN;
}
__name(auth2, "auth");
async function onRequest10(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (!auth2(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  var today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  var month = today.slice(0, 7) + "-01";
  var p1 = env.DB.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at >= ?").bind(today);
  var p2 = env.DB.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at >= ?").bind(month);
  var p3 = env.DB.prepare("SELECT COUNT(*) as c FROM products WHERE deleted=0");
  var p4 = env.DB.prepare("SELECT COUNT(*) as c FROM categories WHERE status=1");
  var p5 = env.DB.prepare("SELECT COUNT(*) as c FROM prayers");
  var p6 = env.DB.prepare("SELECT COUNT(*) as c FROM testimonies WHERE published=1");
  var p7 = env.DB.prepare("SELECT COUNT(*) as c FROM courses WHERE status=1");
  var p8 = env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
  var results = await env.DB.batch([p1, p2, p3, p4, p5, p6, p7, p8]);
  var otc = results[0].results[0].c;
  var omc = results[1].results[0].c;
  var pac = results[2].results[0].c;
  var cac = results[3].results[0].c;
  var prc = results[4].results[0].c;
  var tsc = results[5].results[0].c;
  var coc = results[6].results[0].c;
  var ros = results[7].results;
  return new Response(JSON.stringify({ ok: true, data: {
    orders: { today_count: otc, today_amount: 0, month_count: omc, month_amount: 0 },
    products: { total: pac, active: pac, categories: cac },
    prayers: { total: prc, unreplied: prc },
    content: { testimonies: tsc, courses: coc },
    recent_orders: ros || []
  } }), { headers: h });
}
__name(onRequest10, "onRequest");

// api/hero.js
function checkAuth6(r, env) {
  const auth8 = r.headers.get("Authorization") || "";
  return (auth8.startsWith("***") ? auth8.slice(3) : auth8).trim() === env.ADMIN_TOKEN;
}
__name(checkAuth6, "checkAuth");
async function onRequest11(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  const url = new URL(request.url);
  const id = url.pathname.match(/\/api\/hero\/(\d+)/)?.[1];
  if (m === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM hero_images WHERE status=1 ORDER BY sort_order, id").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  if (!checkAuth6(request, env))
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "POST") {
    const d = await request.json();
    const r = await env.DB.prepare("INSERT INTO hero_images (url, sort_order) VALUES (?1, ?2)").bind(d.url || "", d.sort_order || 0).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }
  if (m === "DELETE" && id) {
    await env.DB.prepare("UPDATE hero_images SET status=0 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest11, "onRequest");

// api/login.js
async function onRequest12(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (request.method === "POST") {
    const d = await request.json();
    if (d.user === "admin" && d.pass === env.ADMIN_TOKEN)
      return new Response(JSON.stringify({ ok: true, token: env.ADMIN_TOKEN, user: "admin" }), { headers: h });
    return new Response(JSON.stringify({ ok: false, error: "Invalid credentials" }), { status: 401, headers: h });
  }
  if (request.method === "GET") {
    const a = request.headers.get("Authorization") || "";
    const t = (a.startsWith("Bearer ") ? a.slice(7) : a).trim();
    if (t === env.ADMIN_TOKEN) return new Response(JSON.stringify({ ok: true }), { headers: h });
    return new Response(JSON.stringify({ ok: false }), { status: 401, headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed", method: request.method }), { status: 405, headers: h });
}
__name(onRequest12, "onRequest");

// api/orders.js
function auth3(r, e) {
  const t = r.headers.get("Authorization") || "";
  return (t.startsWith("***") ? t.slice(3) : t).trim() === e.ADMIN_TOKEN;
}
__name(auth3, "auth");
async function onRequest13(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (!auth3(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest13, "onRequest");

// api/ping.js
async function onRequest14(ctx) {
  return new Response(JSON.stringify({ ok: true, message: "pong", time: Date.now() }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
__name(onRequest14, "onRequest");

// api/prayers.js
function auth4(r, e) {
  const t = r.headers.get("Authorization") || "";
  return (t.startsWith("***") ? t.slice(3) : t).trim() === e.ADMIN_TOKEN;
}
__name(auth4, "auth");
async function onRequest15(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  if (m === "POST") {
    const d = await request.json();
    await env.DB.prepare("INSERT INTO prayers (name,email,content) VALUES (?1,?2,?3)").bind(d.name || "", d.email || "", d.content || "").run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (!auth4(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM prayers ORDER BY created_at DESC").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest15, "onRequest");

// api/products/index.js
function checkAuth7(r, env) {
  const auth8 = r.headers.get("Authorization") || "";
  return (auth8.startsWith("Bearer ") ? auth8.slice(7) : auth8).trim() === env.ADMIN_TOKEN;
}
__name(checkAuth7, "checkAuth");
function formatProduct2(r) {
  return {
    id: r.id,
    name_zh: r.name_zh,
    name_en: r.name_en,
    price: r.price,
    colors: (() => {
      try {
        return JSON.parse(r.colors || "[]");
      } catch (e) {
        return [];
      }
    })(),
    sizes: (() => {
      try {
        return JSON.parse(r.sizes || "[]");
      } catch (e) {
        return [];
      }
    })(),
    material: r.material,
    description_zh: r.description_zh,
    description_en: r.description_en,
    images: (() => {
      try {
        return JSON.parse(r.images || "[]");
      } catch (e) {
        return [];
      }
    })(),
    category_id: r.category_id,
    status: r.status,
    sort_order: r.sort_order,
    created_at: r.created_at,
    deleted: r.deleted
    // 【修改】2026-08-24：返回 deleted 字段（后台"🗑 已删除产品"区判断用）
  };
}
__name(formatProduct2, "formatProduct");
async function onRequest16(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  const url = new URL(request.url);
  if (m === "GET") {
    const auth8 = request.headers.get("Authorization") || "";
    const isAdmin = (auth8.startsWith("Bearer ") ? auth8.slice(7) : auth8).trim() === env.ADMIN_TOKEN;
    const sql = isAdmin ? "SELECT * FROM products ORDER BY sort_order, id" : "SELECT * FROM products WHERE status=1 AND deleted=0 ORDER BY sort_order, id";
    const rows = await env.DB.prepare(sql).all();
    return new Response(JSON.stringify({ ok: true, data: rows.results.map(formatProduct2) }), { headers: h });
  }
  if (!checkAuth7(request, env))
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "POST" && url.pathname.endsWith("/reorder")) {
    const d = await request.json();
    const ids = Array.isArray(d.ids) ? d.ids : [];
    if (ids.length) {
      await env.DB.batch(ids.map(function(pid, i) {
        return env.DB.prepare("UPDATE products SET sort_order=? WHERE id=?").bind(i + 1, pid);
      }));
    }
    return new Response(JSON.stringify({ ok: true, count: ids.length }), { headers: h });
  }
  if (m === "POST") {
    const d = await request.json();
    const r = await env.DB.prepare(
      "INSERT INTO products (name_zh,name_en,price,colors,sizes,material,description_zh,description_en,images,category_id,sort_order) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)"
    ).bind(d.name_zh, d.name_en || "", d.price || 0, d.colors || "[]", d.sizes || "[]", d.material || "", d.description_zh || "", d.description_en || "", d.images || "[]", d.category_id || 0, d.sort_order || 0).run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest16, "onRequest");

// api/site-config.js
function checkAuth8(request, env) {
  const auth8 = request.headers.get("Authorization") || "";
  const token = (auth8.startsWith("Bearer ") ? auth8.slice(7) : auth8).trim();
  return token === env.ADMIN_TOKEN;
}
__name(checkAuth8, "checkAuth");
async function onRequest17(context) {
  const { request, env } = context;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (request.method === "GET") {
    const rows = await env.DB.prepare("SELECT key, value FROM settings").all();
    const s = {};
    for (const r of rows.results) s[r.key] = r.value;
    return new Response(JSON.stringify({
      ok: true,
      data: {
        site_title: s.site_title || "Livingstone",
        site_title_zh: s.site_title_zh || "\u6D3B\u77F3",
        site_tagline: s.site_tagline || "",
        site_tagline_zh: s.site_tagline_zh || "",
        site_email: s.site_email || "",
        site_whatsapp: s.site_whatsapp || "",
        site_phone: s.site_phone || "",
        site_address: s.site_address || "",
        site_logo_url: s.site_logo_url || "",
        site_primary_color: s.site_primary_color || "",
        site_accent_color: s.site_accent_color || "",
        // 【修改】site_footer_text_zh: 中文页脚文字（2026-08-21 新增；后台站点设置"页脚文字(中文)"保存/回显用，缺了保存后刷新会丢）
        site_footer_text: s.site_footer_text || "",
        site_footer_text_zh: s.site_footer_text_zh || "",
        notify_email: s.notify_email || "",
        googleSheetsWebhook: s.googleSheetsWebhook || "",
        notify_order: s.notify_order || "off"
      }
    }), { headers: h });
  }
  if (request.method === "POST") {
    if (!checkAuth8(request, env))
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
    const data = await request.json();
    const stmt = env.DB.prepare("INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value=?2");
    const batch = [];
    for (const [k, v] of Object.entries(data)) batch.push(stmt.bind(k, String(v)));
    await env.DB.batch(batch);
    return new Response(JSON.stringify({ ok: true, saved: batch.length }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest17, "onRequest");

// api/testimonies.js
function auth5(r, e) {
  const t = r.headers.get("Authorization") || "";
  return (t.startsWith("***") ? t.slice(3) : t).trim() === e.ADMIN_TOKEN;
}
__name(auth5, "auth");
async function onRequest18(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  const id = new URL(request.url).pathname.match(/\/api\/testimonies\/(\d+)/)?.[1];
  if (m === "GET") {
    if (id) {
      const r = await env.DB.prepare("SELECT * FROM testimonies WHERE id=?").bind(id).first();
      return new Response(JSON.stringify({ ok: true, data: r || null }), { headers: h });
    }
    const rows = await env.DB.prepare("SELECT * FROM testimonies WHERE published=1 ORDER BY created_at DESC").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  if (!auth5(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "POST") {
    const d = await request.json();
    const r = await env.DB.prepare("INSERT INTO testimonies (title_zh,title_en,content_zh,content_en,excerpt_zh,excerpt_en,date,author,images) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)").bind(d.title_zh || "", d.title_en || "", d.content_zh || "", d.content_en || "", d.excerpt_zh || "", d.excerpt_en || "", d.date || "", d.author || "", d.images || "[]").run();
    return new Response(JSON.stringify({ ok: true, id: r.meta.last_row_id }), { headers: h });
  }
  if (m === "PUT" && id) {
    const d = await request.json();
    const fs = ["title_zh", "title_en", "content_zh", "content_en", "excerpt_zh", "excerpt_en", "date", "author", "images", "published"];
    const sets = fs.filter((f) => d[f] !== void 0).map((f) => f + "=?").join(",");
    const vs = fs.filter((f) => d[f] !== void 0).map((f) => d[f]);
    await env.DB.prepare(`UPDATE testimonies SET ${sets} WHERE id=?`).bind(...vs, id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  if (m === "DELETE" && id) {
    await env.DB.prepare("UPDATE testimonies SET published=0 WHERE id=?").bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest18, "onRequest");

// api/users.js
function auth6(r, e) {
  const t = r.headers.get("Authorization") || "";
  return (t.startsWith("***") ? t.slice(3) : t).trim() === e.ADMIN_TOKEN;
}
__name(auth6, "auth");
async function onRequest19(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  if (!auth6(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (request.method === "GET") {
    const rows = await env.DB.prepare("SELECT id,username,display_name,role,active,created_at FROM users WHERE active=1").all();
    return new Response(JSON.stringify({ ok: true, data: rows.results }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest19, "onRequest");

// api/vision.js
function auth7(r, e) {
  const t = r.headers.get("Authorization") || "";
  return (t.startsWith("***") ? t.slice(3) : t).trim() === e.ADMIN_TOKEN;
}
__name(auth7, "auth");
async function onRequest20(ctx) {
  const { request, env } = ctx;
  const h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" };
  const m = request.method;
  if (m === "GET") {
    const r = await env.DB.prepare("SELECT * FROM vision WHERE id=1").first();
    return new Response(JSON.stringify({ ok: true, data: r || {} }), { headers: h });
  }
  if (!auth7(request, env)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: h });
  if (m === "PUT" || m === "POST") {
    const d = await request.json();
    await env.DB.prepare("UPDATE vision SET title_zh=?1,title_en=?2,content_zh=?3,content_en=?4 WHERE id=1").bind(d.title_zh || "", d.title_en || "", d.content_zh || "", d.content_en || "").run();
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: h });
}
__name(onRequest20, "onRequest");

// ../.wrangler/tmp/pages-t7fOT2/functionsRoutes-0.40115411286304914.mjs
var routes = [
  {
    routePath: "/api/paypal/capture-order",
    mountPath: "/api/paypal",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/paypal/config",
    mountPath: "/api/paypal",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/paypal/create-order",
    mountPath: "/api/paypal",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/products/reorder",
    mountPath: "/api/products",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/products/:id",
    mountPath: "/api/products",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/leads",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/leads",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/leads",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/prayer",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/auth",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/api/carousel",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  },
  {
    routePath: "/api/categories",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest8]
  },
  {
    routePath: "/api/courses",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest9]
  },
  {
    routePath: "/api/dashboard",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest10]
  },
  {
    routePath: "/api/hero",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest11]
  },
  {
    routePath: "/api/login",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest12]
  },
  {
    routePath: "/api/orders",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest13]
  },
  {
    routePath: "/api/ping",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest14]
  },
  {
    routePath: "/api/prayers",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest15]
  },
  {
    routePath: "/api/products",
    mountPath: "/api/products",
    method: "",
    middlewares: [],
    modules: [onRequest16]
  },
  {
    routePath: "/api/site-config",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest17]
  },
  {
    routePath: "/api/testimonies",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest18]
  },
  {
    routePath: "/api/users",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest19]
  },
  {
    routePath: "/api/vision",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest20]
  }
];

// ../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
