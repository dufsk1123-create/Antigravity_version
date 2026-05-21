import { motion, AnimatePresence } from 'motion/react';
import { Trophy, AlertCircle } from 'lucide-react';
import { Player } from '../constants';

interface GameStatusProps {
  isThinking: boolean;
  winner: Player | 'draw' | null | undefined;
  xIsNext: boolean;
}

export function GameStatus({ isThinking, winner, xIsNext }: GameStatusProps) {
  return (
    <div className="h-24 flex flex-col justify-end">
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
            <div className="flex flex-col">
              <span className="font-mono text-xs text-fuchsia-400/80 tracking-widest block">⚡ AI THINKING (AI 연산 중...)</span>
              <span className="font-mono text-sm uppercase tracking-widest font-bold">Processing Move...</span>
            </div>
          </motion.div>
        ) : !winner ? (
          <motion.div
            key="turn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block">
              ● System Status: Online (기기 활성화)
            </span>
            <div className="flex flex-col">
              <span className={`font-mono text-xs tracking-wider ${xIsNext ? 'text-cyan-400/80' : 'text-fuchsia-400/80'}`}>
                {xIsNext ? "► PLAYER TURN (당신의 차례)" : "► AI TURN (상대방 차례)"}
              </span>
              <div className={`text-2xl font-bold uppercase tracking-tighter italic ${xIsNext ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                  {xIsNext ? "// PLR_STRAT_PHASE" : "// AI_COG_EVAL"}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 border-l-4 ${winner === 'draw' ? 'border-neutral-500 bg-neutral-900/50' : winner === 'X' ? 'border-cyan-500 bg-cyan-500/10' : 'border-fuchsia-500 bg-fuchsia-500/10'}`}
          >
            <div className="flex items-center space-x-3">
              {winner !== 'draw' ? (
                <Trophy className={`w-5 h-5 ${winner === 'X' ? 'text-cyan-400' : 'text-fuchsia-400'}`} />
              ) : (
                <AlertCircle className="w-5 h-5 text-neutral-400" />
              )}
              <div className="flex flex-col">
                <span className={`font-mono text-xs tracking-wider font-bold ${winner === 'draw' ? 'text-neutral-400' : winner === 'X' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                  {winner === 'draw' ? '[DRAW] 무승부 (승자 없음)' : winner === 'X' ? '[VICTORY] 승리 (PLAYER)' : '[DEFEAT] 패배 (AI)'}
                </span>
                <span className={`text-lg font-black uppercase italic tracking-tighter ${winner === 'draw' ? 'text-neutral-400' : winner === 'X' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                  {winner === 'draw' ? 'Session Terminated: No Advantage' : `${winner} Dominance Established`}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
