import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_ROSTER } from './../constants';
import { Player, MatchRecord, Position, TeamConfig, PlayerPerformance } from './../types';

// Helper interface for edit state
export interface PlayerEditState {
  name?: string;
  number?: number;
  position?: Position;
  // Offsets for stats
  matchesOffset?: number;
  goalsOffset?: number;
  assistsOffset?: number;
  cleanSheetsOffset?: number;
  pointsOffset?: number;
}

export const useFantasyLeague = () => {
  // --- State ---
  const [teamConfig, setTeamConfig] = useState<TeamConfig>(() => {
    const saved = localStorage.getItem('fantasy_teamConfig');
    return saved ? JSON.parse(saved) : {
      name: 'My Team',
      primaryColor: '#4f46e5', // Indigo 600
      secondaryColor: '#10b981' // Emerald 500
    };
  });

  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(() => {
    const saved = localStorage.getItem('fantasy_matchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [playerEdits, setPlayerEdits] = useState<Record<string, PlayerEditState>>(() => {
    const saved = localStorage.getItem('fantasy_playerEdits');
    return saved ? JSON.parse(saved) : {};
  });

  const [customPlayers, setCustomPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('fantasy_customPlayers');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('fantasy_teamConfig', JSON.stringify(teamConfig));
  }, [teamConfig]);

  useEffect(() => {
    localStorage.setItem('fantasy_matchHistory', JSON.stringify(matchHistory));
  }, [matchHistory]);

  useEffect(() => {
    localStorage.setItem('fantasy_playerEdits', JSON.stringify(playerEdits));
  }, [playerEdits]);

  useEffect(() => {
    localStorage.setItem('fantasy_customPlayers', JSON.stringify(customPlayers));
  }, [customPlayers]);

  // --- Calculations ---
  
  // 1. Calculate Base Roster from Match History
  const baseRoster = useMemo(() => {
    const calculatedRoster = [...INITIAL_ROSTER, ...customPlayers].map(p => ({ ...p, form: [] as number[] }));

    matchHistory.forEach(match => {
      match.performances.forEach(perf => {
        const player = calculatedRoster.find(p => p.id === perf.playerId);
        if (player) {
          let points = 0;
          if (perf.minutes > 0) points += 1;
          if (perf.minutes >= 60) points += 1;

          if (player.position === Position.FWD) points += perf.goals * 4;
          else if (player.position === Position.MID) points += perf.goals * 5;
          else points += perf.goals * 6;

          points += perf.assists * 3;

          if ((player.position === Position.DEF || player.position === Position.GK) && match.opponentScore === 0 && perf.minutes >= 60) {
            points += 4;
          }

          if (perf.yellowCard) points -= 1;
          if (perf.redCard) points -= 3;

          if (perf.rating >= 8.5) points += 3;
          else if (perf.rating >= 7.5) points += 2;
          else if (perf.rating >= 6.5) points += 1;

          if (perf.manOfTheMatch) points += 5;

          player.matchesPlayed += 1;
          player.goals += perf.goals;
          player.assists += perf.assists;
          player.totalPoints += points;
          player.cleanSheets += ((player.position === Position.DEF || player.position === Position.GK) && match.opponentScore === 0 && perf.minutes >= 60) ? 1 : 0;
          player.form.push(perf.rating);

          const sumRatings = player.form.reduce((a, b) => a + b, 0);
          player.averageRating = player.form.length > 0 ? sumRatings / player.form.length : 0;
        }
      });
    });

    return calculatedRoster;
  }, [matchHistory, customPlayers]);

  // 2. Apply Manual Edits
  const roster = useMemo(() => {
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

  const leagueStats = useMemo(() => {
    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, points = 0;
    const form: string[] = [];
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

  const teamBalanceData = useMemo(() => {
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

  // --- Actions ---
  const addMatch = (match: MatchRecord) => {
    setMatchHistory(prev => [...prev, match]);
  };

  const updatePlayer = (id: string, updatedData: Partial<Player>) => {
    setPlayerEdits(prev => {
      const basePlayer = baseRoster.find(p => p.id === id);
      if (!basePlayer) return prev;

      const currentEdit = prev[id] || {};
      const newEdit: PlayerEditState = { ...currentEdit };

      if (updatedData.name !== undefined) newEdit.name = updatedData.name;
      if (updatedData.number !== undefined) newEdit.number = updatedData.number;
      if (updatedData.position !== undefined) newEdit.position = updatedData.position;

      if (updatedData.matchesPlayed !== undefined) newEdit.matchesOffset = updatedData.matchesPlayed - basePlayer.matchesPlayed;
      if (updatedData.goals !== undefined) newEdit.goalsOffset = updatedData.goals - basePlayer.goals;
      if (updatedData.assists !== undefined) newEdit.assistsOffset = updatedData.assists - basePlayer.assists;
      if (updatedData.cleanSheets !== undefined) newEdit.cleanSheetsOffset = updatedData.cleanSheets - basePlayer.cleanSheets;
      if (updatedData.totalPoints !== undefined) newEdit.pointsOffset = updatedData.totalPoints - basePlayer.totalPoints;

      return { ...prev, [id]: newEdit };
    });
  };

  const addPlayer = (newPlayer: Player) => {
    setCustomPlayers(prev => [...prev, newPlayer]);
  };

  return {
    teamConfig,
    setTeamConfig,
    matchHistory,
    roster,
    leagueStats,
    teamBalanceData,
    addMatch,
    updatePlayer,
    addPlayer
  };
};
