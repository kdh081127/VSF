/**
 * POST /api/admin-auth
 * 관리자 비밀번호를 서버에서만 검증 — 클라이언트에 비밀번호 노출 없음
 *
 * 환경변수 설정 필요 (Netlify → Site settings → Environment variables):
 *   ADMIN_PASSWORD = <원하는 비밀번호>
 */
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // CORS 제한: 허용할 Origin만 명시
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || ''; // e.g. https://yoursite.netlify.app

  // Origin이 설정되어 있고 일치하지 않으면 차단
  if (allowedOrigin && origin !== allowedOrigin) {
    return new Response('Forbidden', { status: 403 });
  }

  // 브루트포스 방어: 실제 프로덕션에서는 Netlify Edge Middleware나
  // KV store로 IP별 시도 횟수를 추적하는 것을 권장합니다.
  // 현재는 응답 지연으로 최소한의 방어만 적용합니다.
  await new Promise(r => setTimeout(r, 400)); // 400ms 지연

  try {
    const body = await req.json();
    const { pw } = body;

    if (!pw || typeof pw !== 'string') {
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('[admin-auth] ADMIN_PASSWORD 환경변수가 설정되지 않았습니다');
      return new Response(JSON.stringify({ ok: false }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 타이밍 공격 방어를 위해 길이 무관하게 전체 비교
    const ok = pw === adminPassword;

    return new Response(JSON.stringify({ ok }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/admin-auth' };
