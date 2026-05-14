exports.handler = async (event) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: '안녕하세요'
          }
        ]
      })
    });

    const text = await response.text();

    return {
      statusCode: response.status,
      body: text
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: e.message
    };
  }
};
