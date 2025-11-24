import React, { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Player, Position, TeamConfig } from '../../types';
import { PlayerCard } from './../components/PlayerCard';

interface RosterViewProps {
    roster: Player[];
    teamConfig: TeamConfig;
    setIsAddPlayerModalOpen: (isOpen: boolean) => void;
    handleUpdatePlayer: (id: string, updatedData: Partial<Player>) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
    roster,
    teamConfig,
    setIsAddPlayerModalOpen,
    handleUpdatePlayer
}) => {
    const [rosterSearch, setRosterSearch] = useState('');
    const [rosterFilter, setRosterFilter] = useState<'ALL' | Position>('ALL');

    return (
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
    );
};
