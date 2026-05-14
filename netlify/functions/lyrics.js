exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { title, original, streamer } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content:
`다음 곡의 가사를 알려주세요.

곡명: ${title}
원곡: ${original || '미상'}
스트리머: ${streamer}

가사만 출력해주세요.`
          }
        ],
      }),
    });

    const data = await response.json();

    console.log("Anthropic:", JSON.stringify(data));

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || 'Anthropic API Error'
        }),
      };
    }

    const text =
      data.content?.map(v => v.text).join('') ||
      '가사를 불러올 수 없습니다.';

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json'
      }
    };

  } catch (e) {
    console.error(e);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message
      }),
    };
  }
};
