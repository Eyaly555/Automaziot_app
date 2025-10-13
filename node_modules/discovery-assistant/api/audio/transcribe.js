import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024, // 25MB limit (OpenAI's limit)
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get the uploaded audio file
    const audioFile = files.audio;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Get the actual file (formidable v3 returns array)
    const file = Array.isArray(audioFile) ? audioFile[0] : audioFile;

    // Validate file exists
    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'Invalid audio file' });
    }

    // Extract options from fields
    const model = (Array.isArray(fields.model) ? fields.model[0] : fields.model) || 'whisper-1';
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language;
    const prompt = Array.isArray(fields.prompt) ? fields.prompt[0] : fields.prompt;
    const temperature = Array.isArray(fields.temperature) ? fields.temperature[0] : fields.temperature;

    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), {
      filename: file.originalFilename || 'audio.mp3',
      contentType: file.mimetype || 'audio/mpeg'
    });
    formData.append('model', model);
    formData.append('response_format', 'verbose_json'); // Get detailed response with language info

    if (language) {
      formData.append('language', language);
    }
    if (prompt) {
      formData.append('prompt', prompt);
    }
    if (temperature !== undefined) {
      formData.append('temperature', temperature);
    }

    // Call OpenAI transcription API
    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    // Clean up the temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp file:', cleanupError);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI transcription error:', errorText);
      return res.status(response.status).json({
        error: `Transcription failed: ${errorText}`
      });
    }

    const result = await response.json();
    const duration = (Date.now() - startTime) / 1000;

    // Return formatted result
    res.json({
      text: result.text,
      language: result.language || language || 'unknown',
      model: model,
      duration: result.duration || duration,
      confidence: result.confidence
    });

  } catch (error) {
    console.error('Transcription API error:', error);

    // Clean up any temp files on error
    if (error.filepath) {
      try {
        fs.unlinkSync(error.filepath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      error: 'Transcription failed',
      message: error.message
    });
  }
}
