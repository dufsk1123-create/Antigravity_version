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

export interface Piece {
  player: 'X' | 'O';
  size: 'S' | 'M' | 'L';
}
export type CellStack = Piece[];
export interface Supply {
  L: number;
  M: number;
  S: number;
}
export interface PlayerSupplies {
  X: Supply;
  O: Supply;
}

const SIZE_VALUES = { S: 1, M: 2, L: 3 };

function getLegalMovesForO(board: CellStack[], supplyO: Supply): any[] {
  const legal: any[] = [];
  const sizes: ('S' | 'M' | 'L')[] = ['S', 'M', 'L'];
  
  // 1. Placement options
  for (const size of sizes) {
    if (supplyO[size] > 0) {
      const sizeVal = SIZE_VALUES[size];
      for (let to = 0; to < 9; to++) {
        const stack = board[to];
        if (stack.length === 0) {
          legal.push({ type: 'place', size, to });
        } else {
          const top = stack[stack.length - 1];
          if (sizeVal > SIZE_VALUES[top.size]) {
            legal.push({ type: 'place', size, to });
          }
        }
      }
    }
  }

  // 2. Movement options
  for (let from = 0; from < 9; from++) {
    const stackFrom = board[from];
    if (stackFrom.length > 0) {
      const topFrom = stackFrom[stackFrom.length - 1];
      if (topFrom.player === 'O') {
        const sizeVal = SIZE_VALUES[topFrom.size];
        for (let to = 0; to < 9; to++) {
          if (from === to) continue;
          const stackTo = board[to];
          if (stackTo.length === 0) {
            legal.push({ type: 'move', from, to });
          } else {
            const topTo = stackTo[stackTo.length - 1];
            if (sizeVal > SIZE_VALUES[topTo.size]) {
              legal.push({ type: 'move', from, to });
            }
          }
        }
      }
    }
  }

  return legal;
}

export async function generateNextMove(board: CellStack[], supply: PlayerSupplies): Promise<{ action: any; reason: string; fallback?: boolean; error?: boolean }> {
  const client = getGeminiClient();
  const legalMoves = getLegalMovesForO(board, supply.O);

  if (legalMoves.length === 0) {
    throw new Error("No moves available");
  }

  const fallbackMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  const fallbackReason = "통신 지연으로 제 마음대로 예쁘게 한 수 놓아봤어요! 🧸";

  if (!client) {
    return { action: fallbackMove, reason: fallbackReason, fallback: true };
  }

  const prompt = `
You are playing a strategic board game called "Cozy Gobblet" (Stacking Tic-Tac-Toe / Gobblet Gobblers variant).
You are player "O". The opponent is player "X".
The board is a 3x3 grid with indices 0 to 8:
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8

### Current Game State
- Board stacks: ${JSON.stringify(board)}
  (Each index is an array representing a stack. The last element is the top-most visible piece. S < M < L.)
- Your unused Supply (O): ${JSON.stringify(supply.O)}
- Opponent unused Supply (X): ${JSON.stringify(supply.X)}

### Rules
1. Sizes: S (Small), M (Medium), L (Large).
2. A larger piece can gobble (be placed on top of) a smaller piece (e.g. L can cover M or S; M can cover S). You cannot cover same or larger size.
3. You can either place a piece from your supply onto a cell, or move your own top-most O piece from one board cell to another.
4. Win by getting 3 visible O pieces in a row (horizontal, vertical, diagonal).

### Available Legal Moves (Select EXACTLY one from this list):
${JSON.stringify(legalMoves)}

Select the best strategic move to block X and build your line of 3.
You MUST reply with ONLY a raw JSON object in the following format. Do not use Markdown code blocks. Do not write anything else.

JSON Format:
{
  "action": {
    "type": "place",
    "size": "L" | "M" | "S",
    "to": 0..8
  } or {
    "type": "move",
    "from": 0..8,
    "to": 0..8
  },
  "reason": "A warm, whimsical strategic explanation of your move in Korean (maximum 2 sentences, include cozy emojis like 🧸, ✿, 💭, ↩)."
}
`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    let resultText = response.text?.trim() || "";
    
    // Clean JSON markdown tags if present
    if (resultText.startsWith("```json")) {
      resultText = resultText.substring(7);
    }
    if (resultText.endsWith("```")) {
      resultText = resultText.substring(0, resultText.length - 3);
    }
    resultText = resultText.trim();

    const data = JSON.parse(resultText);

    if (data.action) {
      const act = data.action;
      // Validate that it is one of the legal moves
      const isLegal = legalMoves.some(m => {
        if (act.type === 'place') {
          return m.type === 'place' && m.size === act.size && m.to === act.to;
        } else if (act.type === 'move') {
          return m.type === 'move' && m.from === act.from && m.to === act.to;
        }
        return false;
      });

      if (isLegal) {
        return {
          action: act,
          reason: data.reason || "정성껏 한 수를 골랐어요! ✿"
        };
      }
    }

    console.warn("AI returned illegal move, falling back...", resultText);
    return { action: fallbackMove, reason: fallbackReason, fallback: true };
  } catch (error) {
    console.error("Gemini API Error in generateNextMove:", error);
    return { action: fallbackMove, reason: fallbackReason, fallback: true, error: true };
  }
}
