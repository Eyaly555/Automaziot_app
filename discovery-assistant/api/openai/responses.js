import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, messages, seed, max_output_tokens, temperature, response_format } = req.body;

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        seed,
        max_completion_tokens: max_output_tokens,
        temperature,
        response_format
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    // Transform response to match expected format if needed
    const responseData = {
      output_text: data.choices?.[0]?.message?.content,
      usage: data.usage,
      model: data.model,
      choices: data.choices,
      ...data
    };

    res.json(responseData);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
