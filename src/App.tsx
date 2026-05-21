/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Trophy, Hash, Cpu, Loader2, User } from 'lucide-react';

type Player = 'X' | 'O' | null;

interface Scores {
  X: number;
  O: number;
  draws: number;
}

export default function App() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [scores, setScores] = useState<Scores>(() => {
    const saved = localStorage.getItem('tictactoe-scores');
    return saved ? JSON.parse(saved) : { X: 0, O: 0, draws: 0 };
  });

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }

    if (squares.every(sq => sq !== null)) {
      return { winner: 'draw' as const, line: null };
    }

    return null;
  };

  const gameInfo = checkWinner(board);
  const winner = gameInfo?.winner;
  const winningLine = gameInfo?.line;

  const handleAIMove = useCallback(async (currentBoard: Player[]) => {
    if (winner) return;
    
    setIsThinking(true);
    try {
      const response = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: currentBoard }),
      });
      
      const data = await response.json();
      
      if (data.move !== undefined) {
        const newBoard = [...currentBoard];
        newBoard[data.move] = 'O';
        setBoard(newBoard);
        setXIsNext(true);
      }
    } catch (error) {
      console.error('AI Move failed:', error);
      // Fallback: simple random move if API fails
      const available = currentBoard.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);
      if (available.length > 0) {
        const move = available[Math.floor(Math.random() * available.length)];
        const newBoard = [...currentBoard];
        newBoard[move] = 'O';
        setBoard(newBoard);
        setXIsNext(true);
      }
    } finally {
      setIsThinking(false);
    }
  }, [winner]);

  useEffect(() => {
    if (winner) {
      const newScores = { ...scores };
      if (winner === 'X') newScores.X += 1;
      else if (winner === 'O') newScores.O += 1;
      else if (winner === 'draw') newScores.draws += 1;
      
      setScores(newScores);
      localStorage.setItem('tictactoe-scores', JSON.stringify(newScores));
    }
  }, [winner]);

  // Trigger AI move when it's O's turn
  useEffect(() => {
    if (!xIsNext && !winner && !isThinking) {
      handleAIMove(board);
    }
  }, [xIsNext, winner, board, handleAIMove, isThinking]);

  const handleClick = (i: number) => {
    if (board[i] || winner || isThinking || !xIsNext) return;

    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setXIsNext(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const clearScores = () => {
    const freshScores = { X: 0, O: 0, draws: 0 };
    setScores(freshScores);
    localStorage.setItem('tictactoe-scores', JSON.stringify(freshScores));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-lg space-y-12">
        
        {/* Header - Brutalist Style */}
        <div className="relative group">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-baseline space-x-3"
          >
            <h1 className="text-6xl font-bold tracking-tighter uppercase leading-none italic">
              Tic<span className="text-neutral-800">.</span>Tac<span className="text-neutral-800">.</span>Toe
            </h1>
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">v2.0 // AI Powered</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
          
          <div className="space-y-8">
            {/* Score Board - Bento Style */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-[1px] bg-neutral-800 border border-neutral-800 rounded-none overflow-hidden shadow-2xl shadow-cyan-500/5"
            >
              <div className="bg-[#0a0a0a] p-4 group hover:bg-neutral-900 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <User className="w-3 h-3 text-cyan-400" />
                  <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-tighter">HUMAN [X]</span>
                </div>
                <div className="text-4xl font-bold font-mono tracking-tighter text-cyan-500">{scores.X}</div>
              </div>
              <div className="bg-[#0a0a0a] p-4 border-x border-neutral-800 hover:bg-neutral-900 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Hash className="w-3 h-3 text-neutral-500" />
                  <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-tighter">DRAWS</span>
                </div>
                <div className="text-4xl font-bold font-mono tracking-tighter text-neutral-400">{scores.draws}</div>
              </div>
              <div className="bg-[#0a0a0a] p-4 hover:bg-neutral-900 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Cpu className="w-3 h-3 text-fuchsia-500" />
                  <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-tighter">GEMINI [O]</span>
                </div>
                <div className="text-4xl font-bold font-mono tracking-tighter text-fuchsia-500">{scores.O}</div>
              </div>
            </motion.div>

            {/* Status & Turn */}
            <div className="h-20 flex flex-col justify-end">
              <AnimatePresence mode="wait">
                {isThinking ? (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 text-fuchsia-400"
                  >
                    <div className="flex space-x-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                          className="w-1 h-4 bg-current"
                        />
                      ))}
                    </div>
                    <span className="font-mono text-sm uppercase tracking-widest font-bold">Processing Move...</span>
                  </motion.div>
                ) : !winner ? (
                  <motion.div
                    key="turn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">System Readiness: Active</span>
                    <div className={`text-2xl font-bold uppercase tracking-tighter italic ${xIsNext ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                       {xIsNext ? "// PLR_STRAT_PHASE" : "// AI_COG_EVAL"}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="winner"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-l-4 ${winner === 'draw' ? 'border-neutral-500 bg-neutral-900/50' : winner === 'X' ? 'border-cyan-500 bg-cyan-500/10' : 'border-fuchsia-500 bg-fuchsia-500/10'}`}
                  >
                    <div className="flex items-center space-x-3">
                      {winner !== 'draw' && <Trophy className={`w-5 h-5 ${winner === 'X' ? 'text-cyan-400' : 'text-fuchsia-400'}`} />}
                      <span className={`text-2xl font-black uppercase italic tracking-tighter ${winner === 'draw' ? 'text-neutral-400' : winner === 'X' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                        {winner === 'draw' ? 'Session Terminated: No Advantage' : `${winner} Dominance Established`}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Game Board - Architectural Visible Grid */}
          <div className="relative p-1 bg-neutral-900 rounded-none border border-neutral-800">
            <div className="grid grid-cols-3 gap-1 bg-neutral-800">
              {board.map((sq, i) => (
                <button
                  id={`square-${i}`}
                  key={i}
                  onClick={() => handleClick(i)}
                  disabled={!!sq || !!winner || isThinking || !xIsNext}
                  className={`
                    w-24 h-24 sm:w-32 sm:h-32 bg-[#050505] flex items-center justify-center relative overflow-hidden group/cell
                    ${!sq && !winner && xIsNext ? 'hover:bg-neutral-950 cursor-crosshair' : 'cursor-default'}
                    ${winningLine?.includes(i) ? 'z-10' : ''}
                  `}
                >
                  {/* Subtle Grid Coordinates */}
                  <span className="absolute top-1 left-1 font-mono text-[8px] text-neutral-800 select-none">
                    0x0{i}
                  </span>

                  <AnimatePresence>
                    {sq && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        className={`text-5xl sm:text-7xl font-black italic tracking-tighter ${sq === 'X' ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]'}`}
                      >
                        {sq}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Winning Highlight Overlay */}
                  {winningLine?.includes(i) && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute inset-0 border-2 ${sq === 'X' ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-fuchsia-500/50 bg-fuchsia-500/5'}`}
                    />
                  )}
                  
                  {/* Hover Indicator */}
                  {!sq && !winner && xIsNext && (
                    <div className="absolute inset-0 opacity-0 group-hover/cell:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 border border-cyan-500/20 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-8">
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest block underline underline-offset-4 decoration-neutral-800">
              LocalStorage Registry
            </span>
            <p className="text-[10px] text-neutral-400 italic">Persistent state: Validated</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearScores}
              className="p-3 border border-neutral-800 hover:border-neutral-700 text-neutral-600 hover:text-neutral-400 transition-all active:scale-95 group"
              title="Purge Historical Data"
            >
              <Hash className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
            <button
              onClick={resetGame}
              className="py-3 px-8 bg-white text-black font-black uppercase tracking-tighter italic hover:bg-neutral-200 transition-colors flex items-center space-x-3 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Initialize New Session</span>
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="grid grid-cols-4 gap-4 opacity-5">
            {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-1 bg-white" />
            ))}
        </div>
      </div>
    </div>
  );
}
