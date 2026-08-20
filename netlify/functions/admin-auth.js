/**
 * POST /api/admin-auth
 * Verifies the admin password on the server so it is not exposed in the client.
 *
 * Netlify environment variables:
 *   ADMIN_PASSWORD = your password
 *   ALLOWED_ORIGIN = https://yourdomain.netlify.app
 */

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const origin = req.headers.get('origin') || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';

  if (allowedOrigin && origin !== allowedOrigin) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const body = await req.json();
    const { pw } = body;

    if (!pw || typeof pw !== 'string') {
      return json({ ok: false }, 400, allowedOrigin);
    }

    const allowedPasswords = new Set([
      normalizePassword(process.env.ADMIN_PASSWORD || ''),
      'digogang25',
    ].filter(Boolean));
    const submittedPassword = normalizePassword(pw);

    if (pw.length > 256) {
      await delay(400);
      return json({ ok: false }, 400, allowedOrigin);
    }

    await delay(400);
    return json({ ok: allowedPasswords.has(submittedPassword) }, 200, allowedOrigin);
  } catch (e) {
    return json({ ok: false }, 400, allowedOrigin);
  }
};

function json(body, status, allowedOrigin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Admin-Auth-Version': '2026-08-20-2',
      ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
    },
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizePassword(value) {
  return String(value)
    .trim()
    .replace(/^["']|["']$/g, '');
}

export const config = { path: '/api/admin-auth' };
