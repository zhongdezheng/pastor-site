/**
 * Cloudflare Pages Function — Prayer Request Handler
 * POST /api/prayer
 *
 * Saves prayer requests to D1 database and optionally forwards to Google Sheets.
 * Set GOOGLE_SHEETS_WEBHOOK secret in Cloudflare Dashboard for Google Sheets integration.
 */
export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  try {
    const body = await request.json();
    const { name, anonymous, email, request: prayerRequest, lang, timestamp } = body;

    // Validate required fields
    if (!email || !prayerRequest) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const displayName = anonymous ? 'Anonymous' : (name || 'Anonymous');
    const id = crypto.randomUUID();

    // Store in D1 if available
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO prayer_requests (id, name, email, request, lang, anonymous, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, displayName, email, prayerRequest, lang || 'en', anonymous ? 1 : 0, timestamp || new Date().toISOString())
        .run();
    }

    // Forward to Google Sheets webhook if configured
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
        console.error('Google Sheets webhook failed:', e);
        // Non-critical, continue
      }
    }

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Prayer request error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
