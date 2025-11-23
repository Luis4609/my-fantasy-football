import React from 'react';
import { Player, Position } from '../types';
import { Activity, Target, Trophy, TrendingUp } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const getPositionColor = (pos: Position) => {
    switch (pos) {
      case Position.GK: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case Position.DEF: return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case Position.MID: return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case Position.FWD: return 'text-red-400 border-red-400/30 bg-red-400/10';
      case Position.COACH: return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      default: return 'text-slate-400';
    }
  };

  const colorClass = getPositionColor(player.position);

  return (
    <div className={`relative flex flex-col rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] overflow-hidden ${colorClass.replace('text-', 'border-')}`}>
      {/* Main Content */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
             <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${colorClass}`}>
              {player.position}
            </span>
            <h3 className="text-lg font-bold text-white mt-2 leading-tight">{player.name}</h3>
          </div>
          <span className="text-3xl font-black opacity-10 text-white">#{player.number}</span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-300 mb-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-500" />
            <span>Avg: <span className="font-semibold text-white">{player.averageRating.toFixed(1)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-slate-500" />
            <span>G/A: <span className="font-semibold text-white">{player.goals}/{player.assists}</span></span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Trophy size={14} className="text-slate-500" />
            <span>Matches: <span className="font-semibold text-white">{player.matchesPlayed}</span></span>
          </div>
        </div>
      </div>

      {/* Footer: Points & Form */}
      <div className="bg-slate-900/50 p-3 border-t border-white/5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Total Points</div>
          <div className="text-2xl font-black text-white leading-none">{player.totalPoints}</div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            <TrendingUp size={10} /> Form
          </div>
          <div className="flex gap-1 h-2">
            {player.form.slice(-5).map((rating, i) => (
              <div 
                key={i} 
                className={`w-2 rounded-sm ${rating >= 7.5 ? 'bg-emerald-500' : rating >= 6.0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                title={`Rating: ${rating}`}
              />
            ))}
             {[...Array(Math.max(0, 5 - player.form.length))].map((_, i) => (
               <div key={`empty-${i}`} className="w-2 bg-slate-700/30 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
