import React, { useState } from 'react';
import { League, RivalTeam } from '../types';
import { Plus, Trash2, Trophy, Users, Check, X, AlertCircle } from 'lucide-react';

interface LeagueManagerProps {
    leagues: League[];
    activeLeagueId: string;
    setActiveLeagueId: (id: string) => void;
    createLeague: (name: string, year: string, teams: RivalTeam[]) => void;
    updateLeague: (id: string, updates: Partial<League>) => void;
    deleteLeague: (id: string) => void;
}

export const LeagueManager: React.FC<LeagueManagerProps> = ({
    leagues,
    activeLeagueId,
    setActiveLeagueId,
    createLeague,
    updateLeague,
    deleteLeague
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newLeagueName, setNewLeagueName] = useState('');
    const [newLeagueYear, setNewLeagueYear] = useState(new Date().getFullYear().toString());

    const [editingLeagueId, setEditingLeagueId] = useState<string | null>(null);
    const [newTeamName, setNewTeamName] = useState('');

    const [createError, setCreateError] = useState<string | null>(null);
    const [teamError, setTeamError] = useState<string | null>(null);

    const handleCreateLeague = (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);

        if (!newLeagueName || newLeagueName.trim() === '') {
            setCreateError("League name is required.");
            return;
        }
        if (newLeagueName.length > 50) {
            setCreateError("League name must be 50 characters or less.");
            return;
        }
        if (!newLeagueYear || !/^\d{4}$/.test(newLeagueYear)) {
            setCreateError("Year must be a valid 4-digit number.");
            return;
        }
        const yr = parseInt(newLeagueYear);
        if (yr < 1900 || yr > 2100) {
            setCreateError("Year must be between 1900 and 2100.");
            return;
        }

        // Default teams (can be empty or some presets)
        const defaultTeams: RivalTeam[] = [
            { id: `team-${Date.now()}-1`, name: 'Rival FC' },
            { id: `team-${Date.now()}-2`, name: 'United City' },
        ];

        createLeague(newLeagueName, newLeagueYear, defaultTeams);
        setIsCreating(false);
        setNewLeagueName('');
    };

    const handleAddTeam = (leagueId: string) => {
        setTeamError(null);
        if (!newTeamName || newTeamName.trim() === '') {
            setTeamError("Team name is required.");
            return;
        }
        if (newTeamName.length > 50) {
            setTeamError("Team name must be 50 characters or less.");
            return;
        }

        const league = leagues.find(l => l.id === leagueId);
        if (!league) return;

        const isDuplicate = league.teams.some(
            t => t.name.trim().toLowerCase() === newTeamName.trim().toLowerCase()
        );
        if (isDuplicate) {
            setTeamError(`Rival team "${newTeamName}" already exists in this league.`);
            return;
        }

        const newTeam: RivalTeam = {
            id: `rival-${Date.now()}`,
            name: newTeamName
        };

        updateLeague(leagueId, { teams: [...league.teams, newTeam] });
        setNewTeamName('');
    };

    const handleRemoveTeam = (leagueId: string, teamId: string) => {
        const league = leagues.find(l => l.id === leagueId);
        if (!league) return;

        updateLeague(leagueId, { teams: league.teams.filter(t => t.id !== teamId) });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={20} />
                    Leagues & Seasons
                </h3>
                <button
                    onClick={() => {
                        setCreateError(null);
                        setIsCreating(true);
                    }}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
                >
                    <Plus size={14} /> New Season
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateLeague} className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">Create New League</h4>
                    
                    {createError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-pulse">
                            <AlertCircle size={14} className="shrink-0" />
                            <div className="font-semibold">{createError}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">League Name</label>
                            <input
                                type="text"
                                value={newLeagueName}
                                onChange={(e) => setNewLeagueName(e.target.value)}
                                placeholder="e.g. Season 2025"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                            <input
                                type="text"
                                value={newLeagueYear}
                                onChange={(e) => setNewLeagueYear(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setCreateError(null);
                                setIsCreating(false);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                        >
                            Create League
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {leagues.map(league => (
                    <div
                        key={league.id}
                        className={`bg-slate-800 border rounded-xl overflow-hidden transition-all ${activeLeagueId === league.id ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-700'
                            }`}
                    >
                        <div className="p-4 flex items-center justify-between bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div
                                    onClick={() => setActiveLeagueId(league.id)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${activeLeagueId === league.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600 hover:border-indigo-400'
                                        }`}
                                >
                                    {activeLeagueId === league.id && <Check size={12} className="text-white" />}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">{league.name}</div>
                                    <div className="text-xs text-slate-500">{league.year} • {league.teams.length} Teams</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setTeamError(null);
                                        setNewTeamName('');
                                        setEditingLeagueId(editingLeagueId === league.id ? null : league.id);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${editingLeagueId === league.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                    title="Manage Teams"
                                >
                                    <Users size={16} />
                                </button>
                                {leagues.length > 1 && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this league? All match history will be lost.')) {
                                                deleteLeague(league.id);
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                                        title="Delete League"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Team Editor */}
                        {editingLeagueId === league.id && (
                            <div className="p-4 border-t border-slate-700 bg-slate-900/30">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Manage Teams</h4>

                                {teamError && (
                                    <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-pulse">
                                        <AlertCircle size={14} className="shrink-0" />
                                        <div className="font-semibold">{teamError}</div>
                                    </div>
                                )}

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        placeholder="New Team Name"
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTeam(league.id)}
                                    />
                                    <button
                                        onClick={() => handleAddTeam(league.id)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {league.teams.map(team => (
                                        <div key={team.id} className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 group">
                                            <span className="text-sm text-slate-300">{team.name}</span>
                                            <button
                                                onClick={() => handleRemoveTeam(league.id, team.id)}
                                                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {league.teams.length === 0 && (
                                        <div className="col-span-full text-center py-4 text-xs text-slate-500 italic">
                                            No teams added yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
