import React, { useState } from 'react';
import { Player, MatchResult, LeagueTeam, MatchStats } from '../types';
import { simulateMatch } from '../services/geminiService';
import { PlayCircle, Loader2, Trophy, AlertCircle } from 'lucide-react';
import { OPPONENTS } from '../constants';

interface MatchSimulatorProps {
  roster: Player[];
  onMatchComplete: (result: MatchResult) => void;
  teams: LeagueTeam[];
}

export const MatchSimulator: React.FC<MatchSimulatorProps> = ({ roster, onMatchComplete, teams }) => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Find next opponent (simple rotation logic for demo)
  const myTeam = teams.find(t => t.name === "My Team");
  const nextOpponentIndex = (myTeam?.played || 0) % OPPONENTS.length;
  const nextOpponent = OPPONENTS[nextOpponentIndex];

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulateMatch(roster, nextOpponent);
      setLastResult(result);
      onMatchComplete(result);
    } catch (err) {
      setError("Failed to connect to the simulation engine. Please check your network or API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!lastResult ? (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col items-center justify-center text-center min-h-[400px]">
          <h2 className="text-2xl font-bold text-white mb-2">Next Match</h2>
          <div className="flex items-center gap-8 my-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-900/50 mb-4 mx-auto">
                MT
              </div>
              <h3 className="text-xl font-bold text-indigo-400">My Team</h3>
            </div>
            <div className="text-4xl font-black text-slate-600">VS</div>
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 mx-auto">
                {nextOpponent.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-slate-300">{nextOpponent}</h3>
            </div>
          </div>
          
          <button
            onClick={handleSimulate}
            disabled={loading}
            className={`
              group relative flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all
              ${loading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95'}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Simulating Match...
              </>
            ) : (
              <>
                <PlayCircle className="group-hover:fill-current" /> Kick Off
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-4 text-red-400 flex items-center gap-2 bg-red-900/20 px-4 py-2 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl p-0 border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center border-b border-slate-700">
            <h3 className="text-slate-400 uppercase tracking-widest text-sm mb-4">Match Result</h3>
            <div className="flex justify-center items-center gap-12 mb-6">
              <div className="text-right">
                <span className="block text-3xl font-bold text-indigo-400">My Team</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-950 px-8 py-4 rounded-xl border border-slate-800">
                <span className={`text-5xl font-black ${lastResult.myScore > lastResult.opponentScore ? 'text-green-400' : lastResult.myScore < lastResult.opponentScore ? 'text-red-400' : 'text-slate-200'}`}>
                  {lastResult.myScore}
                </span>
                <span className="text-slate-600 text-3xl">-</span>
                <span className={`text-5xl font-black ${lastResult.opponentScore > lastResult.myScore ? 'text-green-400' : lastResult.opponentScore < lastResult.myScore ? 'text-red-400' : 'text-slate-200'}`}>
                  {lastResult.opponentScore}
                </span>
              </div>
              <div className="text-left">
                <span className="block text-3xl font-bold text-slate-300">{lastResult.opponent}</span>
              </div>
            </div>
            <p className="text-slate-400 italic max-w-2xl mx-auto">"{lastResult.summary}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-r border-slate-700">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <PlayCircle size={18} className="text-emerald-500" /> Match Events
              </h4>
              <div className="space-y-3">
                {lastResult.events.length === 0 && <p className="text-slate-500 text-sm">No major events reported.</p>}
                {lastResult.events.map((evt, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <span className="font-mono text-slate-500 w-8 text-right">{evt.minute}'</span>
                    <div className="flex-1">
                      <span className={`font-semibold ${evt.type === 'goal' ? 'text-green-400' : evt.type === 'card' ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {evt.type.toUpperCase()}
                      </span>
                      <span className="text-slate-400 mx-2">-</span>
                      <span className="text-slate-300">{evt.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" /> Top Performers
              </h4>
              <div className="space-y-3">
                {(Object.values(lastResult.playerStats) as MatchStats[])
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 5)
                  .map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                      <span className="text-slate-200 font-medium">{stat.name}</span>
                      <div className="flex items-center gap-3">
                        {stat.goals > 0 && <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">{stat.goals} G</span>}
                        {stat.assists > 0 && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">{stat.assists} A</span>}
                        <span className={`font-bold ${stat.rating >= 8 ? 'text-green-400' : stat.rating >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {stat.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-900 border-t border-slate-700 text-center">
            <button 
              onClick={() => setLastResult(null)}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Back to Fixtures
            </button>
          </div>
        </div>
      )}
    </div>
  );
};