import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI moves will use fallback logic.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Move Endpoint
app.post("/api/move", async (req, res) => {
  try {
    const { board } = req.body;
    
    if (!board || !Array.isArray(board)) {
      return res.status(400).json({ error: "Invalid board state" });
    }

    const client = getGeminiClient();
    if (!client) {
      // Fallback if no API key
      const availableMoves = board
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);
      
      const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return res.json({ move, fallback: true, reason: "No API Key" });
    }

    const prompt = `Current Tic-Tac-Toe board state (0-8 index): ${JSON.stringify(board)}. 
"null" means empty, "X" and "O" are players. 
You are player "O". 
Pick the best move from the available "null" indices. 
Reply with ONLY the index number (0-8), no other text.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    const resultText = response.text?.trim() || "";
    const move = parseInt(resultText, 10);

    if (!isNaN(move) && move >= 0 && move <= 8 && board[move] === null) {
      res.json({ move });
    } else {
      const availableMoves = board
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);
      
      if (availableMoves.length > 0) {
        const fallbackMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        res.json({ move: fallbackMove, fallback: true, raw: resultText });
      } else {
        res.status(400).json({ error: "No moves available" });
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Silent fallback for better UX
    const { board } = req.body;
    const availableMoves = board
      .map((val: any, idx: number) => (val === null ? idx : null))
      .filter((val: any) : val is number => val !== null);
    
    if (availableMoves.length > 0) {
        const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        res.json({ move, fallback: true, error: true });
    } else {
        res.status(500).json({ error: "Failed to get AI move" });
    }
  }
});

async function start() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

start().catch(err => {
    console.error("Failed to start server:", err);
});
