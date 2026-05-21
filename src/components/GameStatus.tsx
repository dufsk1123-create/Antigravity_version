import { motion, AnimatePresence } from 'motion/react';
import { Trophy, AlertCircle, Sparkles } from 'lucide-react';
import { Player } from '../constants';

interface GameStatusProps {
  isThinking: boolean;
  winner: Player | 'draw' | null | undefined;
  xIsNext: boolean;
}

export function GameStatus({ isThinking, winner, xIsNext }: GameStatusProps) {
  return (
    <div className="h-28 flex flex-col justify-end">
      <AnimatePresence mode="wait">
        {isThinking ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-3 text-[#81B29A] p-4 bg-[#81B29A]/10 border border-[#81B29A]/20 rounded-2xl"
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                  className="w-1.5 h-4 bg-current rounded-full"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-xs tracking-wider font-extrabold uppercase">Thinking... 💭</span>
              <span className="font-serif text-sm italic text-[#2F3E46]">Gemini가 고민을 거듭하고 있어요</span>
            </div>
          </motion.div>
        ) : !winner ? (
          <motion.div
            key="turn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`p-4 border rounded-2xl transition-all duration-300 ${
              xIsNext 
                ? 'border-[#E07A5F]/20 bg-[#E07A5F]/5 text-[#E07A5F]' 
                : 'border-[#81B29A]/20 bg-[#81B29A]/5 text-[#81B29A]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-sans text-xs tracking-widest font-extrabold uppercase">
                  {xIsNext ? "Your Turn ✿" : "Gemini's Turn ✿"}
                </span>
                <span className="font-serif text-sm italic text-[#2F3E46]">
                  {xIsNext ? "당신의 예쁜 돌을 놓아주세요" : "인공지능이 수를 고르고 있어요"}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 border rounded-2xl ${
              winner === 'draw' 
                ? 'border-[#8E9AAF]/30 bg-[#8E9AAF]/10 text-[#8E9AAF]' 
                : winner === 'X' 
                  ? 'border-[#E07A5F]/30 bg-[#E07A5F]/10 text-[#E07A5F]' 
                  : 'border-[#81B29A]/30 bg-[#81B29A]/10 text-[#81B29A]'
            }`}
          >
            <div className="flex items-center space-x-3">
              {winner !== 'draw' ? (
                <Trophy className="w-5 h-5 animate-bounce" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <div className="flex flex-col">
                <span className="font-sans text-xs tracking-wider font-extrabold uppercase">
                  {winner === 'draw' ? "Friendly Draw" : winner === 'X' ? "Victory for You!" : "Victory for Gemini!"}
                </span>
                <span className="font-serif text-sm italic text-[#2F3E46]">
                  {winner === 'draw' 
                    ? "서로 비겼어요! 좋은 승부였습니다 🤝" 
                    : winner === 'X' 
                      ? "축하해요! 당신이 지혜롭게 이겼어요 🎉" 
                      : "Gemini가 이겼어요! 다음 판에 다시 도전해봐요 🧸"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
