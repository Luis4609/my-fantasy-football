import React from 'react';
import { Trophy, Target, Award } from 'lucide-react';

interface PlayerStatsSummaryProps {
  matchesPlayed: number;
  goals: number;
  totalMotm: number;
  totalYellowCards: number;
  totalRedCards: number;
}

export const PlayerStatsSummary: React.FC<PlayerStatsSummaryProps> = ({
  matchesPlayed,
  goals,
  totalMotm,
  totalYellowCards,
  totalRedCards,
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 bg-slate-950/40 p-4 rounded-xl">
      <div className="text-center">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Career Apps</div>
        <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
          <Trophy size={14} className="text-slate-500" /> {matchesPlayed}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Total Goals</div>
        <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
          <Target size={14} className="text-slate-500" /> {goals}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">MOTM Awards</div>
        <div className="text-lg font-bold text-yellow-400 flex items-center justify-center gap-1">
          <Award size={14} className="text-yellow-400 animate-pulse" /> {totalMotm}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Yellow/Reds</div>
        <div className="text-lg font-bold text-slate-200 flex items-center justify-center gap-1">
          <span className="text-yellow-500 font-semibold">{totalYellowCards}</span>
          <span className="text-slate-600">/</span>
          <span className="text-red-500 font-semibold">{totalRedCards}</span>
        </div>
      </div>
    </div>
  );
};
