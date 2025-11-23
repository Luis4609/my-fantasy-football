import React from 'react';
import { MatchRecord, Player } from '../types';
import { ArrowLeft, Calendar, TrendingUp, Star } from 'lucide-react';

interface MatchDetailProps {
  match: MatchRecord;
  roster: Player[];
  onBack: () => void;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({ match, roster, onBack }) => {
  const getPlayer = (id: string) => roster.find(p => p.id === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={20} /> Back to History
      </button>

      {/* Header Scoreboard */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-center">
          <div className="flex justify-center items-center gap-2 text-slate-400 text-sm mb-6 uppercase tracking-wider font-bold">
            <Calendar size={14} />
            {new Date(match.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="flex justify-center items-center gap-8 md:gap-16">
            <div className="text-right flex-1">
              <span className="block text-2xl md:text-4xl font-black text-white">My Team</span>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-950/50 px-6 py-3 rounded-xl border border-slate-800/50 backdrop-blur-sm">
              <span className={`text-4xl md:text-6xl font-black ${match.myScore > match.opponentScore ? 'text-green-400' : match.myScore < match.opponentScore ? 'text-red-400' : 'text-slate-200'}`}>
                {match.myScore}
              </span>
              <span className="text-slate-600 text-2xl md:text-4xl font-light">-</span>
              <span className={`text-4xl md:text-6xl font-black ${match.opponentScore > match.myScore ? 'text-green-400' : match.opponentScore < match.myScore ? 'text-red-400' : 'text-slate-200'}`}>
                {match.opponentScore}
              </span>
            </div>

            <div className="text-left flex-1">
              <span className="block text-2xl md:text-4xl font-black text-indigo-200">{match.opponent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" /> Player Performances
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 font-semibold uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-center">Pos</th>
                <th className="px-4 py-3 text-center">Mins</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-center">G</th>
                <th className="px-4 py-3 text-center">A</th>
                <th className="px-4 py-3 text-center">Cards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {match.performances.sort((a, b) => b.rating - a.rating).map(perf => {
                const player = getPlayer(perf.playerId);
                if (!player) return null;
                
                return (
                  <tr key={perf.playerId} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        {player.name}
                        {perf.manOfTheMatch && (
                          <div className="text-yellow-400" title="Man of the Match">
                            <Star size={14} fill="currentColor" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        {player.position.substring(0, 3)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">{perf.minutes}'</td>
                    <td className="px-4 py-3 text-center">
                      <div className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded ${
                        perf.rating >= 8 ? 'bg-green-500/20 text-green-400' : 
                        perf.rating >= 6 ? 'bg-indigo-500/20 text-indigo-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {perf.rating}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${perf.goals > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                      {perf.goals > 0 ? perf.goals : '-'}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${perf.assists > 0 ? 'text-blue-400' : 'text-slate-600'}`}>
                      {perf.assists > 0 ? perf.assists : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {perf.yellowCard && <div className="w-3 h-4 bg-yellow-500 rounded-sm" title="Yellow Card"></div>}
                        {perf.redCard && <div className="w-3 h-4 bg-red-500 rounded-sm" title="Red Card"></div>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};