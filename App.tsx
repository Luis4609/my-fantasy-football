import React, { useState, useEffect } from 'react';

import { INITIAL_ROSTER } from './constants';
import { Player, MatchRecord, Position, PlayerPerformance, TeamConfig } from './types';
import { PlayerCard } from './components/PlayerCard';
import { PlayerLeaderboard } from './components/PlayerLeaderboard';
import { MatchInput } from './components/MatchInput';
import { MatchHistoryList } from './components/MatchHistoryList';
import { MatchDetail } from './components/MatchDetail';
import { TeamSettings } from './components/TeamSettings';
import { AddPlayerModal } from './components/AddPlayerModal';
import { LayoutDashboard, Users, Trophy, Menu, X, Shirt, PlusCircle, History, Search, TrendingUp, Target, Activity, Footprints, Settings } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

type View = 'dashboard' | 'roster' | 'leaderboard' | 'match_input' | 'history' | 'settings';

// Helper interface for edit state
interface PlayerEditState {
  name?: string;
  number?: number;
  position?: Position;
  // Offsets for stats (Difference between manual value and calculated value)
  matchesOffset?: number;
  goalsOffset?: number;
  assistsOffset?: number;
  cleanSheetsOffset?: number;
  pointsOffset?: number;
}

const App = () => {
  const [teamConfig, setTeamConfig] = useState<TeamConfig>({
    name: 'My Team',
    primaryColor: '#4f46e5', // Indigo 600
    secondaryColor: '#10b981' // Emerald 500
  });

  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [playerEdits, setPlayerEdits] = useState<Record<string, PlayerEditState>>({});
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

  // Roster Filter State
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState<'ALL' | Position>('ALL');

  // 1. Calculate Base Roster from Match History (Pure Calculation)
  const baseRoster = React.useMemo(() => {
    // Start with clean initial roster AND RESET ARRAYS
    const calculatedRoster = [...INITIAL_ROSTER, ...customPlayers].map(p => ({ ...p, form: [] as number[] }));

    matchHistory.forEach(match => {
      match.performances.forEach(perf => {
        const player = calculatedRoster.find(p => p.id === perf.playerId);
        if (player) {
          // Point System Calculation
          let points = 0;
          if (perf.minutes > 0) points += 1; // Appearance
          if (perf.minutes >= 60) points += 1; // 60+ mins

          // Goals
          if (player.position === Position.FWD) points += perf.goals * 4;
          else if (player.position === Position.MID) points += perf.goals * 5;
          else points += perf.goals * 6; // DEF/GK

          // Assists
          points += perf.assists * 3;

          // Clean Sheet (Only if team didn't concede and played 60+)
          if ((player.position === Position.DEF || player.position === Position.GK) && match.opponentScore === 0 && perf.minutes >= 60) {
            points += 4;
          }

          // Cards
          if (perf.yellowCard) points -= 1;
          if (perf.redCard) points -= 3;

          // Rating Bonus
          if (perf.rating >= 8.5) points += 3;
          else if (perf.rating >= 7.5) points += 2;
          else if (perf.rating >= 6.5) points += 1;

          // Man of the Match Bonus
          if (perf.manOfTheMatch) points += 5;

          // Update player stats
          player.matchesPlayed += 1;
          player.goals += perf.goals;
          player.assists += perf.assists;
          player.totalPoints += points;
          player.cleanSheets += ((player.position === Position.DEF || player.position === Position.GK) && match.opponentScore === 0 && perf.minutes >= 60) ? 1 : 0;
          player.form.push(perf.rating);

          // Recalculate Average
          const sumRatings = player.form.reduce((a, b) => a + b, 0);
          player.averageRating = player.form.length > 0 ? sumRatings / player.form.length : 0;
        }
      });
    });

    return calculatedRoster;
  }, [matchHistory, customPlayers]);

  // 2. Apply Manual Edits to create Final Roster
  const roster = React.useMemo(() => {
    return baseRoster.map(player => {
      const edit = playerEdits[player.id];
      if (!edit) return player;

      return {
        ...player,
        name: edit.name ?? player.name,
        number: edit.number ?? player.number,
        position: edit.position ?? player.position,
        matchesPlayed: player.matchesPlayed + (edit.matchesOffset || 0),
        goals: player.goals + (edit.goalsOffset || 0),
        assists: player.assists + (edit.assistsOffset || 0),
        cleanSheets: player.cleanSheets + (edit.cleanSheetsOffset || 0),
        totalPoints: player.totalPoints + (edit.pointsOffset || 0),
      };
    });
  }, [baseRoster, playerEdits]);

  const leagueStats = React.useMemo(() => {
    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, points = 0;
    const form: string[] = [];

    // Sort matches by date for form guide
    const sortedMatches = [...matchHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedMatches.forEach(m => {
      played++;
      gf += m.myScore;
      ga += m.opponentScore;
      if (m.myScore > m.opponentScore) {
        won++;
        points += 3;
        form.push('W');
      }
      else if (m.myScore === m.opponentScore) {
        drawn++;
        points += 1;
        form.push('D');
      }
      else {
        lost++;
        form.push('L');
      }
    });

    return { played, won, drawn, lost, gf, ga, points, form: form.slice(-5) };
  }, [matchHistory]);

  const teamBalanceData = React.useMemo(() => {
    const data = {
      [Position.GK]: 0,
      [Position.DEF]: 0,
      [Position.MID]: 0,
      [Position.FWD]: 0
    };

    roster.forEach(p => {
      if (p.position !== Position.COACH) {
        data[p.position] += p.totalPoints;
      }
    });

    return [
      { subject: 'GK', A: data[Position.GK], fullMark: 150 },
      { subject: 'DEF', A: data[Position.DEF], fullMark: 150 },
      { subject: 'MID', A: data[Position.MID], fullMark: 150 },
      { subject: 'FWD', A: data[Position.FWD], fullMark: 150 },
    ];
  }, [roster]);


  const handleSaveMatch = (match: MatchRecord) => {
    setMatchHistory(prev => [...prev, match]);
    setCurrentView('dashboard');
  };

  const handleUpdatePlayer = (id: string, updatedData: Partial<Player>) => {
    setPlayerEdits(prev => {
      const basePlayer = baseRoster.find(p => p.id === id);
      if (!basePlayer) return prev;

      const currentEdit = prev[id] || {};
      const newEdit: PlayerEditState = { ...currentEdit };

      // Update Basic Info directly
      if (updatedData.name !== undefined) newEdit.name = updatedData.name;
      if (updatedData.number !== undefined) newEdit.number = updatedData.number;
      if (updatedData.position !== undefined) newEdit.position = updatedData.position;

      // Update Stats by calculating OFFSETS
      // Offset = New Desired Value - Base Calculated Value
      if (updatedData.matchesPlayed !== undefined) newEdit.matchesOffset = updatedData.matchesPlayed - basePlayer.matchesPlayed;
      if (updatedData.goals !== undefined) newEdit.goalsOffset = updatedData.goals - basePlayer.goals;
      if (updatedData.assists !== undefined) newEdit.assistsOffset = updatedData.assists - basePlayer.assists;
      if (updatedData.cleanSheets !== undefined) newEdit.cleanSheetsOffset = updatedData.cleanSheets - basePlayer.cleanSheets;
      if (updatedData.totalPoints !== undefined) newEdit.pointsOffset = updatedData.totalPoints - basePlayer.totalPoints;

      return { ...prev, [id]: newEdit };
    });
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setCustomPlayers(prev => [...prev, newPlayer]);
  };

  const TopPlayersChart = () => {
    const data = [...roster]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5)
      .map(p => ({ name: p.name, points: p.totalPoints }));

    return (
      <div className="h-64 w-full" style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? teamConfig.primaryColor : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const TeamBalanceRadar = () => {
    return (
      <div className="h-64 w-full" style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamBalanceData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Radar
              name="Points"
              dataKey="A"
              stroke={teamConfig.secondaryColor}
              strokeWidth={2}
              fill={teamConfig.secondaryColor}
              fillOpacity={0.4}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); setSelectedMatch(null); }}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all ${currentView === view
        ? 'text-white shadow-lg shadow-black/20 font-bold'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      style={currentView === view ? { backgroundColor: teamConfig.primaryColor } : {}}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-300"
            style={{ backgroundColor: teamConfig.primaryColor }}
          >
            <Shirt className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-white text-lg leading-tight truncate max-w-[140px]" title={teamConfig.name}>{teamConfig.name}</h1>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Manager Mode</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="roster" icon={Users} label="My Team" />
          <NavItem view="history" icon={History} label="Match History" />
          <NavItem view="leaderboard" icon={Trophy} label="Performance Table" />
          <div className="my-6 border-t border-slate-800"></div>
          <button
            onClick={() => setCurrentView('match_input')}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all ${currentView === 'match_input' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
          >
            <PlusCircle size={20} />
            <span className="font-bold">Add Match</span>
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-4">
          <NavItem view="settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: teamConfig.primaryColor }}>
              <Shirt className="text-white" size={18} />
            </div>
            <span className="font-bold text-white truncate max-w-[200px]">{teamConfig.name}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-900 z-40 pt-20 px-6 space-y-4">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="roster" icon={Users} label="My Team" />
            <NavItem view="history" icon={History} label="Match History" />
            <NavItem view="leaderboard" icon={Trophy} label="Performance Table" />
            <NavItem view="match_input" icon={PlusCircle} label="Add Match Data" />
            <NavItem view="settings" icon={Settings} label="Settings" />
          </div>
        )}

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
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
                  <TopPlayersChart />
                </div>

                {/* Right: Radar Chart (New) */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                    <Target size={18} className="text-purple-400" /> Team Balance (Points)
                  </h3>
                  <TeamBalanceRadar />
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
          )}

          {currentView === 'roster' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Squad Roster</h2>
                  <div className="text-slate-400 text-sm mt-1">{roster.length} Players</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsAddPlayerModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Add Player</span>
                  </button>
                  {/* Search */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Search player..."
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Filter */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: Position.GK, label: 'GK' },
                      { id: Position.DEF, label: 'DEF' },
                      { id: Position.MID, label: 'MID' },
                      { id: Position.FWD, label: 'FWD' }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setRosterFilter(filter.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${rosterFilter === filter.id
                          ? 'text-white shadow-lg shadow-black/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        style={rosterFilter === filter.id ? { backgroundColor: teamConfig.primaryColor } : {}}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roster
                  .filter(player => {
                    const matchesSearch = player.name.toLowerCase().includes(rosterSearch.toLowerCase());
                    const matchesFilter = rosterFilter === 'ALL' || player.position === rosterFilter;
                    return matchesSearch && matchesFilter;
                  })
                  .map(player => (
                    <PlayerCard key={player.id} player={player} onUpdate={handleUpdatePlayer} />
                  ))}
              </div>

              {roster.filter(player => {
                const matchesSearch = player.name.toLowerCase().includes(rosterSearch.toLowerCase());
                const matchesFilter = rosterFilter === 'ALL' || player.position === rosterFilter;
                return matchesSearch && matchesFilter;
              }).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                    <Search size={32} className="mb-3 opacity-20" />
                    <p>No players found matching your criteria.</p>
                    <button
                      onClick={() => { setRosterSearch(''); setRosterFilter('ALL'); }}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
            </div>
          )}

          {currentView === 'leaderboard' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Player Performance Table</h2>
              <PlayerLeaderboard roster={roster} />
            </div>
          )}

          {currentView === 'match_input' && (
            <div className="h-[calc(100vh-120px)]">
              <MatchInput
                roster={roster}
                teamName={teamConfig.name}
                onSave={handleSaveMatch}
                onCancel={() => setCurrentView('dashboard')}
              />
            </div>
          )}

          {currentView === 'history' && (
            selectedMatch ? (
              <MatchDetail match={selectedMatch} roster={roster} teamName={teamConfig.name} onBack={() => setSelectedMatch(null)} />
            ) : (
              <MatchHistoryList matches={matchHistory} teamName={teamConfig.name} onSelectMatch={setSelectedMatch} />
            )
          )}

          {currentView === 'settings' && (
            <TeamSettings config={teamConfig} onSave={setTeamConfig} />
          )}
        </div>

        <AddPlayerModal
          isOpen={isAddPlayerModalOpen}
          onClose={() => setIsAddPlayerModalOpen(false)}
          onSave={handleAddPlayer}
        />
      </main>
    </div>
  );
};

export default App;