/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { RotateCcw, Hash, AlertTriangle } from 'lucide-react';
import { useTicTacToe } from './hooks/useTicTacToe';
import { ScoreBoard } from './components/ScoreBoard';
import { GameStatus } from './components/GameStatus';
import { GameBoard } from './components/GameBoard';

export default function App() {
  const {
    board,
    xIsNext,
    isThinking,
    scores,
    winner,
    winningLine,
    historyStep,
    apiError,
    handleClick,
    chronoShift,
    resetGame,
    clearScores,
  } = useTicTacToe();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-lg space-y-8">
        
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

        {/* Error Notification Glitch Alert Bar */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-l-4 border-red-500 bg-red-950/20 p-4 text-red-400 font-mono text-xs uppercase flex items-center justify-between shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
              <div className="flex flex-col">
                <span className="font-bold text-[10px] tracking-wider text-red-500">⚡ [WARNING: SYSTEM_ALERT]</span>
                <span className="text-[11px] normal-case text-neutral-300">AI 통신 지연: 로컬 임시 서브루틴을 가동합니다.</span>
              </div>
            </div>
            <span className="text-[9px] text-red-500/40 select-none">ERR_0x503</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
          <div className="space-y-6">
            <ScoreBoard scores={scores} />
            <GameStatus isThinking={isThinking} winner={winner} xIsNext={xIsNext} />
          </div>

          <GameBoard 
            board={board} 
            winner={winner} 
            winningLine={winningLine} 
            isThinking={isThinking} 
            xIsNext={xIsNext} 
            onClick={handleClick} 
          />
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-neutral-800 pt-6 gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block underline underline-offset-4 decoration-neutral-800">
              LocalStorage Registry (자동 기록 관리)
            </span>
            <p className="text-[11px] text-neutral-400 italic">Persistent state: Validated (기록 정상 보존)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearScores}
              className="p-3 border border-neutral-800 hover:border-neutral-700 text-neutral-600 hover:text-neutral-400 transition-all active:scale-95 group cursor-pointer"
              title="Purge Historical Data (스코어 초기화)"
            >
              <Hash className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Chrono-Shift (Undo) Button */}
            <button
              onClick={chronoShift}
              disabled={historyStep < 2 || isThinking || !!winner}
              className={`py-3 px-4 border font-mono text-xs uppercase tracking-wider font-bold transition-all active:scale-95 flex items-center space-x-2
                ${historyStep >= 2 && !isThinking && !winner
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer'
                  : 'border-neutral-800 text-neutral-600 bg-neutral-950/30 cursor-not-allowed opacity-40'
                }
              `}
              title="Chrono Shift (한 수 무르기)"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${historyStep >= 2 && !isThinking && !winner ? 'animate-spin' : ''}`} />
              <span>Chrono-Shift</span>
            </button>

            <button
              onClick={resetGame}
              className="py-3 px-6 bg-white text-black font-black uppercase tracking-tighter italic hover:bg-neutral-200 transition-colors flex items-center space-x-2 active:scale-95 cursor-pointer"
              title="Initialize New Session (새 세션 시작)"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Session</span>
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
