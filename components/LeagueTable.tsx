import React from 'react';
import { LeagueTeam } from '../types';

interface LeagueTableProps {
  teams: LeagueTeam[];
}

export const LeagueTable: React.FC<LeagueTableProps> = ({ teams }) => {
  // Sort teams by Points, then GD, then GF
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
          <tr>
            <th className="px-4 py-3">Pos</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3 text-center">P</th>
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">D</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center">GF</th>
            <th className="px-4 py-3 text-center">GA</th>
            <th className="px-4 py-3 text-center text-white">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team, index) => (
            <tr 
              key={team.name} 
              className={`border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors ${team.name === 'My Team' ? 'bg-indigo-900/20' : ''}`}
            >
              <td className="px-4 py-3 font-medium text-slate-500">{index + 1}</td>
              <td className={`px-4 py-3 font-semibold ${team.name === 'My Team' ? 'text-indigo-400' : 'text-white'}`}>
                {team.name}
              </td>
              <td className="px-4 py-3 text-center">{team.played}</td>
              <td className="px-4 py-3 text-center text-green-400">{team.won}</td>
              <td className="px-4 py-3 text-center text-slate-400">{team.drawn}</td>
              <td className="px-4 py-3 text-center text-red-400">{team.lost}</td>
              <td className="px-4 py-3 text-center">{team.gf}</td>
              <td className="px-4 py-3 text-center">{team.ga}</td>
              <td className="px-4 py-3 text-center font-bold text-white text-base">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};