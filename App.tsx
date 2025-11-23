import React, { useState, useEffect } from 'react';
import { INITIAL_ROSTER, INITIAL_LEAGUE } from './constants';
import { Player, LeagueTeam, MatchRecord, Position, PlayerPerformance } from './types';
import { PlayerCard } from './components/PlayerCard';
import { PlayerLeaderboard } from './components/PlayerLeaderboard';
import { MatchInput } from './components/MatchInput';
import { MatchHistoryList } from './components/MatchHistoryList';
import { MatchDetail } from './components/MatchDetail';
import { LayoutDashboard, Users, Trophy, Menu, X, Shirt, PlusCircle, History, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type View = 'dashboard' | 'roster' | 'leaderboard' | 'match_input' | 'history';

const App = () => {
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  
  // Roster Filter State
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState<'ALL' | Position>('ALL');

  // Derived state: Roster with Stats
  const roster = React.useMemo(() => {
    // Start with clean initial roster
    const calculatedRoster = INITIAL_ROSTER.map(p => ({ ...p }));

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

          // Update player stats
          player.matchesPlayed += 1;
          player.goals += perf.goals;
          player.assists += perf.assists;
          player.totalPoints += points;
          player.cleanSheets += ((player.position === Position.DEF || player.position === Position.GK) && match.opponentScore === 0 && perf.minutes >= 60) ? 1 : 0;
          player.form.push(perf.rating);
          
          // Recalculate Average
          const sumRatings = player.form.reduce((a, b) => a + b, 0);
          player.averageRating = sumRatings / player.form.length;
        }
      });
    });

    return calculatedRoster;
  }, [matchHistory]);

  const leagueStats = React.useMemo(() => {
    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, points = 0;
    
    matchHistory.forEach(m => {
      played++;
      gf += m.myScore;
      ga += m.opponentScore;
      if (m.myScore > m.opponentScore) { won++; points += 3; }
      else if (m.myScore === m.opponentScore) { drawn++; points += 1; }
      else { lost++; }
    });

    return { played, won, drawn, lost, gf, ga, points };
  }, [matchHistory]);


  const handleSaveMatch = (match: MatchRecord) => {
    setMatchHistory(prev => [...prev, match]);
    setCurrentView('dashboard');
  };

  const TopPlayersChart = () => {
    const data = [...roster]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5)
      .map(p => ({ name: p.name, points: p.totalPoints }));

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); setSelectedMatch(null); }}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all ${currentView === view ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shirt className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">Fantasy<br/>Futbol</h1>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <Shirt className="text-white" size={18} />
            </div>
            <span className="font-bold text-white">Fantasy Futbol</span>
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
          </div>
        )}

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
                   <h3 className="text-indigo-200 text-sm font-medium mb-1">Season Record</h3>
                   <div className="flex items-end gap-2">
                     <span className="text-5xl font-black">{leagueStats.points}</span>
                     <span className="text-indigo-200 mb-2">pts</span>
                   </div>
                   <div className="mt-4 flex gap-4 text-sm font-medium opacity-80">
                     <span>W: {leagueStats.won}</span>
                     <span>D: {leagueStats.drawn}</span>
                     <span>L: {leagueStats.lost}</span>
                   </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                   <h3 className="text-slate-400 text-sm font-medium mb-1">Total Team Fantasy Points</h3>
                   <span className="text-4xl font-bold text-white">
                     {roster.reduce((acc, curr) => acc + curr.totalPoints, 0)}
                   </span>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                   <h3 className="text-slate-400 text-sm font-medium mb-1">Club Top Scorer</h3>
                   {(() => {
                     const topScorer = [...roster].sort((a, b) => b.goals - a.goals)[0];
                     return (
                       <div className="flex items-center justify-between mt-2">
                         <span className="text-2xl font-bold text-white truncate">{topScorer?.goals > 0 ? topScorer.name : 'N/A'}</span>
                         <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-lg font-bold">{topScorer?.goals || 0} G</span>
                       </div>
                     )
                   })()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Users size={18} className="text-indigo-400" /> MVP Standings (Points)
                    </h3>
                    <TopPlayersChart />
                 </div>
                 <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <History size={18} className="text-slate-400" /> Recent Matches
                    </h3>
                    {matchHistory.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm py-8">
                        <p>No matches played yet.</p>
                        <button onClick={() => setCurrentView('match_input')} className="mt-2 text-indigo-400 hover:text-indigo-300">Add your first match</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {matchHistory.slice().reverse().slice(0, 5).map(match => (
                          <div 
                            key={match.id} 
                            onClick={() => { setSelectedMatch(match); setCurrentView('history'); }}
                            className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
                          >
                            <span className="font-semibold text-slate-300">{match.opponent}</span>
                            <div className={`font-bold font-mono px-2 py-1 rounded ${
                              match.myScore > match.opponentScore ? 'bg-green-500/20 text-green-400' :
                              match.myScore === match.opponentScore ? 'bg-slate-500/20 text-slate-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {match.myScore} - {match.opponentScore}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
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
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                           rosterFilter === filter.id 
                             ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                             : 'text-slate-400 hover:text-white hover:bg-slate-800'
                         }`}
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
                    <PlayerCard key={player.id} player={player} />
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
                onSave={handleSaveMatch} 
                onCancel={() => setCurrentView('dashboard')} 
              />
            </div>
          )}

          {currentView === 'history' && (
            selectedMatch ? (
              <MatchDetail match={selectedMatch} roster={roster} onBack={() => setSelectedMatch(null)} />
            ) : (
              <MatchHistoryList matches={matchHistory} onSelectMatch={setSelectedMatch} />
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default App;