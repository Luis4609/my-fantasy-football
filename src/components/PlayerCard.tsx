import React, { useState } from 'react';
import { Player, Position } from '../types';
import { Activity, Target, Trophy, TrendingUp, Pencil, Check, X } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onUpdate?: (id: string, data: Partial<Player>) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Player>>({});

  const getPositionColor = (pos: Position) => {
    switch (pos) {
      case Position.GK: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case Position.DEF: return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case Position.MID: return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case Position.FWD: return 'text-red-400 border-red-400/30 bg-red-400/10';
      case Position.COACH: return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      default: return 'text-slate-400';
    }
  };

  const colorClass = getPositionColor(player.position);

  const handleEditClick = () => {
    setEditData({
      name: player.name,
      number: player.number,
      position: player.position,
      matchesPlayed: player.matchesPlayed,
      goals: player.goals,
      assists: player.assists,
      cleanSheets: player.cleanSheets,
      totalPoints: player.totalPoints,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(player.id, editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleChange = (field: keyof Player, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    return (
      <div className={`relative flex flex-col rounded-xl border bg-slate-800/90 backdrop-blur-sm overflow-hidden ${colorClass.replace('text-', 'border-')}`}>
        <div className="p-4 flex-1 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 space-y-2">
              <select 
                value={editData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {Object.values(Position).map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              <input 
                type="text"
                value={editData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 font-bold text-sm rounded px-2 py-1 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="Name"
              />
            </div>
            <input 
              type="number"
              value={editData.number}
              onChange={(e) => handleChange('number', parseInt(e.target.value))}
              className="w-12 bg-slate-900 border border-slate-700 text-xl font-black text-center rounded px-1 py-1 text-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-500 block mb-0.5">Matches</label>
              <input 
                type="number"
                value={editData.matchesPlayed}
                onChange={(e) => handleChange('matchesPlayed', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-0.5">Points</label>
              <input 
                type="number"
                value={editData.totalPoints}
                onChange={(e) => handleChange('totalPoints', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-0.5">Goals</label>
              <input 
                type="number"
                value={editData.goals}
                onChange={(e) => handleChange('goals', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-green-400"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-0.5">Assists</label>
              <input 
                type="number"
                value={editData.assists}
                onChange={(e) => handleChange('assists', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-blue-400"
              />
            </div>
            <div className="col-span-2">
              <label className="text-slate-500 block mb-0.5">Clean Sheets</label>
              <input 
                type="number"
                value={editData.cleanSheets}
                onChange={(e) => handleChange('cleanSheets', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="p-2 bg-slate-900/80 border-t border-slate-700 flex gap-2">
          <button 
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-400 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded text-xs font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Check size={14} /> Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative flex flex-col rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 overflow-hidden ${colorClass.replace('text-', 'border-')}`}>
      {onUpdate && (
        <button 
          onClick={handleEditClick}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white z-10"
          title="Edit Player"
        >
          <Pencil size={14} />
        </button>
      )}

      {/* Main Content */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
             <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${colorClass}`}>
              {player.position}
            </span>
            <h3 className="text-lg font-bold text-white mt-2 leading-tight">{player.name}</h3>
          </div>
          <span className="text-3xl font-black opacity-10 text-white">#{player.number}</span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-300 mb-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-500" />
            <span>Avg: <span className="font-semibold text-white">{player.averageRating.toFixed(1)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-slate-500" />
            <span>G/A: <span className="font-semibold text-white">{player.goals}/{player.assists}</span></span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Trophy size={14} className="text-slate-500" />
            <span>Matches: <span className="font-semibold text-white">{player.matchesPlayed}</span></span>
          </div>
        </div>
      </div>

      {/* Footer: Points & Form */}
      <div className="bg-slate-900/50 p-3 border-t border-white/5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Total Points</div>
          <div className="text-2xl font-black text-white leading-none">{player.totalPoints}</div>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider font-bold" title="Last 5 Matches">
            <TrendingUp size={10} /> Form
          </div>
          
          <div className="flex items-end gap-1 h-8 justify-end min-w-[50px]">
             {/* If we have fewer than 5 matches, show dots/bars for placeholders */}
             {[...Array(Math.max(0, 5 - player.form.length))].map((_, i) => (
               <div key={`empty-${i}`} className="w-2 h-0.5 bg-slate-700/50 rounded-full mb-0.5" />
            ))}

            {player.form.slice(-5).map((rating, i) => {
              // Calculate height percentage (max 100%, min 15% for visibility)
              // Assumes max rating is 10.
              const heightPct = Math.max(15, Math.min(100, rating * 10));
              
              // Color logic
              let bgClass = 'bg-red-500';
              if (rating >= 8.5) bgClass = 'bg-emerald-400'; // Excellent
              else if (rating >= 7.0) bgClass = 'bg-emerald-600'; // Good
              else if (rating >= 6.0) bgClass = 'bg-yellow-500'; // Average
              else bgClass = 'bg-red-500'; // Poor
              
              return (
                <div 
                  key={i} 
                  className={`w-2 rounded-t-sm rounded-b-[1px] ${bgClass} opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-help`}
                  style={{ height: `${heightPct}%` }}
                  title={`Rating: ${rating}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};