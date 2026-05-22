import React from 'react';
import { Player, Position, PlayerPerformance } from '@/types';
import { PlayerStatRow } from './PlayerStatRow';

interface PlayersStatsTableProps {
  roster: Player[];
  performances: Record<string, PlayerPerformance>;
  onChangeStat: (id: string, field: keyof PlayerPerformance, value: any) => void;
  onToggleMotm: (id: string) => void;
  onSetPlayed: (id: string, played: boolean) => void;
}

export const PlayersStatsTable: React.FC<PlayersStatsTableProps> = ({
  roster,
  performances,
  onChangeStat,
  onToggleMotm,
  onSetPlayed,
}) => {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-900 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="p-4 font-semibold text-slate-400 text-sm">Player</th>
            <th className="p-4 font-semibold text-slate-400 text-sm text-center">Played?</th>
            <th className="p-4 font-semibold text-slate-400 text-sm w-32 text-center">Rating (1-10)</th>
            <th className="p-4 font-semibold text-slate-400 text-sm w-24 text-center">Goals</th>
            <th className="p-4 font-semibold text-slate-400 text-sm w-24 text-center">Assists</th>
            <th className="p-4 font-semibold text-slate-400 text-sm text-center">MOTM</th>
            <th className="p-4 font-semibold text-slate-400 text-sm text-center">Cards</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {roster
            .filter((p) => p.position !== Position.COACH)
            .map((player) => {
              const perf = performances[player.id];
              if (!perf) return null;

              return (
                <PlayerStatRow
                  key={player.id}
                  player={player}
                  performance={perf}
                  onChangeStat={(field, value) => onChangeStat(player.id, field, value)}
                  onToggleMotm={() => onToggleMotm(player.id)}
                  onSetPlayed={(played) => onSetPlayed(player.id, played)}
                />
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
