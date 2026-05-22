import React from 'react';
import { Player, TeamConfig } from '@/types';
import { User } from 'lucide-react';

interface PlayerFutCardProps {
  player: Player;
  ovr: number;
  attributes: { subject: string; value: number }[];
  teamConfig: TeamConfig;
  isLinked: boolean;
  onLink: () => void;
}

export const PlayerFutCard: React.FC<PlayerFutCardProps> = ({
  player,
  ovr,
  attributes,
  teamConfig,
  isLinked,
  onLink,
}) => {


  return (
    <div className="flex flex-col items-center justify-start space-y-4">
      {/* FUT-Card Design */}
      <div className="relative w-64 h-96 bg-gradient-to-b from-amber-500/30 via-slate-800 to-slate-950 rounded-3xl border-2 border-amber-500/40 p-4 shadow-xl flex flex-col items-center justify-between text-white overflow-hidden group">
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none transition-all duration-700 group-hover:rotate-12 group-hover:scale-150" />

        {/* OVR & Position Shield */}
        <div className="w-full flex justify-between items-start mt-2">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black tracking-tighter text-amber-400 leading-none">{ovr}</span>
            <span className="text-sm font-bold uppercase text-slate-300 mt-1">{player.position}</span>
          </div>
          <div className="text-2xl font-black text-amber-500/40">#{player.number}</div>
        </div>

        {/* Player Avatar Shield */}
        <div className="w-24 h-24 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center relative shadow-inner overflow-hidden mt-2">
          <User size={48} className="text-slate-500" />
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/60 text-[10px] py-0.5 text-center font-bold text-slate-300">
            SHIRT {player.number}
          </div>
        </div>

        {/* Player Name */}
        <div className="text-center w-full mt-4">
          <h4 className="text-xl font-bold tracking-tight text-white line-clamp-1 border-b border-slate-800 pb-2">
            {player.name}
          </h4>
        </div>

        {/* FUT Stats Grid */}
        <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-center w-full text-xs font-semibold text-slate-300 mt-2 mb-2">
          {attributes.map((attr, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-amber-400 font-extrabold text-sm">{attr.value}</span>
              <span className="text-[10px] text-slate-400 uppercase">{attr.subject.substring(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Card Footer: Team Shield */}
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 border-t border-slate-900 w-full pt-2 text-center">
          {teamConfig.name}
        </div>
      </div>

      {/* Account Linking button inside modal */}
      <button
        onClick={onLink}
        className={`w-full max-w-xs py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
          isLinked
            ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
            : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
        }`}
      >
        <User size={14} />
        {isLinked ? 'Unlink Account' : 'Mark This Player as Me'}
      </button>
    </div>
  );
};
