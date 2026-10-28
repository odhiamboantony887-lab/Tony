/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { buildSystemPrompt, estimateTokenCount } from './src/utils/chatUtils.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // System & Model Information
  const MODEL_NAME = 'gemini-3.8-flash';

  // API Status Check
  app.get('/api/status', (_req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
    res.json({
      ok: true,
      hasApiKey: hasKey,
      model: MODEL_NAME,
      environment: isProd ? 'production' : 'development',
      assistantName: 'TONY AI',
      supportedLanguages: ['English', 'Kiswahili', 'Sheng']
    });
  });

  // Setup, Limits, and Costs documentation endpoint
  app.get('/api/setup-info', (_req: Request, res: Response) => {
    res.json({
      model: MODEL_NAME,
      overview: 'TONY AI is powered by Google Gemini 3.8 Flash, a fast, highly capable multimodal model optimized for real-time mobile reasoning, chat, and multilingual fluency.',
      setupSteps: [
        {
          step: 1,
          title: 'Google AI Studio Secret Injection',
          description: 'In Google AI Studio, your GEMINI_API_KEY is automatically provisioned and securely attached to the server process via the Settings > Secrets panel. No manual pasting into client code is ever required.'
        },
        {
          step: 2,
          title: 'Local Development Environment',
          description: 'If cloning or running locally, create a .env file containing GEMINI_API_KEY="your_api_key_from_aistudio". The key remains strictly server-side and is never exposed in browser bundles.'
        },
        {
          step: 3,
          title: 'Direct Access',
          description: 'Once the key is present, TONY AI is instantly operational. Test asking questions in English, Kiswahili, or Sheng!'
        }
      ],
      usageLimits: {
        freeTier: {
          rpm: '15 requests per minute (RPM)',
          tpm: '1,000,000 tokens per minute (TPM)',
          rpd: '1,500 requests per day (RPD)',
          description: 'Google AI Studio free tier tier allows ample headroom for interactive personal use.'
        },
        payAsYouGo: {
          rpm: 'Up to 1,000+ RPM',
          tpm: '4,000,000+ TPM',
          rpd: 'No daily limit (subject to billing account balance)'
        }
      },
      costs: {
        currency: 'USD',
        inputPrice: '$0.075 per 1M input tokens (prompt + chat context)',
        outputPrice: '$0.30 per 1M output tokens (model response)',
        cachingPrice: '$0.01875 per 1M tokens (context caching where applicable)',
        summary: 'Gemini 3.8 Flash is extremely cost-effective. An average chat message of ~150 words costs approximately $0.00005, making 1,000 conversations cost less than 5 to 10 cents.'
      }
    });
  });

  // Chat Endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, tone, personaConfig, trainings } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: 'Invalid request: "messages" must be a non-empty array of conversation messages.'
        });
      }

      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please ensure the API key is set in Google AI Studio Secrets or your .env file.',
          missingKey: true
        });
      }

      // Initialize GoogleGenAI SDK with server-side User-Agent header
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Filter and format message history for Gemini SDK
      // Roles in @google/genai: 'user' and 'model'
      const formattedContents = messages
        .filter((m: { role: string; content: string }) => m.content && m.content.trim())
        .map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content.trim() }]
        }));

      if (formattedContents.length === 0) {
        return res.status(400).json({ error: 'No valid message content provided.' });
      }

      // Ensure first message starts with 'user' role
      while (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
        formattedContents.shift();
      }

      if (formattedContents.length === 0) {
        return res.status(400).json({ error: 'Conversation must start with a user message.' });
      }

      const systemInstruction = buildSystemPrompt(personaConfig || tone || 'balanced', trainings);

      // Call Gemini model with automatic resilience against spikes in demand
      let replyText = '';
      let usedModel = 'gemini-3.5-flash-lite';
      const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];

      for (const modelToAttempt of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelToAttempt,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.75,
            }
          });
          if (response.text) {
            replyText = response.text;
            usedModel = modelToAttempt;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelToAttempt} failed:`, modelErr.message?.slice(0, 100));
          // If this was the last model, throw the error
          if (modelToAttempt === modelsToTry[modelsToTry.length - 1]) {
            throw modelErr;
          }
        }
      }

      if (!replyText) {
        replyText = "Samahani, sikupata jibu kwa sasa. Tafadhali jaribu tena.";
      }

      const tokenEstimate = estimateTokenCount(replyText);

      return res.json({
        success: true,
        text: replyText,
        tokensUsed: tokenEstimate,
        model: usedModel
      });
    } catch (err: unknown) {
      console.error('Error in /api/chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown server error occurred';

      // Check if it's a quota or rate limit error
      const isQuotaError = errorMessage.toLowerCase().includes('quota') ||
                           errorMessage.toLowerCase().includes('resource_exhausted') ||
                           errorMessage.includes('429');

      return res.status(500).json({
        error: isQuotaError
          ? 'Quota or rate limit reached for the Gemini API. Please wait a few moments before sending another message.'
          : `Failed to generate response: ${errorMessage}`,
        isQuotaError
      });
    }
  });

  // Integrate Vite for development or serve built assets in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TONY AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[TONY AI] Failed to start server:', err);
  process.exit(1);
});
