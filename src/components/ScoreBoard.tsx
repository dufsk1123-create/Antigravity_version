import { motion } from 'motion/react';
import { User, Hash, Cpu } from 'lucide-react';
import { Scores } from '../constants';

interface ScoreBoardProps {
  scores: Scores;
}

export function ScoreBoard({ scores }: ScoreBoardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-3 gap-[1px] bg-[#E6DFD3] border border-[#E6DFD3] rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(230,223,211,0.5)]"
    >
      <div className="bg-[#FFFDF9] p-4 group hover:bg-[#FAF7F0] transition-colors flex flex-col items-center text-center">
        <div className="flex items-center space-x-1.5 mb-2">
          <User className="w-4 h-4 text-[#E07A5F]" />
          <span className="font-sans text-xs text-[#E07A5F] uppercase tracking-wider font-bold">You [X]</span>
        </div>
        <div className="text-4xl font-serif font-black tracking-tight text-[#2F3E46]">{scores.X}</div>
      </div>
      
      <div className="bg-[#FFFDF9] p-4 border-x border-[#E6DFD3] hover:bg-[#FAF7F0] transition-colors flex flex-col items-center text-center">
        <div className="flex items-center space-x-1.5 mb-2">
          <Hash className="w-4 h-4 text-[#8E9AAF]" />
          <span className="font-sans text-xs text-[#8E9AAF] uppercase tracking-wider font-bold">Draws</span>
        </div>
        <div className="text-4xl font-serif font-black tracking-tight text-[#2F3E46]">{scores.draws}</div>
      </div>
      
      <div className="bg-[#FFFDF9] p-4 hover:bg-[#FAF7F0] transition-colors flex flex-col items-center text-center">
        <div className="flex items-center space-x-1.5 mb-2">
          <Cpu className="w-4 h-4 text-[#81B29A]" />
          <span className="font-sans text-xs text-[#81B29A] uppercase tracking-wider font-bold">Gemini [O]</span>
        </div>
        <div className="text-4xl font-serif font-black tracking-tight text-[#2F3E46]">{scores.O}</div>
      </div>
    </motion.div>
  );
}
