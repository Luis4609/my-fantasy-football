import React from 'react';
import { MatchRecord } from '@/types';
import { Calendar, Award } from 'lucide-react';

interface PlayerMatchesLogProps {
  playerMatches: MatchRecord[];
  playerId: string;
}

export const PlayerMatchesLog: React.FC<PlayerMatchesLogProps> = ({ playerMatches, playerId }) => {
  return (
    <div className="flex-1 flex flex-col min-h-[300px] overflow-hidden">
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-3 font-semibold">Date / Opponent</th>
              <th className="p-3 font-semibold text-center">Score</th>
              <th className="p-3 font-semibold text-center">Mins</th>
              <th className="p-3 font-semibold text-center">G / A</th>
              <th className="p-3 font-semibold text-center">Cards</th>
              <th className="p-3 font-semibold text-center">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm text-slate-300">
            {playerMatches.map((m) => {
              const perf = m.performances.find((p) => p.playerId === playerId)!;
              if (!perf) return null;
              
              const isWin = m.myScore > m.opponentScore;
              const isDraw = m.myScore === m.opponentScore;

              return (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-white truncate max-w-[150px] md:max-w-none">{m.opponent}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} /> {m.date}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        isWin
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isDraw
                          ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {m.myScore} - {m.opponentScore}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono">{perf.minutes}'</td>
                  <td className="p-3 text-center font-semibold text-slate-200">
                    {perf.goals} <span className="text-slate-500 font-normal">/</span> {perf.assists}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {perf.yellowCard && <div className="w-2.5 h-3.5 bg-yellow-500 rounded-sm" title="Yellow Card" />}
                      {perf.redCard && <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" title="Red Card" />}
                      {!perf.yellowCard && !perf.redCard && <span className="text-slate-600 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`font-mono font-bold ${
                          perf.rating >= 8.0
                            ? 'text-emerald-400'
                            : perf.rating >= 6.5
                            ? 'text-indigo-400'
                            : perf.rating >= 5.5
                            ? 'text-yellow-500'
                            : 'text-red-400'
                        }`}
                      >
                        {perf.rating.toFixed(1)}
                      </span>
                      {perf.manOfTheMatch && (
                        <Award size={14} className="text-yellow-400 shrink-0" title="Man of the Match" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {playerMatches.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No matches recorded for this player in active league.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
