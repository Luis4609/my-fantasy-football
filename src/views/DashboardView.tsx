import React from 'react';
import { Activity, TrendingUp, Users, Target, History, Footprints } from 'lucide-react';
import { MatchRecord, Player, TeamConfig } from '../../types';
import { TopPlayersChart } from './../components/charts/TopPlayersChart';
import { TeamBalanceRadar } from './../components/charts/TeamBalanceRadar';
import { View } from './../components/layout/Sidebar';

interface DashboardViewProps {
    teamConfig: TeamConfig;
    leagueStats: {
        played: number;
        won: number;
        drawn: number;
        lost: number;
        gf: number;
        ga: number;
        points: number;
        form: string[];
    };
    roster: Player[];
    matchHistory: MatchRecord[];
    teamBalanceData: { subject: string; A: number; fullMark: number }[];
    setCurrentView: (view: View) => void;
    setSelectedMatch: (match: MatchRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    teamConfig,
    leagueStats,
    roster,
    matchHistory,
    teamBalanceData,
    setCurrentView,
    setSelectedMatch
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <p className="text-slate-400 text-sm mt-1">Season Overview & {teamConfig.name} Performance</p>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Record & Form */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Season Record</h3>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-black text-white">{leagueStats.points}</span>
                            <span className="text-sm font-bold" style={{ color: teamConfig.primaryColor }}>PTS</span>
                        </div>
                        <div className="flex gap-1">
                            {leagueStats.form.length > 0 ? leagueStats.form.map((res, i) => (
                                <div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${res === 'W' ? 'bg-green-500/20 text-green-400' : res === 'D' ? 'bg-slate-500/20 text-slate-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {res}
                                </div>
                            )) : <span className="text-xs text-slate-500">No games yet</span>}
                        </div>
                    </div>
                    <Activity className="absolute -bottom-4 -right-4 text-slate-800 opacity-50" size={80} />
                </div>

                {/* Card 2: Total Fantasy Points */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Fantasy Points</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-white">
                            {roster.reduce((acc, curr) => acc + curr.totalPoints, 0)}
                        </span>
                        <TrendingUp className="text-emerald-400" size={20} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Combined squad total</p>
                </div>

                {/* Card 3: Top Scorer */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Golden Boot</h3>
                    {(() => {
                        const topScorer = [...roster].sort((a, b) => b.goals - a.goals)[0];
                        return (
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xl font-bold text-white truncate">{topScorer?.goals > 0 ? topScorer.name : 'N/A'}</span>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-sm font-bold">{topScorer?.goals || 0} G</span>
                                </div>
                                <div className="text-xs text-slate-500">{topScorer?.position || '-'}</div>
                            </div>
                        )
                    })()}
                </div>

                {/* Card 4: Top Assister */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Playmaker</h3>
                    {(() => {
                        const topAssister = [...roster].sort((a, b) => b.assists - a.assists)[0];
                        return (
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xl font-bold text-white truncate">{topAssister?.assists > 0 ? topAssister.name : 'N/A'}</span>
                                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm font-bold">{topAssister?.assists || 0} A</span>
                                </div>
                                <div className="text-xs text-slate-500">{topAssister?.position || '-'}</div>
                            </div>
                        )
                    })()}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: MVP Bar Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Users size={18} style={{ color: teamConfig.primaryColor }} /> MVP Standings
                    </h3>
                    <TopPlayersChart roster={roster} teamConfig={teamConfig} />
                </div>

                {/* Right: Radar Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Target size={18} className="text-purple-400" /> Team Balance (Points)
                    </h3>
                    <TeamBalanceRadar data={teamBalanceData} teamConfig={teamConfig} />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <History size={18} className="text-slate-400" /> Recent Results
                </h3>
                {matchHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-sm py-8 border border-dashed border-slate-700 rounded-xl">
                        <Footprints size={24} className="mb-2 opacity-50" />
                        <p>No matches played yet.</p>
                        <button onClick={() => setCurrentView('match_input')} className="mt-2 text-indigo-400 hover:text-indigo-300">Add your first match</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matchHistory.slice().reverse().slice(0, 6).map(match => (
                            <div
                                key={match.id}
                                onClick={() => { setSelectedMatch(match); setCurrentView('history'); }}
                                className="group flex flex-col p-4 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                        {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${match.myScore > match.opponentScore ? 'bg-green-500/10 text-green-400' :
                                        match.myScore === match.opponentScore ? 'bg-slate-500/10 text-slate-400' :
                                            'bg-red-500/10 text-red-400'
                                        }`}>
                                        {match.myScore > match.opponentScore ? 'Win' : match.myScore === match.opponentScore ? 'Draw' : 'Loss'}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-slate-200">{teamConfig.name}</div>
                                        <div className="text-sm text-slate-400">{match.opponent}</div>
                                    </div>
                                    <div className="flex gap-1 font-mono text-xl font-bold">
                                        <span className={match.myScore > match.opponentScore ? 'text-green-400' : 'text-white'}>{match.myScore}</span>
                                        <span className="text-slate-600">:</span>
                                        <span className={match.opponentScore > match.myScore ? 'text-red-400' : 'text-white'}>{match.opponentScore}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
