
import React, { useState } from 'react';
import { Player, Position } from '../types';
import { ArrowUpDown, Trophy, Medal } from 'lucide-react';

interface PlayerLeaderboardProps {
  roster: Player[];
}

type SortField = 'totalPoints' | 'averageRating' | 'goals' | 'assists' | 'matchesPlayed';

export const PlayerLeaderboard: React.FC<PlayerLeaderboardProps> = ({ roster }) => {
  const [sortField, setSortField] = useState<SortField>('totalPoints');
  const [sortDesc, setSortDesc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const sortedPlayers = [...roster]
    .filter(p => p.position !== Position.COACH)
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortDesc ? valB - valA : valA - valB;
    });

  const SortHeader = ({ field, label, right = false }: { field: SortField, label: string, right?: boolean }) => (
    <th 
      className={`px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors select-none ${right ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${right ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown size={12} className={`opacity-40 ${sortField === field ? 'opacity-100 text-indigo-400' : ''}`} />
      </div>
    </th>
  );

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left w-12">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <SortHeader field="matchesPlayed" label="Apps" right />
            <SortHeader field="goals" label="G" right />
            <SortHeader field="assists" label="A" right />
            <SortHeader field="averageRating" label="Avg Rtg" right />
            <SortHeader field="totalPoints" label="Points" right />
            <th className="px-4 py-3 text-center">Form</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {sortedPlayers.map((player, index) => (
            <tr key={player.id} className="hover:bg-slate-700/30 transition-colors group">
              <td className="px-4 py-3 text-slate-500 font-mono">
                {index === 0 && <Medal size={16} className="text-yellow-400 inline" />}
                {index === 1 && <Medal size={16} className="text-slate-400 inline" />}
                {index === 2 && <Medal size={16} className="text-amber-700 inline" />}
                {index > 2 && index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-1 h-8 rounded-full ${
                     player.position === Position.GK ? 'bg-yellow-500' :
                     player.position === Position.DEF ? 'bg-blue-500' :
                     player.position === Position.MID ? 'bg-emerald-500' :
                     'bg-red-500'
                  }`}></span>
                  <div>
                    <div className="font-bold text-white text-base">{player.name}</div>
                    <div className="text-xs text-slate-500">{player.position}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium text-slate-300">{player.matchesPlayed}</td>
              <td className="px-4 py-3 text-right font-medium text-green-400">{player.goals}</td>
              <td className="px-4 py-3 text-right font-medium text-blue-400">{player.assists}</td>
              <td className="px-4 py-3 text-right font-bold text-slate-200">{player.averageRating.toFixed(1)}</td>
              <td className="px-4 py-3 text-right">
                <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-bold border border-indigo-500/20">
                  {player.totalPoints}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {player.form.slice(-5).map((f, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-6 rounded-sm ${
                        f >= 8 ? 'bg-green-500' : 
                        f >= 6 ? 'bg-yellow-500' : 
                        f > 0 ? 'bg-red-500' : 'bg-slate-700'
                      }`} 
                      title={`Rating: ${f}`}
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
