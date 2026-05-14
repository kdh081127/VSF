exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: 'Method Not Allowed'
        }),
      };
    }

    const body = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `곡 제목: ${body.title}

원곡: ${body.original || '미상'}

스트리머: ${body.streamer}

이 곡의 가사를 알려주세요.`
          }
        ]
      })
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: data.content?.[0]?.text || '가사를 찾을 수 없습니다.'
      }),
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message
      }),
    };
  }
};
