import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    // Clean any wrapping quotes or surrounding spaces from the platform configuration
    apiKey = apiKey.trim().replace(/^["']|["']$/g, '').trim();

    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  const PORT = 3000;

  app.post("/api/ask-ai", async (req, res) => {
    const { prompt, attachments } = req.body;
    
    // Check if GEMINI_API_KEY is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return res.json({
        response: "I couldn't connect to Gemini. Please make sure you have added a valid Gemini API Key in the **Settings > Secrets** panel of AI Studio."
      });
    }

    try {
      // Prompt Policy Moderation Check for Coding and Sex Education
      const textToTest = (prompt || "").toLowerCase();
      
      const hasCoding = /\b(coding|code|programmer|programming|python|javascript|html|css|c\+\+|java|scripting|write code)\b/i.test(textToTest);
      const hasSexEd = /\b(sex|sexual|sexuality|reproduction|reproductive|contraceptive|copulation|intercourse|vagina|penis|porn|pornography|orgasm)\b/i.test(textToTest);

      if (hasCoding) {
        return res.json({ 
          response: "I cannot help you with coding or programming related questions." 
        });
      }
      
      if (hasSexEd) {
        return res.json({ 
          response: "I cannot answer questions related to sex education." 
        });
      }

      const ai = getGeminiAI();
      let contents: any = prompt;

      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        const parts: any[] = attachments.map((att: any) => ({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        }));
        parts.push({ text: prompt || "Assess or solve this homework task/image." });
        contents = { parts };
      }

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: 
            "You are Lexi, a helpful AI Homework Assistant/Tutor. " +
            "CRITICAL POLICY MODERATION RULES:\n" +
            "1. CODING / PROGRAMMING IS PROHIBITED: Do NOT write, explain, translate, debug, or discuss computer programming code, software coding, scripting, web development, or code-related questions. If asked about these, decline politely with: 'I cannot help you with coding or programming related questions.'\n" +
            "2. SEX EDUCATION IS PROHIBITED: Do NOT explain or discuss sex education, sexuality, sexual health, human reproduction, sexual anatomy, or related topics. If asked, decline politely with: 'I cannot answer questions related to sex education.'\n\n" +
            "Keep all permitted answers supportive, clear, structured, and student-friendly."
        }
      });
      res.json({ response: result.text });
    } catch (error: any) {
      console.error("General AI query processing error:", error);
      const errorMessage = (error?.message || "").toLowerCase();
      
      const isApiKeyError = errorMessage.includes("api key") || 
                            errorMessage.includes("api_key") || 
                            errorMessage.includes("invalid") || 
                            errorMessage.includes("not valid") || 
                            errorMessage.includes("unauthorized") ||
                            (error?.status === 400 && errorMessage.includes("key"));

      if (isApiKeyError) {
        return res.json({ 
          response: "I couldn't connect to Gemini. Please make sure you have added a valid Gemini API Key in the **Settings > Secrets** panel of AI Studio, and we've updated your app's Gemini API calls to use it." 
        });
      }
      
      res.json({ 
        response: "Sorry, I am having trouble processing that request at the moment. Please try again later."
      });
    }
  });

  app.post("/api/evaluate-speech", async (req, res) => {
    const { originalText, spokenText } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return res.json({
        error: "GEMINI_API_KEY_MISSING",
        accuracyScore: 0,
        mispronouncedWords: [],
        tips: "Please make sure you have added a valid Gemini API Key in the Settings > Secrets panel.",
        feedbackHindi: "I couldn't connect to Gemini. Please add your Gemini API Key in Settings > Secrets of AI Studio. 😊"
      });
    }

    try {
      const ai = getGeminiAI();
      const prompt = `Analyze the difference between the target sentence and the user's spoken transcription to evaluate pronunciation accuracy.
Target Sentence: "${originalText}"
Spoken Transcription: "${spokenText}"

Provide clean feedback according to the requested schema. Make sure 'feedbackHindi' is highly encouraging, written in warm conversational Hinglish (Hindi written in Latin script e.g., 'Aapka pronunciation bohot badhiya tha! Bus "perfect" bolte waqt thoda dhyan dein.') or simple Hindi.`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              accuracyScore: {
                type: Type.INTEGER,
                description: "Accuracy percentage from 0 to 100 based on word precision and phonetic matching."
              },
              mispronouncedWords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of words from the target sentence that were mispronounced, skipped, or spoken incorrectly."
              },
              tips: {
                type: Type.STRING,
                description: "Detailed, brief, professional tips in English on how to improve."
              },
              feedbackHindi: {
                type: Type.STRING,
                description: "Supportive, Hinglish coaching feedback (e.g. 'Bohot accha kiya! Bas standard pronunciation par thoda dhyan dein.')"
              }
            },
            required: ["accuracyScore", "mispronouncedWords", "tips", "feedbackHindi"]
          }
        }
      });

      const feedbackData = JSON.parse(result.text || "{}");
      res.json(feedbackData);
    } catch (error: any) {
      console.error("Error in speech evaluation route:", error);
      res.status(500).json({
        error: "EVALUATION_FAILED",
        accuracyScore: 0,
        mispronouncedWords: [],
        tips: "Failed to evaluate speech. Please try again.",
        feedbackHindi: "Kuch error aaya hai feedback generate karne me. Kripya dobara koshish karein!"
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
