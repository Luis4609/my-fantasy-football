import React, { useState } from 'react';
import { MatchRecord } from '../types';
import { Calendar, ChevronRight, Trophy, ArrowUpDown } from 'lucide-react';

interface MatchHistoryListProps {
  matches: MatchRecord[];
  teamName: string;
  onSelectMatch: (match: MatchRecord) => void;
}

type SortField = 'date' | 'myScore' | 'opponentScore';

export const MatchHistoryList: React.FC<MatchHistoryListProps> = ({ matches, teamName, onSelectMatch }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDesc, setSortDesc] = useState(true);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
        <Trophy size={48} className="mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-slate-400">No matches played yet</h3>
        <p className="text-sm">Go to "Add Match" to record your first game.</p>
      </div>
    );
  }

  const sortedMatches = [...matches].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'date') {
      valA = new Date(a.date).getTime();
      valB = new Date(b.date).getTime();
    }

    if (valA < valB) return sortDesc ? 1 : -1;
    if (valA > valB) return sortDesc ? -1 : 1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true); // Default to desc (High score / Recent date)
    }
  };

  const SortButton = ({ field, label }: { field: SortField, label: string }) => (
    <button 
      onClick={() => handleSort(field)}
      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
        sortField === field 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      {label} 
      <ArrowUpDown 
        size={12} 
        className={`transition-transform duration-200 ${
          sortField === field ? 'opacity-100' : 'opacity-40'
        } ${sortField === field && !sortDesc ? 'rotate-180' : ''}`} 
      />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-white">Match History</h2>
        
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 gap-1">
           <SortButton field="date" label="Date" />
           <SortButton field="myScore" label="My Score" />
           <SortButton field="opponentScore" label="Opp. Score" />
        </div>
      </div>

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