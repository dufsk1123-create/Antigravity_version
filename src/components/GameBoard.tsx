import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../constants';

interface GameBoardProps {
  board: Player[];
  winner: Player | 'draw' | null | undefined;
  winningLine: number[] | null | undefined;
  isThinking: boolean;
  xIsNext: boolean;
  onClick: (i: number) => void;
}

export function GameBoard({ board, winner, winningLine, isThinking, xIsNext, onClick }: GameBoardProps) {
  return (
    <div className="relative p-1 bg-neutral-900 rounded-none border border-neutral-800">
      <div className="grid grid-cols-3 gap-1 bg-neutral-800">
        {board.map((sq, i) => (
          <button
            id={`square-${i}`}
            key={i}
            onClick={() => onClick(i)}
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
  );
}
