const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');

/**
 * POST /api/chat
 * Accepts { prompt: string, model?: string, history?: Array }
 * Returns { success: boolean, message: string, model: string, timestamp: string }
 */
router.post('/chat', async (req, res) => {
  try {
    const { prompt, model, history } = req.body;

    // 1. Input Validation
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Prompt field is required and must be a string.'
      });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Message cannot be empty.'
      });
    }

    if (trimmedPrompt.length > 4000) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Message exceeds maximum allowed length of 4000 characters.'
      });
    }

    // 2. Determine selected AI model
    const selectedModel = model || process.env.DEFAULT_MODEL || 'gemini-2.0-flash';

    // 3. Call AI Service
    const aiResponse = await AIService.generateResponse(trimmedPrompt, selectedModel, history);

    // 4. Return success response
    return res.status(200).json({
      success: true,
      message: aiResponse.message,
      model: aiResponse.model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling /api/chat route:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'An internal server error occurred while processing your request.'
    });
  }
});

module.exports = router;
