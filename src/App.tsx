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

const App = () => {
  const {
    teamConfig,
    setTeamConfig,
    matchHistory,
    roster,
    leagueStats,
    teamBalanceData,
    addMatch,
    updatePlayer,
    addPlayer
  } = useFantasyLeague();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

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
              matchHistory={matchHistory}
              teamBalanceData={teamBalanceData}
              setCurrentView={setCurrentView}
              setSelectedMatch={setSelectedMatch}
            />
          )}

          {currentView === 'roster' && (
            <RosterView
              roster={roster}
              teamConfig={teamConfig}
              setIsAddPlayerModalOpen={setIsAddPlayerModalOpen}
              handleUpdatePlayer={updatePlayer}
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
          onSave={addPlayer}
        />
      </main>
    </div>
  );
};

export default App;