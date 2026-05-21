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
      className="grid grid-cols-3 gap-[1px] bg-neutral-800 border border-neutral-800 rounded-none overflow-hidden shadow-2xl shadow-cyan-500/5"
    >
      <div className="bg-[#0a0a0a] p-4 group hover:bg-neutral-900 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider font-bold">HUMAN [X]</span>
        </div>
        <div className="text-4xl font-bold font-mono tracking-tighter text-cyan-500">{scores.X}</div>
      </div>
      <div className="bg-[#0a0a0a] p-4 border-x border-neutral-800 hover:bg-neutral-900 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <Hash className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider font-bold">DRAWS</span>
        </div>
        <div className="text-4xl font-bold font-mono tracking-tighter text-neutral-400">{scores.draws}</div>
      </div>
      <div className="bg-[#0a0a0a] p-4 hover:bg-neutral-900 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <Cpu className="w-3.5 h-3.5 text-fuchsia-500" />
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider font-bold">GEMINI [O]</span>
        </div>
        <div className="text-4xl font-bold font-mono tracking-tighter text-fuchsia-500">{scores.O}</div>
      </div>
    </motion.div>
  );
}
