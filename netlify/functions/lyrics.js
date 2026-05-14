exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { title, original, streamer } = JSON.parse(event.body);

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
        messages: [{ role: 'user', content: `다음 버츄얼 스트리머 커버곡의 가사를 알려주세요.\n곡명: ${title}\n원곡: ${original || '미상'}\n스트리머: ${streamer}\n\n가사를 모르면 "가사 정보를 찾을 수 없습니다."라고 답하세요. 가사만 출력하고 구절 사이는 빈 줄로 구분해주세요.` }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || data.error?.message || '가사를 불러올 수 없습니다.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};

export const config = { path: '/api/lyrics' };
