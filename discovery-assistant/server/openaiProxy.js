const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI Responses API Proxy
app.post('/api/openai/responses', async (req, res) => {
  try {
    const { model, messages, seed, max_output_tokens, temperature, response_format } = req.body;

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
    res.json(data);
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for OpenAI connection
app.post('/api/openai/test', async (req, res) => {
  try {
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 OpenAI proxy server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 OpenAI responses: http://localhost:${PORT}/api/openai/responses`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/openai/test`);
});
