export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { title, original, streamer } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `다음 버츄얼 스트리머 커버곡의 가사를 알려주세요.\n곡명: ${title}\n원곡: ${original || '미상'}\n스트리머: ${streamer}\n\n가사를 모르면 "가사 정보를 찾을 수 없습니다."라고 답하세요. 가사만 출력하고 구절 사이는 빈 줄로 구분해주세요.`
        }],
      }),
    });

    const data = await response.json();
    const data = await response.json();

// 이 줄 추가
console.log('API response:', JSON.stringify(data));

const text = data.content?.map(b => b.text || '').join('') 
  || data.error?.message  // 에러 메시지도 반환
  || '가사를 불러올 수 없습니다.';
    const text = data.content?.map(b => b.text || '').join('') || '가사를 불러올 수 없습니다.';

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/lyrics' };
