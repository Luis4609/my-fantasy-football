import React from 'react';
import { MatchRecord } from '../types';
import { Calendar, ChevronRight, Trophy } from 'lucide-react';

interface MatchHistoryListProps {
  matches: MatchRecord[];
  onSelectMatch: (match: MatchRecord) => void;
}

export const MatchHistoryList: React.FC<MatchHistoryListProps> = ({ matches, onSelectMatch }) => {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
        <Trophy size={48} className="mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-slate-400">No matches played yet</h3>
        <p className="text-sm">Go to "Add Match" to record your first game.</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Match History</h2>
      <div className="grid gap-3">
        {sortedMatches.map((match) => {
          const isWin = match.myScore > match.opponentScore;
          const isDraw = match.myScore === match.opponentScore;
          const isLoss = match.myScore < match.opponentScore;

          return (
            <div 
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className="group bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-sm border ${
                  isWin ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  isDraw ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  <span className="text-lg leading-none">{isWin ? 'W' : isDraw ? 'D' : 'L'}</span>
                </div>
                
                <div>
                  <div className="font-bold text-lg text-white mb-0.5">{match.opponent}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={12} />
                    {new Date(match.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 font-mono">
                  <span className={`text-2xl font-bold ${isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-slate-200'}`}>
                    {match.myScore}
                  </span>
                  <span className="text-slate-600">-</span>
                  <span className={`text-2xl font-bold ${!isWin && !isDraw ? 'text-green-400' : isWin ? 'text-red-400' : 'text-slate-200'}`}>
                    {match.opponentScore}
                  </span>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={20} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};