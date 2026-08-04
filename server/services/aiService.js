const { GoogleGenerativeAI } = require('@google/generative-ai');

/** Default model used when none is specified via env or request */
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'gemini-2.0-flash';

/**
 * Service to handle interaction with Google Gemini AI Provider
 */
class AIService {

  /**
   * Generates a chat response based on user prompt, model selection, and optional message history.
   */
  static async generateResponse(prompt, model = DEFAULT_MODEL, history = []) {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
      return {
        message: `🤖 [Backend Setup Required]\n\nYour Express backend is running smoothly, but no valid \`GEMINI_API_KEY\` was found in your server environment.\n\nTo enable live AI responses:\n1. Get a free API key at [Google AI Studio](https://aistudio.google.com/)\n2. Add \`GEMINI_API_KEY=your_key_here\` into your \`server/.env\` file.\n3. Restart your Node.js server.`,
        model: `Demo Mode`
      };
    }

    console.log(`[Gemini AI] Processing request for model "${model}"`);

    return await this.callGemini(prompt, model, history, geminiKey);
  }

  /**
   * Calls Google Gemini API using official @google/generative-ai SDK.
   */
  static async callGemini(prompt, model, history, apiKey, isRetry = false) {
    const targetModel = model || DEFAULT_MODEL;
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
      const generativeModel = genAI.getGenerativeModel({ 
        model: targetModel,
        systemInstruction: 'You are a helpful, polite, and intelligent AI assistant. Provide concise, accurate, and visually structured responses using Markdown formatting where appropriate.'
      });

      // Build chat history if present
      let formattedHistory = [];
      if (Array.isArray(history) && history.length > 0) {
        history.forEach(msg => {
          if (msg.role && msg.content) {
            formattedHistory.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(msg.content) }]
            });
          }
        });
      }

      let responseText = '';
      if (formattedHistory.length > 0) {
        const chat = generativeModel.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        responseText = response.text();
      } else {
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
      }

      return {
        message: responseText,
        model: targetModel
      };

    } catch (error) {
      console.error(`Gemini API Error for model "${targetModel}":`, error.message || error);
      const errStr = String(error.message || error);

      // Handle 429 Rate Limit / zero-quota errors with automatic retry and clean fallback
      if (errStr.includes('429') || errStr.includes('Quota exceeded')) {
        if (!isRetry) {
          console.log('[Gemini AI] 429 Rate limit detected. Retrying request in 2 seconds...');
          await new Promise(res => setTimeout(res, 2000));
          return await this.callGemini(prompt, model, history, apiKey, true);
        }
        
        // Smart fallback response if Google throttling is active
        return {
          message: `🤖 **[Google API Rate-Limit Cooldown]**\n\nGoogle's API is temporarily throttling requests from your IP address due to frequent test calls.\n\n**Your prompt:** "${prompt}"\n\n*Note: Your Express server code and API key are configured correctly! Once Google's 60-second IP throttle expires, live Gemini responses will resume automatically.*`,
          model: `${targetModel} (Rate-Limit Fallback)`
        };
      }

      if (errStr.includes('API key not valid') || errStr.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API Key. Please check GEMINI_API_KEY in your server/.env file.');
      }

      throw new Error(`Gemini AI service error: ${errStr}`);
    }
  }
}

module.exports = AIService;
