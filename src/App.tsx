import { useState } from 'react';
import { AddPlayerModal } from './components/AddPlayerModal';
import { MobileHeader } from './components/layout/MobileHeader';
import { Sidebar, View } from './components/layout/Sidebar';
import { MatchDetail } from './components/MatchDetail';
import { MatchHistoryList } from './components/MatchHistoryList';
import { MatchInput } from './components/MatchInput';
import { PlayerLeaderboard } from './components/PlayerLeaderboard';
import { TeamSettings } from './components/TeamSettings';
import { useFantasyLeague } from './hooks/useFantasyLeague';
import { MatchRecord } from './types';
import { DashboardView } from './views/DashboardView';
import { RosterView } from './views/RosterView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    teamConfig,
    setTeamConfig,
    matchHistory,
    roster,
    leagueStats,
    teamBalanceData,
    addMatch,
    updatePlayer,
    addPlayer,
    importTeam,
    leagues,
    activeLeagueId,
    setActiveLeagueId,
    createLeague,
    updateLeague,
    deleteLeague,
    linkedPlayerId,
    linkPlayerCard
  } = useFantasyLeague();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-500">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setCurrentView('dashboard')} />;
  }

  const activeLeague = leagues.find(l => l.id === activeLeagueId);

  // Filter match history for the active league
  const activeMatchHistory = matchHistory.filter(m =>
    m.leagueId === activeLeagueId || (!m.leagueId && activeLeagueId === 'default-2024')
  );

  const handleSaveMatch = (match: MatchRecord) => {
    addMatch(match);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        teamConfig={teamConfig}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setSelectedMatch={setSelectedMatch}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <MobileHeader
          teamConfig={teamConfig}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          setSelectedMatch={setSelectedMatch}
        />

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              teamConfig={teamConfig}
              leagueStats={leagueStats}
              roster={roster}
              matchHistory={activeMatchHistory}
              teamBalanceData={teamBalanceData}
              setCurrentView={setCurrentView}
              setSelectedMatch={setSelectedMatch}
              activeLeagueName={activeLeague?.name || 'Season 2024'}
            />
          )}

          {currentView === 'roster' && (
            <RosterView
              roster={roster}
              teamConfig={teamConfig}
              setIsAddPlayerModalOpen={setIsAddPlayerModalOpen}
              handleUpdatePlayer={updatePlayer}
              linkedPlayerId={linkedPlayerId}
              onLinkPlayerCard={linkPlayerCard}
              matchHistory={activeMatchHistory}
            />
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
                rivalTeams={activeLeague?.teams || []}
                leagueId={activeLeagueId}
                onSave={handleSaveMatch}
                onCancel={() => setCurrentView('dashboard')}
              />
            </div>
          )}

          {currentView === 'history' && (
            selectedMatch ? (
              <MatchDetail match={selectedMatch} roster={roster} teamName={teamConfig.name} onBack={() => setSelectedMatch(null)} />
            ) : (
              <MatchHistoryList matches={activeMatchHistory} teamName={teamConfig.name} onSelectMatch={setSelectedMatch} />
            )
          )}

          {currentView === 'settings' && (
            <TeamSettings
              config={teamConfig}
              onSave={setTeamConfig}
              importTeam={importTeam}
              leagues={leagues}
              activeLeagueId={activeLeagueId}
              setActiveLeagueId={setActiveLeagueId}
              createLeague={createLeague}
              updateLeague={updateLeague}
              deleteLeague={deleteLeague}
            />
          )}
        </div>

        <AddPlayerModal
          isOpen={isAddPlayerModalOpen}
          onClose={() => setIsAddPlayerModalOpen(false)}
          onSave={addPlayer}
          roster={roster}
        />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;