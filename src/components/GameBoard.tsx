import { motion, AnimatePresence } from 'motion/react';
import { CellStack, PieceSize, SIZE_VALUES } from '../constants';
import { Action } from '../hooks/useTicTacToe';

interface GameBoardProps {
  board: CellStack[];
  selected: { source: 'supply' | 'board'; size?: PieceSize; index?: number } | null;
  activeLegalMoves: Action[];
  winner: 'X' | 'O' | 'draw' | null | undefined;
  winningLine: number[] | null | undefined;
  isThinking: boolean;
  xIsNext: boolean;
  onClick: (i: number) => void;
}

export function GameBoard({
  board,
  selected,
  activeLegalMoves,
  winner,
  winningLine,
  isThinking,
  xIsNext,
  onClick,
}: GameBoardProps) {
  // Helper to determine if a cell is a valid destination for the selected piece
  const isCellValidDestination = (i: number): boolean => {
    if (!selected || winner || isThinking || !xIsNext) return false;
    return activeLegalMoves.some(m => {
      if (selected.source === 'supply') {
        return m.type === 'place' && m.size === selected.size && m.to === i;
      } else {
        return m.type === 'move' && m.from === selected.index && m.to === i;
      }
    });
  };

  // Helper to check if a board piece at cell `i` is currently selected
  const isCellSelected = (i: number): boolean => {
    return !!selected && selected.source === 'board' && selected.index === i;
  };

  return (
    <div className="relative p-2 bg-[#E6DFD3] rounded-3xl shadow-[0_16px_50px_rgba(230,223,211,0.6)]">
      <div className="grid grid-cols-3 gap-2 bg-[#E6DFD3]">
        {board.map((stack, i) => {
          const topPiece = stack[stack.length - 1];
          const isValidDest = isCellValidDestination(i);
          const isSelected = isCellSelected(i);

          // Render size-proportional dimensions and fonts
          let sizeClass = '';
          let textClass = '';
          if (topPiece) {
            if (topPiece.size === 'L') {
              sizeClass = 'w-[84px] h-[84px] sm:w-[108px] sm:h-[108px]';
              textClass = 'text-5xl sm:text-6xl font-serif font-black';
            } else if (topPiece.size === 'M') {
              sizeClass = 'w-[64px] h-[64px] sm:w-[82px] sm:h-[82px]';
              textClass = 'text-3xl sm:text-4xl font-serif font-extrabold';
            } else {
              sizeClass = 'w-[44px] h-[44px] sm:w-[56px] sm:h-[56px]';
              textClass = 'text-xl sm:text-2xl font-serif font-bold';
            }
          }

          // Determine cursor class
          const isInteractive = !winner && !isThinking && xIsNext && (isValidDest || (topPiece && topPiece.player === 'X'));
          const cursorClass = isInteractive ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default';

          return (
            <button
              id={`square-${i}`}
              key={i}
              onClick={() => onClick(i)}
              disabled={winner ? true : isThinking ? true : !xIsNext ? true : !isInteractive}
              className={`
                w-24 h-24 sm:w-32 sm:h-32 bg-[#FFFDF9] flex items-center justify-center relative overflow-hidden group/cell
                rounded-2xl transition-all duration-300 border border-[#FFFDF9]
                ${cursorClass}
                ${isValidDest ? 'bg-[#FAF7F0] border-[#E07A5F]/30 hover:border-[#E07A5F]/60' : ''}
                ${winningLine?.includes(i) ? 'z-10' : ''}
              `}
            >
              {/* Subtle decorative dot for Mid-century toy feeling */}
              <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#E6DFD3]/40 select-none" />

              {/* Render Stacked History Beads (dots representing gobble level) */}
              {stack.length > 1 && (
                <div className="absolute bottom-2 right-2 flex space-x-[2px] opacity-75 z-20 bg-[#FFFDF9]/60 px-1 rounded-full border border-[#E6DFD3]/30">
                  {stack.slice(0, stack.length - 1).map((p, idx) => (
                    <span
                      key={idx}
                      className={`w-[6px] h-[6px] sm:w-[8px] sm:h-[8px] rounded-full border-[0.5px] border-white ${
                        p.player === 'X' ? 'bg-[#E07A5F]' : 'bg-[#81B29A]'
                      }`}
                      title={`${p.player === 'X' ? 'Player' : 'Gemini'} Size ${p.size}`}
                    />
                  ))}
                </div>
              )}

              {/* Render Top Piece */}
              <AnimatePresence mode="wait">
                {topPiece && (
                  <motion.div
                    key={`${topPiece.player}-${topPiece.size}`}
                    initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    className={`
                      ${sizeClass} ${textClass} rounded-full flex items-center justify-center text-white select-none
                      border-2 transition-transform duration-200
                      ${
                        topPiece.player === 'X'
                          ? 'bg-[#E07A5F] border-[#C96449] shadow-[inset_0_-4px_0_#C96449,0_6px_12px_rgba(224,122,95,0.3)]'
                          : 'bg-[#81B29A] border-[#699E84] shadow-[inset_0_-4px_0_#699E84,0_6px_12px_rgba(129,178,154,0.3)]'
                      }
                      ${isSelected ? 'ring-4 ring-offset-2 ring-[#E07A5F] ring-offset-[#FAF7F0] animate-pulse scale-95' : ''}
                    `}
                  >
                    {topPiece.player}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winning Highlight Overlay - Soft Retro Glow */}
              {winningLine?.includes(i) && topPiece && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`absolute inset-0 border-2 rounded-2xl ${
                    topPiece.player === 'X'
                      ? 'border-[#E07A5F]/50 bg-[#E07A5F]/10'
                      : 'border-[#81B29A]/50 bg-[#81B29A]/10'
                  }`}
                />
              )}

              {/* Valid Destination / Gobble Glow Ring */}
              {isValidDest && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    border-2 border-dashed border-[#E07A5F]/40 rounded-full animate-[spin_12s_linear_infinite]
                    ${
                      selected?.source === 'supply' && selected.size === 'L'
                        ? 'w-[84px] h-[84px] sm:w-[108px] sm:h-[108px]'
                        : selected?.source === 'supply' && selected.size === 'M'
                        ? 'w-[64px] h-[64px] sm:w-[82px] sm:h-[82px]'
                        : 'w-[44px] h-[44px] sm:w-[56px] sm:h-[56px]'
                    }
                  `} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
