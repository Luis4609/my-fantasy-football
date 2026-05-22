import React from 'react';
import { RivalTeam } from '@/types';
import { Calendar, Save } from 'lucide-react';

interface MatchHeaderInputProps {
  opponent: string;
  onChangeOpponent: (val: string) => void;
  rivalTeams: RivalTeam[];
  date: string;
  onChangeDate: (val: string) => void;
  teamName: string;
  myScore: number;
  onChangeMyScore: (val: number) => void;
  oppScore: number;
  onChangeOppScore: (val: number) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const MatchHeaderInput: React.FC<MatchHeaderInputProps> = ({
  opponent,
  onChangeOpponent,
  rivalTeams,
  date,
  onChangeDate,
  teamName,
  myScore,
  onChangeMyScore,
  oppScore,
  onChangeOppScore,
  onCancel,
  onSave,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Opponent</label>
        <input
          type="text"
          list="opponents-list"
          value={opponent}
          onChange={(e) => onChangeOpponent(e.target.value)}
          placeholder="Select or type team name..."
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <datalist id="opponents-list">
          {rivalTeams.map((team) => (
            <option key={team.id} value={team.name} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="date"
            value={date}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase mb-2 truncate" style={{ color: '#818cf8' }}>
            {teamName}
          </label>
          <input
            type="number"
            min="0"
            value={myScore}
            onChange={(e) => onChangeMyScore(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <span className="mb-3 font-bold text-slate-500">-</span>
        <div className="flex-1">
          <label className="block text-xs font-bold text-red-400 uppercase mb-2">Opponent</label>
          <input
            type="number"
            min="0"
            value={oppScore}
            onChange={(e) => onChangeOppScore(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>
      <div className="flex items-end justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all"
        >
          <Save size={18} /> Save Match
        </button>
      </div>
    </div>
  );
};
