import React from 'react';
import { Player, Position, PlayerPerformance } from '@/types';
import { Star } from 'lucide-react';

interface PlayerStatRowProps {
  player: Player;
  performance: PlayerPerformance;
  onChangeStat: (field: keyof PlayerPerformance, value: any) => void;
  onToggleMotm: () => void;
  onSetPlayed: (played: boolean) => void;
}

export const PlayerStatRow: React.FC<PlayerStatRowProps> = ({
  player,
  performance,
  onChangeStat,
  onToggleMotm,
  onSetPlayed,
}) => {
  const isPlaying = performance.minutes > 0;

  return (
    <tr className={`hover:bg-slate-700/30 transition-colors ${isPlaying ? 'bg-indigo-900/10' : ''}`}>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
              player.position === Position.GK
                ? 'text-yellow-400 border-yellow-400/30'
                : player.position === Position.DEF
                ? 'text-blue-400 border-blue-400/30'
                : player.position === Position.MID
                ? 'text-emerald-400 border-emerald-400/30'
                : 'text-red-400 border-red-400/30'
            }`}
          >
            {player.position.substring(0, 3).toUpperCase()}
          </span>
          <div className="font-medium text-white">{player.name}</div>
        </div>
      </td>
      <td className="p-4 text-center">
        <input
          type="checkbox"
          checked={isPlaying}
          onChange={(e) => onSetPlayed(e.target.checked)}
          className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
        />
      </td>
      <td className="p-4 text-center">
        <input
          type="number"
          min="1"
          max="10"
          step="0.1"
          disabled={!isPlaying}
          value={performance.rating}
          onChange={(e) => onChangeStat('rating', parseFloat(e.target.value))}
          className={`w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono ${
            !isPlaying ? 'opacity-30' : 'text-white'
          }`}
        />
      </td>
      <td className="p-4 text-center">
        <input
          type="number"
          min="0"
          disabled={!isPlaying}
          value={performance.goals}
          onChange={(e) => onChangeStat('goals', parseInt(e.target.value) || 0)}
          className={`w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center ${
            !isPlaying ? 'opacity-30' : 'text-green-400 font-bold'
          }`}
        />
      </td>
      <td className="p-4 text-center">
        <input
          type="number"
          min="0"
          disabled={!isPlaying}
          value={performance.assists}
          onChange={(e) => onChangeStat('assists', parseInt(e.target.value) || 0)}
          className={`w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center ${
            !isPlaying ? 'opacity-30' : 'text-blue-400 font-bold'
          }`}
        />
      </td>
      <td className="p-4 text-center">
        <button
          disabled={!isPlaying}
          onClick={onToggleMotm}
          className={`p-2 rounded-full transition-all ${
            performance.manOfTheMatch
              ? 'text-yellow-400 bg-yellow-400/10 scale-110'
              : 'text-slate-600 hover:text-yellow-400 hover:bg-slate-800'
          } ${!isPlaying ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Man of the Match"
        >
          <Star size={18} fill={performance.manOfTheMatch ? 'currentColor' : 'none'} />
        </button>
      </td>
      <td className="p-4 flex justify-center gap-2">
        <button
          disabled={!isPlaying}
          onClick={() => onChangeStat('yellowCard', !performance.yellowCard)}
          className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
            performance.yellowCard
              ? 'bg-yellow-500 text-black border-yellow-600'
              : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-yellow-500/50'
          } ${!isPlaying ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Yellow Card"
        >
          <div className="w-3 h-4 bg-current rounded-sm"></div>
        </button>
        <button
          disabled={!isPlaying}
          onClick={() => onChangeStat('redCard', !performance.redCard)}
          className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
            performance.redCard
              ? 'bg-red-500 text-white border-red-600'
              : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-red-500/50'
          } ${!isPlaying ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Red Card"
        >
          <div className="w-3 h-4 bg-current rounded-sm"></div>
        </button>
      </td>
    </tr>
  );
};
