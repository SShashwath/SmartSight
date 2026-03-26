const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/analyze
const analyzeImage = async (req, res) => {
  try {
    const { imageBase64, imageUrl } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // If no API key configured, return mock response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.json({
        success: true,
        mock: true,
        description: 'This appears to be an indoor scene. I can see a desk with a laptop computer, a coffee mug on the right side, some books stacked on the left, and a lamp providing warm lighting. The room has light-colored walls and appears to be a home office or study area.',
        objects: [
          { label: 'Laptop', confidence: 0.97, position: 'center' },
          { label: 'Coffee Mug', confidence: 0.93, position: 'right' },
          { label: 'Books', confidence: 0.89, position: 'left' },
          { label: 'Desk Lamp', confidence: 0.91, position: 'top-right' },
          { label: 'Keyboard', confidence: 0.85, position: 'center-bottom' },
        ],
        accessibility_summary: 'Safe indoor environment. No immediate obstacles detected. The desk area is clear for navigation.',
      });
    }

    const imageContent = imageBase64
      ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: 'image_url', image_url: { url: imageUrl } };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an AI assistant helping visually impaired users understand their environment. 
              Analyze this image and provide:
              1. A detailed, natural language description of what you see
              2. A list of specific objects with their positions
              3. Any potential hazards or obstacles
              4. An accessibility summary
              
              Format your response as JSON with these fields:
              {
                "description": "detailed description",
                "objects": [{"label": "object name", "confidence": 0.95, "position": "location"}],
                "hazards": ["hazard1", "hazard2"],
                "accessibility_summary": "brief summary for safe navigation"
              }`,
            },
            imageContent,
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { description: content, objects: [] };
    } catch {
      parsed = { description: content, objects: [] };
    }

    res.json({ success: true, ...parsed });
  } catch (error) {
    console.error('AI analyze error:', error);
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ success: false, message: 'Invalid OpenAI API key' });
    }
    res.status(500).json({ success: false, message: 'Error analyzing image. Please try again.' });
  }
};

// POST /api/ai/transcribe
const transcribeVoice = async (req, res) => {
  try {
    console.log('Transcription requested...', {
      file: req.file ? `Received: ${req.file.originalname} (${req.file.size} bytes)` : 'NOT RECEIVED',
      key_present: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
      env_port: process.env.PORT
    });

    if (!req.file) {
      console.warn('Transcribe: No file received');
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    }


    // OpenAI key check
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Clean up the file even for mock mode
      if (req.file) fs.unlinkSync(req.file.path);
      return res.json({ success: true, text: 'This is a mock transcription because no API key was found.' });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: await OpenAI.toFile(fs.createReadStream(req.file.path), 'voice_command.webm'),
      model: 'whisper-1',
    });

    // Clean up temporary file
    if (req.file) fs.unlinkSync(req.file.path);

    res.json({ success: true, text: transcription.text });
  } catch (error) {
    console.error('AI transcribe error details:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      response: error.response?.data || error.response
    });

    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    const statusCode = error.status || 500;
    res.status(statusCode).json({ 
      success: false, 
      message: error.message || 'Error transcribing audio', 
      details: error.message 
    });
  }
};


module.exports = { analyzeImage, transcribeVoice };

