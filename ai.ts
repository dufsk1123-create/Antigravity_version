import { GoogleGenAI } from "@google/genai";

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

export async function generateNextMove(board: any[]): Promise<{ move: number; fallback?: boolean; reason?: string; raw?: string; error?: boolean }> {
  const client = getGeminiClient();
  
  const availableMoves = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((val): val is number => val !== null);
    
  if (availableMoves.length === 0) {
    throw new Error("No moves available");
  }

  if (!client) {
    // Fallback if no API key
    const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return { move, fallback: true, reason: "No API Key" };
  }

  const prompt = `Current Tic-Tac-Toe board state (0-8 index): ${JSON.stringify(board)}. 
"null" means empty, "X" and "O" are players. 
You are player "O". 
Pick the best move from the available "null" indices. 
Reply with ONLY the index number (0-8), no other text.`;

  try {
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
      return { move };
    } else {
      const fallbackMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return { move: fallbackMove, fallback: true, raw: resultText };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    const fallbackMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return { move: fallbackMove, fallback: true, error: true };
  }
}
