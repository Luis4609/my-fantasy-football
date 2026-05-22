import React, { useState } from 'react';
import { Player, MatchRecord, PlayerPerformance, RivalTeam } from '@/types';
import { AlertCircle } from 'lucide-react';
import { PendingResolution } from './match-input/types';
import { MatchHeaderInput } from './match-input/MatchHeaderInput';
import { ExcelUploadButton } from './match-input/ExcelUploadButton';
import { PlayersStatsTable } from './match-input/PlayersStatsTable';
import { FuzzyResolutionModal } from './match-input/FuzzyResolutionModal';

interface MatchInputProps {
  roster: Player[];
  teamName: string;
  rivalTeams: RivalTeam[];
  leagueId: string;
  onSave: (match: MatchRecord) => void;
  onCancel: () => void;
}

export const MatchInput: React.FC<MatchInputProps> = ({
  roster,
  teamName,
  rivalTeams,
  leagueId,
  onSave,
  onCancel,
}) => {
  const [opponent, setOpponent] = useState('');
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [pendingResolutions, setPendingResolutions] = useState<PendingResolution[] | null>(null);
  const [tempPerformances, setTempPerformances] = useState<Record<string, PlayerPerformance> | null>(null);

  // Initialize performances with default values
  const [performances, setPerformances] = useState<Record<string, PlayerPerformance>>(() => {
    const initial: Record<string, PlayerPerformance> = {};
    roster.forEach((p) => {
      initial[p.id] = {
        playerId: p.id,
        minutes: 0,
        goals: 0,
        assists: 0,
        rating: 6,
        yellowCard: false,
        redCard: false,
        manOfTheMatch: false,
      };
    });
    return initial;
  });

  const handleStatChange = (id: string, field: keyof PlayerPerformance, value: any) => {
    setPerformances((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const toggleMotm = (id: string) => {
    setPerformances((prev) => {
      const currentVal = prev[id].manOfTheMatch;
      const newState = { ...prev };

      // If setting to true, clear MOTM from all others to ensure single selection
      if (!currentVal) {
        Object.keys(newState).forEach((key) => {
          newState[key] = { ...newState[key], manOfTheMatch: false };
        });
      }

      newState[id] = { ...newState[id], manOfTheMatch: !currentVal };
      return newState;
    });
  };

  const handleSave = () => {
    setError(null);

    if (!opponent || opponent.trim() === '') {
      setError('Please select or type an opponent name.');
      return;
    }

    if (!date) {
      setError('Please select a match date.');
      return;
    }

    if (myScore < 0 || isNaN(myScore)) {
      setError('Your team score cannot be negative.');
      return;
    }

    if (oppScore < 0 || isNaN(oppScore)) {
      setError('Opponent score cannot be negative.');
      return;
    }

    const activePerformances = (Object.values(performances) as PlayerPerformance[]).filter((p) => p.minutes > 0);

    if (activePerformances.length === 0) {
      setError("You must add at least one player to the lineup (check 'Played?').");
      return;
    }

    let totalGoals = 0;
    let totalAssists = 0;
    let motmCount = 0;

    // Validate each active performance
    for (const perf of activePerformances) {
      const player = roster.find((p) => p.id === perf.playerId);
      const name = player ? player.name : `ID ${perf.playerId}`;

      if (perf.minutes < 0 || isNaN(perf.minutes)) {
        setError(`Minutes for ${name} cannot be negative.`);
        return;
      }
      if (perf.minutes > 120) {
        setError(`Minutes for ${name} cannot exceed 120.`);
        return;
      }
      if (perf.goals < 0 || isNaN(perf.goals)) {
        setError(`Goals for ${name} cannot be negative.`);
        return;
      }
      if (perf.assists < 0 || isNaN(perf.assists)) {
        setError(`Assists for ${name} cannot be negative.`);
        return;
      }
      if (perf.rating < 1 || perf.rating > 10 || isNaN(perf.rating)) {
        setError(`Rating for ${name} must be between 1 and 10.`);
        return;
      }

      totalGoals += perf.goals;
      totalAssists += perf.assists;
      if (perf.manOfTheMatch) {
        motmCount++;
      }
    }

    if (totalGoals > myScore) {
      setError(`Sum of individual player goals (${totalGoals}) cannot exceed your team's score (${myScore}).`);
      return;
    }
    if (totalAssists > myScore) {
      setError(`Sum of individual player assists (${totalAssists}) cannot exceed your team's score (${myScore}).`);
      return;
    }
    if (motmCount > 1) {
      setError('Only one player can be selected as Man of the Match.');
      return;
    }

    const matchRecord: MatchRecord = {
      id: Date.now().toString(),
      leagueId,
      date,
      opponent,
      myScore,
      opponentScore: oppScore,
      performances: activePerformances,
    };

    onSave(matchRecord);
  };

  const handleResolveChange = (index: number, playerId: string) => {
    if (!pendingResolutions) return;
    const updated = [...pendingResolutions];
    updated[index] = {
      ...updated[index],
      selectedPlayerId: playerId,
    };
    setPendingResolutions(updated);
  };

  const confirmResolutions = () => {
    if (!pendingResolutions || !tempPerformances) return;

    const finalPerformances = { ...tempPerformances };

    pendingResolutions.forEach((res) => {
      if (res.selectedPlayerId && res.selectedPlayerId !== 'skip') {
        finalPerformances[res.selectedPlayerId] = {
          ...finalPerformances[res.selectedPlayerId],
          ...res.parsedData,
        };
      }
    });

    setPerformances(finalPerformances);

    // Clean up wizard states
    setPendingResolutions(null);
    setTempPerformances(null);
  };

  const cancelResolutions = () => {
    setPendingResolutions(null);
    setTempPerformances(null);
  };

  const handleExcelUploadSuccess = (updatedPerformances: Record<string, PlayerPerformance>, _message: string) => {
    setPerformances(updatedPerformances);
  };

  const handleExcelUploadError = (_message: string) => {
  };

  const handleExcelPendingResolutions = (
    resolutions: PendingResolution[],
    nextPerformances: Record<string, PlayerPerformance>
  ) => {
    setTempPerformances(nextPerformances);
    setPendingResolutions(resolutions);
  };

  const setPlayed = (id: string, played: boolean) => {
    handleStatChange(id, 'minutes', played ? 90 : 0);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col h-full">
      {/* Header / Match Info */}
      <div className="p-6 border-b border-slate-700 bg-slate-900/50">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-pulse">
            <AlertCircle size={18} className="shrink-0" />
            <div className="font-semibold">{error}</div>
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Input Match Stats</h2>
          <ExcelUploadButton
            roster={roster}
            performances={performances}
            onUploadSuccess={handleExcelUploadSuccess}
            onUploadError={handleExcelUploadError}
            onPendingResolutions={handleExcelPendingResolutions}
          />
        </div>

        <MatchHeaderInput
          opponent={opponent}
          onChangeOpponent={setOpponent}
          rivalTeams={rivalTeams}
          date={date}
          onChangeDate={setDate}
          teamName={teamName}
          myScore={myScore}
          onChangeMyScore={setMyScore}
          oppScore={oppScore}
          onChangeOppScore={setOppScore}
          onCancel={onCancel}
          onSave={handleSave}
        />
      </div>

      {/* Players Grid */}
      <PlayersStatsTable
        roster={roster}
        performances={performances}
        onChangeStat={handleStatChange}
        onToggleMotm={toggleMotm}
        onSetPlayed={setPlayed}
      />

      {/* Fuzzy Match Wizard Modal */}
      {pendingResolutions && pendingResolutions.length > 0 && (
        <FuzzyResolutionModal
          pendingResolutions={pendingResolutions}
          roster={roster}
          onConfirm={confirmResolutions}
          onCancel={cancelResolutions}
          onChangeResolution={handleResolveChange}
        />
      )}
    </div>
  );
};