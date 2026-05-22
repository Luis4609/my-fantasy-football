import { useState, useEffect, useMemo } from 'react';
import { INITIAL_ROSTER, OPPONENTS } from '@/constants';
import { Player, MatchRecord, Position, TeamConfig, League, RivalTeam } from '@/types';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';

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
  const { isAuthenticated, apiFetch, user } = useAuth();

  // --- State ---
  const [teamConfig, setTeamConfig] = useState<TeamConfig>({
    name: 'My Team',
    primaryColor: '#4f46e5', // Indigo 600
    secondaryColor: '#10b981' // Emerald 500
  });
  const [linkedPlayerId, setLinkedPlayerId] = useState<string | null>(null);

  const [leagues, setLeagues] = useState<League[]>(() => {
    // Default initial league
    return [{
      id: 'default-2024',
      name: 'Season 2024',
      year: '2024',
      teams: OPPONENTS.map((name, i) => ({ id: `rival-${i}`, name })),
      isActive: true
    }];
  });

  const [activeLeagueId, setActiveLeagueId] = useState<string>(() => {
    const saved = localStorage.getItem('fantasy_activeLeagueId');
    return saved || 'default-2024';
  });

  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [playerEdits, setPlayerEdits] = useState<Record<string, PlayerEditState>>({});
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);

  // Keep active league ID persistent in localstorage (UI preferences)
  useEffect(() => {
    localStorage.setItem('fantasy_activeLeagueId', activeLeagueId);
  }, [activeLeagueId]);

  // --- Load and Migrate Data ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const data = await api.getAllData(apiFetch);
        setTeamConfig(data.teamConfig);
        if (data.leagues && data.leagues.length > 0) {
          setLeagues(data.leagues);
        }
        setMatchHistory(data.matches || []);
        setCustomPlayers(data.customPlayers || []);
        setPlayerEdits(data.playerEdits || {});
        setLinkedPlayerId(data.linkedPlayerId || null);

        // Set active league
        if (data.leagues && data.leagues.length > 0) {
          const defaultActive = data.leagues[0].id;
          setActiveLeagueId(prev => data.leagues.some((l: any) => l.id === prev) ? prev : defaultActive);
        }
      } catch (err) {
        console.error('Error fetching data from server:', err);
      }
    };

    const checkMigrationAndLoad = async () => {
      if (!user) return;
      const migrationKey = `fantasy_migrated_${user.id}`;
      const alreadyMigrated = localStorage.getItem(migrationKey);

      if (!alreadyMigrated) {
        // Retrieve local storage values if they exist
        const localTeamConfig = localStorage.getItem('fantasy_teamConfig');
        const localLeagues = localStorage.getItem('fantasy_leagues');
        const localMatchHistory = localStorage.getItem('fantasy_matchHistory');
        const localCustomPlayers = localStorage.getItem('fantasy_customPlayers');
        const localPlayerEdits = localStorage.getItem('fantasy_playerEdits');

        // Check if there is anything to migrate
        if (localTeamConfig || localLeagues || localMatchHistory || localCustomPlayers || localPlayerEdits) {
          console.log('Migrating offline data to server for user:', user.email);
          try {
            await api.syncAllData(apiFetch, {
              teamConfig: localTeamConfig ? JSON.parse(localTeamConfig) : undefined,
              leagues: localLeagues ? JSON.parse(localLeagues) : undefined,
              matches: localMatchHistory ? JSON.parse(localMatchHistory) : undefined,
              customPlayers: localCustomPlayers ? JSON.parse(localCustomPlayers) : undefined,
              playerEdits: localPlayerEdits ? JSON.parse(localPlayerEdits) : undefined
            });
            localStorage.setItem(migrationKey, 'true');
            console.log('Migration complete');
          } catch (err) {
            console.error('Migration failed:', err);
          }
        } else {
          localStorage.setItem(migrationKey, 'true');
        }
      }

      await loadData();
    };

    checkMigrationAndLoad();
  }, [isAuthenticated, user]);

  // --- Calculations ---
  
  // 1. Calculate Base Roster from Match History
  const baseRoster = useMemo(() => {
    const playersToMap = teamConfig.hasCustomRoster ? customPlayers : [...INITIAL_ROSTER, ...customPlayers];
    const calculatedRoster = playersToMap.map(p => ({ ...p, form: [] as number[] }));
    
    // Filter matches by active league
    const activeMatches = matchHistory.filter(m => m.leagueId === activeLeagueId || (!m.leagueId && activeLeagueId === 'default-2024'));

    activeMatches.forEach(match => {
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
  }, [matchHistory, customPlayers, activeLeagueId]);

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
    const activeMatches = matchHistory.filter(m => m.leagueId === activeLeagueId || (!m.leagueId && activeLeagueId === 'default-2024'));
    const sortedMatches = [...activeMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
  }, [matchHistory, activeLeagueId]);

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
  
  const saveTeamConfig = (config: TeamConfig) => {
    setTeamConfig(config);
    if (isAuthenticated) {
      api.saveTeamConfig(apiFetch, config).catch(err => console.error("Error saving team config:", err));
    }
  };

  const addMatch = (match: MatchRecord) => {
    const matchWithLeague = { ...match, leagueId: activeLeagueId };
    const updatedHistory = [...matchHistory, matchWithLeague];
    setMatchHistory(updatedHistory);

    if (isAuthenticated) {
      api.saveMatches(apiFetch, updatedHistory).catch(err => console.error("Error saving match history:", err));
    }
  };

  const createLeague = (name: string, year: string, teams: RivalTeam[]) => {
    const newLeague: League = {
      id: `league-${Date.now()}`,
      name,
      year,
      teams,
      isActive: true
    };
    const updatedLeagues = [...leagues, newLeague];
    setLeagues(updatedLeagues);
    setActiveLeagueId(newLeague.id);

    if (isAuthenticated) {
      api.saveLeagues(apiFetch, updatedLeagues).catch(err => console.error("Error saving leagues:", err));
    }
  };

  const updateLeague = (id: string, updates: Partial<League>) => {
    const updatedLeagues = leagues.map(l => l.id === id ? { ...l, ...updates } : l);
    setLeagues(updatedLeagues);

    if (isAuthenticated) {
      api.saveLeagues(apiFetch, updatedLeagues).catch(err => console.error("Error saving leagues:", err));
    }
  };

  const deleteLeague = (id: string) => {
    if (leagues.length <= 1) return; // Prevent deleting last league
    const updatedLeagues = leagues.filter(l => l.id !== id);
    setLeagues(updatedLeagues);

    let newActiveId = activeLeagueId;
    if (activeLeagueId === id) {
      newActiveId = leagues.find(l => l.id !== id)?.id || '';
      setActiveLeagueId(newActiveId);
    }

    if (isAuthenticated) {
      api.saveLeagues(apiFetch, updatedLeagues).catch(err => console.error("Error deleting league:", err));
    }
  };

  const updatePlayer = (id: string, updatedData: Partial<Player>) => {
    const basePlayer = baseRoster.find(p => p.id === id);
    if (!basePlayer) return;

    const currentEdit = playerEdits[id] || {};
    const newEdit: PlayerEditState = { ...currentEdit };

    if (updatedData.name !== undefined) newEdit.name = updatedData.name;
    if (updatedData.number !== undefined) newEdit.number = updatedData.number;
    if (updatedData.position !== undefined) newEdit.position = updatedData.position;

    if (updatedData.matchesPlayed !== undefined) newEdit.matchesOffset = updatedData.matchesPlayed - basePlayer.matchesPlayed;
    if (updatedData.goals !== undefined) newEdit.goalsOffset = updatedData.goals - basePlayer.goals;
    if (updatedData.assists !== undefined) newEdit.assistsOffset = updatedData.assists - basePlayer.assists;
    if (updatedData.cleanSheets !== undefined) newEdit.cleanSheetsOffset = updatedData.cleanSheets - basePlayer.cleanSheets;
    if (updatedData.totalPoints !== undefined) newEdit.pointsOffset = updatedData.totalPoints - basePlayer.totalPoints;

    const updatedEdits = { ...playerEdits, [id]: newEdit };
    setPlayerEdits(updatedEdits);

    if (isAuthenticated) {
      api.savePlayerEdits(apiFetch, updatedEdits).catch(err => console.error("Error saving player edits:", err));
    }
  };

  const addPlayer = (newPlayer: Player) => {
    const updatedCustomPlayers = [...customPlayers, newPlayer];
    setCustomPlayers(updatedCustomPlayers);

    if (isAuthenticated) {
      api.saveCustomPlayers(apiFetch, updatedCustomPlayers).catch(err => console.error("Error saving custom players:", err));
    }
  };

  const importTeam = async (teamName: string, players: Player[]) => {
    const newConfig = {
      ...teamConfig,
      name: teamName,
      hasCustomRoster: true
    };
    
    const defaultLeague = [{
      id: 'default-2024',
      name: 'Season 2024',
      year: '2024',
      teams: OPPONENTS.map((name, i) => ({ id: `rival-${i}`, name })),
      isActive: true
    }];

    setTeamConfig(newConfig);
    setCustomPlayers(players);
    setPlayerEdits({});
    setMatchHistory([]);
    setLeagues(defaultLeague);
    setActiveLeagueId('default-2024');

    if (isAuthenticated) {
      try {
        await api.syncAllData(apiFetch, {
          teamConfig: newConfig,
          customPlayers: players,
          playerEdits: {},
          matches: [],
          leagues: defaultLeague
        });
      } catch (err) {
        console.error("Error syncing imported team:", err);
      }
    }
  };

  const linkPlayerCard = async (playerId: string | null) => {
    if (isAuthenticated) {
      try {
        await api.linkPlayerCard(apiFetch, playerId);
        setLinkedPlayerId(playerId);
      } catch (err) {
        console.error("Error linking player card:", err);
      }
    }
  };

  return {
    teamConfig,
    setTeamConfig: saveTeamConfig,
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
  };
};

