import React, { useState } from 'react';
import { Player, Position, MatchRecord, TeamConfig } from '@/types';
import { X, Activity, ClipboardList, TrendingUp } from 'lucide-react';
import { calculatePlayerAttributes } from '@/utils/attributeCalculator';
import { PlayerFutCard } from './player-detail/PlayerFutCard';
import { PlayerAttributesRadar } from './player-detail/PlayerAttributesRadar';
import { PlayerMatchesLog } from './player-detail/PlayerMatchesLog';
import { PlayerRatingTrend } from './player-detail/PlayerRatingTrend';
import { PlayerStatsSummary } from './player-detail/PlayerStatsSummary';

interface PlayerDetailModalProps {
  player: Player;
  matchHistory: MatchRecord[];
  isOpen: boolean;
  onClose: () => void;
  teamConfig: TeamConfig;
  isLinked: boolean;
  onLink: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  matchHistory,
  isOpen,
  onClose,
  teamConfig,
  isLinked,
  onLink,
}) => {
  const [activeTab, setActiveTab] = useState<'attributes' | 'matches' | 'trend'>('attributes');

  if (!isOpen) return null;

  // Calculate dynamic attributes and overall rating (OVR)
  const { ovr, attributes } = calculatePlayerAttributes(player);

  // Filter match history to find games this player participated in
  const playerMatches = matchHistory
    .filter((m) => m.performances.some((p) => p.playerId === player.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

  // Calculate detailed historical stats from match history
  let totalYellowCards = 0;
  let totalRedCards = 0;
  let totalMotm = 0;

  matchHistory.forEach((m) => {
    const perf = m.performances.find((p) => p.playerId === player.id);
    if (perf) {
      if (perf.yellowCard) totalYellowCards++;
      if (perf.redCard) totalRedCards++;
      if (perf.manOfTheMatch) totalMotm++;
    }
  });

  // Prepare trend data (oldest first for line chart)
  const trendData = [...playerMatches]
    .reverse()
    .map((m, index) => {
      const perf = m.performances.find((p) => p.playerId === player.id);
      return {
        matchIndex: index + 1,
        opponent: m.opponent,
        rating: perf ? perf.rating : 0,
        goals: perf ? perf.goals : 0,
        assists: perf ? perf.assists : 0,
      };
    });

  const getPositionColor = (pos: Position) => {
    switch (pos) {
      case Position.GK:
        return 'from-yellow-500/20 to-yellow-600/5 text-yellow-400 border-yellow-500/30';
      case Position.DEF:
        return 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30';
      case Position.MID:
        return 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30';
      case Position.FWD:
        return 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/30';
      default:
        return 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30';
    }
  };

  const badgeColor = getPositionColor(player.position);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white leading-tight">{player.name}</h2>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded border uppercase tracking-wider bg-gradient-to-r ${badgeColor}`}
              >
                {player.position}
              </span>
              {isLinked && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600/80 border border-indigo-500/50 text-white uppercase tracking-wider">
                  You
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">Player Profile & Performance Analytics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: FUT FIFA-style card */}
          <div className="lg:col-span-4 flex flex-col items-center justify-start">
            <PlayerFutCard
              player={player}
              ovr={ovr}
              attributes={attributes}
              teamConfig={teamConfig}
              isLinked={isLinked}
              onLink={onLink}
            />
          </div>

          {/* Right Column: Analytics & Details */}
          <div className="lg:col-span-8 flex flex-col min-h-0 bg-slate-950/20 border border-slate-800/80 rounded-2xl p-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 gap-1 mb-6">
              <button
                onClick={() => setActiveTab('attributes')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'attributes'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Activity size={16} /> Attributes Radar
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'matches'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardList size={16} /> Match Log
              </button>
              <button
                onClick={() => setActiveTab('trend')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'trend'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp size={16} /> Rating Trend
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeTab === 'attributes' && (
                <PlayerAttributesRadar
                  attributes={attributes}
                  playerName={player.name}
                  primaryColor={teamConfig.primaryColor}
                />
              )}

              {activeTab === 'matches' && <PlayerMatchesLog playerMatches={playerMatches} playerId={player.id} />}

              {activeTab === 'trend' && (
                <PlayerRatingTrend trendData={trendData} secondaryColor={teamConfig.secondaryColor} />
              )}
            </div>

            {/* Historical Summary cards at the bottom */}
            <PlayerStatsSummary
              matchesPlayed={player.matchesPlayed}
              goals={player.goals}
              totalMotm={totalMotm}
              totalYellowCards={totalYellowCards}
              totalRedCards={totalRedCards}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
