import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Hash, AlertCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useTicTacToe } from './hooks/useTicTacToe';
import { ScoreBoard } from './components/ScoreBoard';
import { GameStatus } from './components/GameStatus';
import { GameBoard } from './components/GameBoard';
import { PieceSize } from './constants';

export default function App() {
  const {
    board,
    supply,
    selected,
    xIsNext,
    isThinking,
    scores,
    winner,
    winningLine,
    historyStep,
    apiError,
    aiReason,
    handleClick,
    selectSupplyPiece,
    chronoShift,
    resetGame,
    clearScores,
    activeLegalMoves,
  } = useTicTacToe();

  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#2F3E46] flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#E07A5F]/20">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header - Elegant Mid-Century Serif Style */}
        <div className="relative group">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline space-x-3 justify-center sm:justify-start"
          >
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight uppercase leading-none italic">
              Cozy<span className="text-[#E07A5F]">.</span>Gobblet
            </h1>
            <div className="h-[2px] flex-1 bg-[#E6DFD3]" />
            <span className="font-sans text-[11px] text-[#8E9AAF] uppercase tracking-widest font-extrabold">v3.0 // Stacking Edition</span>
          </motion.div>
        </div>

        {/* Error Notification Pastel Amber Alert Bar */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border border-[#F2CC8F] bg-[#F2CC8F]/10 p-4 text-[#8F6F40] font-sans text-xs rounded-2xl flex items-center justify-between shadow-[0_4px_15px_rgba(242,204,143,0.15)] relative overflow-hidden"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-4 h-4 text-[#E9C46A] animate-pulse" />
              <div className="flex flex-col">
                <span className="font-extrabold text-[10px] tracking-wider uppercase text-[#B58A3C]">⚡ [Notice: AI Connection Delayed]</span>
                <span className="text-[11px] text-[#5C4F3C]">Gemini와 통신이 지연되어 로컬 예비 알고리즘으로 대처합니다.</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
          
          {/* Left Panel: Stats, Status, Dialogue and Supplies */}
          <div className="space-y-5">
            <ScoreBoard scores={scores} />
            <GameStatus isThinking={isThinking} winner={winner} xIsNext={xIsNext} />
            
            {/* Gemini Strategic Reason Speech Bubble */}
            <AnimatePresence mode="wait">
              {aiReason && (
                <motion.div
                  key={aiReason}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="relative bg-[#FFFDF9] border border-[#E6DFD3] p-4 rounded-2xl shadow-[0_8px_24px_rgba(230,223,211,0.35)] text-xs text-[#2F3E46] leading-relaxed italic"
                >
                  <div className="absolute top-[-8px] left-10 w-4 h-4 bg-[#FFFDF9] border-t border-l border-[#E6DFD3] rotate-45" />
                  <span className="font-extrabold text-[10px] uppercase text-[#81B29A] tracking-wider block mb-1">💭 Gemini's strategic mind:</span>
                  "{aiReason}"
                </motion.div>
              )}
            </AnimatePresence>

            {/* Supples Shelf Container */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Player Supply Shelf */}
              <div className="bg-[#FFFDF9] border border-[#E6DFD3] rounded-3xl p-4 shadow-[0_8px_24px_rgba(230,223,211,0.3)] space-y-3">
                <span className="font-sans text-[10px] sm:text-[11px] text-[#8E9AAF] uppercase tracking-widest block font-extrabold underline underline-offset-4 decoration-[#E6DFD3] truncate">
                  Your Supply (내 말 보관함) ✿
                </span>
                <div className="flex justify-around items-end pt-3 pb-2 h-16 relative">
                  {(['S', 'M', 'L'] as PieceSize[]).map(size => {
                    const count = supply.X[size];
                    const isSelected = selected?.source === 'supply' && selected.size === size;
                    
                    let btnSizeClass = '';
                    if (size === 'L') {
                      btnSizeClass = 'w-11 h-11 text-lg';
                    } else if (size === 'M') {
                      btnSizeClass = 'w-9 h-9 text-sm';
                    } else {
                      btnSizeClass = 'w-7 h-7 text-xs';
                    }
                    
                    return (
                      <button
                        key={size}
                        disabled={count === 0 || winner ? true : isThinking ? true : !xIsNext}
                        onClick={() => selectSupplyPiece(size)}
                        className={`
                          relative flex flex-col items-center justify-center border-2 rounded-full transition-all duration-200
                          ${
                            count === 0 
                              ? 'opacity-25 cursor-not-allowed border-[#E6DFD3] bg-[#FAF7F0] text-[#8E9AAF] shadow-none' 
                              : 'bg-[#E07A5F] text-white border-[#C96449] shadow-[inset_0_-3px_0_#C96449,0_4px_8px_rgba(224,122,95,0.25)] cursor-pointer hover:scale-105 active:scale-95'
                          }
                          ${isSelected ? 'ring-4 ring-offset-2 ring-[#E07A5F] ring-offset-[#FAF7F0] scale-110 font-black animate-pulse z-10' : ''}
                          ${btnSizeClass}
                        `}
                        title={`Select Size ${size} Piece (${count} left)`}
                      >
                        <span>X</span>
                        
                        {/* Remaining Piece Badge Count */}
                        <span className="absolute -top-1 -right-2 bg-[#2F3E46] text-[#FAF7F0] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                          {count}
                        </span>
                        
                        {/* Label underneath */}
                        <span className="font-sans text-[8px] text-[#8E9AAF] absolute -bottom-5 font-extrabold uppercase tracking-wider select-none">
                          {size}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gemini Supply Shelf */}
              <div className="bg-[#FFFDF9] border border-[#E6DFD3] rounded-3xl p-4 shadow-[0_8px_24px_rgba(230,223,211,0.3)] space-y-3">
                <span className="font-sans text-[10px] sm:text-[11px] text-[#8E9AAF] uppercase tracking-widest block font-extrabold underline underline-offset-4 decoration-[#E6DFD3] truncate">
                  Gemini Supply (상대 보관함) 🧸
                </span>
                <div className="flex justify-around items-end pt-3 pb-2 h-16 relative">
                  {(['S', 'M', 'L'] as PieceSize[]).map(size => {
                    const count = supply.O[size];
                    
                    let pieceSizeClass = '';
                    if (size === 'L') {
                      pieceSizeClass = 'w-11 h-11 text-lg';
                    } else if (size === 'M') {
                      pieceSizeClass = 'w-9 h-9 text-sm';
                    } else {
                      pieceSizeClass = 'w-7 h-7 text-xs';
                    }
                    
                    return (
                      <div
                        key={size}
                        className={`
                          relative flex flex-col items-center justify-center border-2 rounded-full select-none transition-all duration-200
                          ${
                            count === 0 
                              ? 'opacity-25 border-[#E6DFD3] bg-[#FAF7F0] text-[#8E9AAF] shadow-none' 
                              : 'bg-[#81B29A] text-white border-[#699E84] shadow-[inset_0_-3px_0_#699E84,0_4px_8px_rgba(129,178,154,0.25)]'
                          }
                          ${pieceSizeClass}
                        `}
                        title={`Gemini Size ${size} Pieces Remaining (${count})`}
                      >
                        <span>O</span>
                        
                        {/* Remaining Piece Badge Count */}
                        <span className="absolute -top-1 -right-2 bg-[#2F3E46] text-[#FAF7F0] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                          {count}
                        </span>
                        
                        {/* Label underneath */}
                        <span className="font-sans text-[8px] text-[#8E9AAF] absolute -bottom-5 font-extrabold uppercase tracking-wider select-none">
                          {size}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel: Game Board */}
          <div className="flex flex-col items-center justify-center">
            <GameBoard 
              board={board} 
              selected={selected}
              activeLegalMoves={activeLegalMoves}
              winner={winner} 
              winningLine={winningLine} 
              isThinking={isThinking} 
              xIsNext={xIsNext} 
              onClick={handleClick} 
            />
          </div>
        </div>

        {/* How to Play Accordion Guide */}
        <div className="border border-[#E6DFD3] bg-[#FFFDF9] rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(230,223,211,0.25)] transition-all">
          <button
            onClick={() => setRulesOpen(!rulesOpen)}
            className="w-full p-4 flex items-center justify-between text-[#2F3E46] font-sans text-xs uppercase tracking-widest font-extrabold hover:bg-[#FAF7F0]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#E07A5F]" />
              <span>How to Play Cozy Gobblet (게임 규칙 안내) 📔</span>
            </div>
            {rulesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {rulesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-[#E6DFD3]"
              >
                <div className="p-5 text-xs text-[#2F3E46] leading-relaxed space-y-3 font-sans">
                  <p className="font-extrabold text-[#E07A5F] text-[13px] border-b border-[#E6DFD3] pb-1">
                    코지 고블렛(Cozy Gobblet) 규칙 가이드
                  </p>
                  <ul className="list-disc list-inside space-y-2.5 text-[#5D6B73]">
                    <li>
                      <strong className="text-[#2F3E46]">말 구성:</strong> 각 플레이어는 세 가지 크기(<strong className="text-[#E07A5F]">대 L</strong>, <strong className="text-[#E07A5F]">중 M</strong>, <strong className="text-[#E07A5F]">소 S</strong>)의 말을 각각 2개씩(총 6개) 가지고 시작합니다.
                    </li>
                    <li>
                      <strong className="text-[#2F3E46]">행동 옵션:</strong> 자신의 턴에 <strong className="text-[#2F3E46]">1) 보관함의 새로운 말을 내려놓거나</strong>, <strong className="text-[#2F3E46]">2) 이미 보드에 놓인 내 말 하나를 이동</strong>시킬 수 있습니다.
                    </li>
                    <li>
                      <strong className="text-[#2F3E46]">잡아먹기 (Gobble):</strong> 칸이 비어있지 않더라도, 놓으려는 말보다 칸의 맨 위 말이 <strong className="text-[#E07A5F] underline underline-offset-2">크기가 더 작다면</strong> 덮어씌울 수 있습니다! (L &gt; M &gt; S)
                    </li>
                    <li>
                      <strong className="text-[#2F3E46]">덮개 들추기:</strong> 보드 위의 내 말을 다른 칸으로 이동시키면, 그 아래 가려져 있던 원래의 말이 다시 드러나 칸을 차지합니다.
                    </li>
                    <li>
                      <strong className="text-[#2F3E46]">승리 조건:</strong> 가로, 세로, 대각선 중 한 방향으로 내 색상 말 3개가 연속해서 보이게 만들면 승리합니다!
                      <br />
                      <span className="text-[10.5px] text-[#C96449] font-extrabold italic block mt-1.5 bg-[#FAF7F0] p-2 rounded-lg border border-[#E6DFD3]/50">
                        ⚠️ 주의: 보드 위의 내 말을 옮겨서 아래에 덮여있던 상대의 말이 다시 노출되었을 때, 그로 인해 상대방의 3줄이 먼저 이어지면 즉시 상대방이 승리하게 됩니다!
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-[#E6DFD3] pt-6 gap-4">
          <div className="space-y-1">
            <span className="font-sans text-[11px] text-[#8E9AAF] uppercase tracking-widest block font-bold underline underline-offset-4 decoration-[#E6DFD3]">
              Cozy Scorebook 📔
            </span>
            <p className="text-[11px] text-[#8E9AAF] italic">Persistent registry: Online (기록 안전 보존 중)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearScores}
              className="p-3 border border-[#E6DFD3] hover:bg-[#FAF7F0] hover:border-[#8E9AAF] text-[#8E9AAF] hover:text-[#2F3E46] rounded-2xl transition-all active:scale-95 group cursor-pointer"
              title="Purge Scores (점수 기록 초기화)"
            >
              <Hash className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Cozy Rewind (Undo) Button */}
            <button
              onClick={chronoShift}
              disabled={historyStep < 2 || isThinking || !!winner}
              className={`py-3 px-4 border font-sans text-xs uppercase tracking-wider font-extrabold transition-all active:scale-95 rounded-2xl flex items-center space-x-2
                ${historyStep >= 2 && !isThinking && !winner
                  ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F] hover:bg-[#E07A5F]/20 shadow-[0_4px_12px_rgba(224,122,95,0.1)] cursor-pointer'
                  : 'border-[#E6DFD3] text-[#8E9AAF] bg-transparent opacity-40 cursor-not-allowed'
                }
              `}
              title="Rewind Time (한 수 무르기)"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${historyStep >= 2 && !isThinking && !winner ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
              <span>Rewind</span>
            </button>

            {/* Play Again (Reset Session) Button */}
            <button
              onClick={resetGame}
              className="py-3 px-5 bg-[#2F3E46] text-[#FAF7F0] font-sans font-extrabold text-xs uppercase tracking-wider hover:bg-[#3D4F59] transition-all rounded-2xl flex items-center space-x-2 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(47,62,70,0.15)]"
              title="Play Again (새 게임 시작)"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>

        {/* Decorative elements - Warm minimal dashes */}
        <div className="grid grid-cols-4 gap-4 opacity-10">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-0.5 bg-[#2F3E46]" />
          ))}
        </div>
      </div>
    </div>
  );
}
