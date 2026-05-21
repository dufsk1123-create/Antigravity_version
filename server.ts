import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { generateNextMove } from "./ai.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// AI Move Endpoint
app.post("/api/move", async (req, res) => {
  try {
    const { board, supply } = req.body;
    
    if (!board || !Array.isArray(board) || !supply) {
      return res.status(400).json({ error: "Invalid board or supply state" });
    }

    const result = await generateNextMove(board, supply);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "No moves available") {
      res.status(400).json({ error: error.message });
    } else {
      console.error("Server API Error:", error);
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
