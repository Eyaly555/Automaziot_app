import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: req.body.message || 'Say "Hello" in Hebrew' }],
        max_completion_tokens: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `OpenAI test failed: ${errorText}` });
    }

    res.json({ success: true, message: 'OpenAI connection successful' });
  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({ error: 'Test connection failed' });
  }
}
