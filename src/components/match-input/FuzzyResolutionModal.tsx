import React from 'react';
import { Player, Position } from '@/types';
import { FileSpreadsheet, Check } from 'lucide-react';
import { PendingResolution } from './types';

interface FuzzyResolutionModalProps {
  pendingResolutions: PendingResolution[];
  roster: Player[];
  onConfirm: () => void;
  onCancel: () => void;
  onChangeResolution: (index: number, playerId: string) => void;
}

export const FuzzyResolutionModal: React.FC<FuzzyResolutionModalProps> = ({
  pendingResolutions,
  roster,
  onConfirm,
  onCancel,
  onChangeResolution,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 rounded-t-2xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="text-indigo-400" />
            Resolve Player Name Mismatches
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            We found {pendingResolutions.length} name(s) in your file that do not match your roster. Map them to your squad or choose to skip.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-slate-800/60 flex-1">
          {pendingResolutions.map((res, index) => (
            <div key={index} className="pt-6 first:pt-0 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Excel Record Details */}
              <div className="space-y-2 max-w-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded text-sm font-mono">
                    {res.excelName}
                  </span>
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">in file</span>
                </div>
                {/* Stats preview */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-400 font-medium bg-slate-950/30 p-2 rounded-lg border border-slate-800">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded">Mins: {res.parsedData.minutes}</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded">Rating: {res.parsedData.rating}</span>
                  {res.parsedData.goals > 0 && (
                    <span className="bg-green-500/10 text-green-400 border border-green-500/10 px-1.5 py-0.5 rounded">
                      Goals: {res.parsedData.goals}
                    </span>
                  )}
                  {res.parsedData.assists > 0 && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded">
                      Assists: {res.parsedData.assists}
                    </span>
                  )}
                  {res.parsedData.yellowCard && (
                    <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/10 px-1.5 py-0.5 rounded">
                      🟨 Card
                    </span>
                  )}
                  {res.parsedData.redCard && (
                    <span className="bg-red-500/10 text-red-500 border border-red-500/10 px-1.5 py-0.5 rounded">
                      🟥 Card
                    </span>
                  )}
                  {res.parsedData.manOfTheMatch && (
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/10 px-1.5 py-0.5 rounded">
                      ⭐ MOTM
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Mapping Controls */}
              <div className="flex flex-wrap items-center gap-3 lg:justify-end flex-1">
                {/* Top Suggestions */}
                {res.suggestions.map((sug) => {
                  const isSelected = res.selectedPlayerId === sug.player.id;
                  return (
                    <button
                      key={sug.player.id}
                      type="button"
                      onClick={() => onChangeResolution(index, sug.player.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white scale-105 shadow-md shadow-indigo-900/20'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{sug.player.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                        ({sug.similarity}%)
                      </span>
                    </button>
                  );
                })}

                {/* Manual Dropdown */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={
                      res.suggestions.some((s) => s.player.id === res.selectedPlayerId) ||
                      res.selectedPlayerId === 'skip'
                        ? ''
                        : res.selectedPlayerId
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        onChangeResolution(index, e.target.value);
                      }
                    }}
                    className={`bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-colors ${
                      !res.suggestions.some((s) => s.player.id === res.selectedPlayerId) &&
                      res.selectedPlayerId !== 'skip'
                        ? 'ring-2 ring-indigo-500 border-indigo-500 text-white'
                        : ''
                    }`}
                  >
                    <option value="" disabled>
                      Other player...
                    </option>
                    {roster
                      .filter((p) => p.position !== Position.COACH)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.position.toUpperCase()})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Skip / Ignore option */}
                <button
                  type="button"
                  onClick={() => onChangeResolution(index, 'skip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    res.selectedPlayerId === 'skip'
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-red-400'
                  }`}
                >
                  {res.selectedPlayerId === 'skip' && <Check size={12} />}
                  Skip Row
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/20 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-sm transition-colors border border-slate-700"
          >
            Cancel Import
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/25 transition-all"
          >
            Confirm & Apply Matches
          </button>
        </div>
      </div>
    </div>
  );
};
