import React, { useState } from 'react';
import { Position, Player } from '../types';
import { X, Save, UserPlus } from 'lucide-react';

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (player: Player) => void;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [number, setNumber] = useState<number | ''>('');
    const [position, setPosition] = useState<Position>(Position.MID);

    // Initial stats (optional)
    const [matchesPlayed, setMatchesPlayed] = useState<number | ''>(0);
    const [goals, setGoals] = useState<number | ''>(0);
    const [assists, setAssists] = useState<number | ''>(0);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !number) return;

        const newPlayer: Player = {
            id: `custom-${Date.now()}`,
            name,
            number: Number(number),
            position,
            matchesPlayed: Number(matchesPlayed) || 0,
            goals: Number(goals) || 0,
            assists: Number(assists) || 0,
            cleanSheets: 0,
            totalPoints: 0, // Will be calculated or edited later
            averageRating: 0,
            form: []
        };

        onSave(newPlayer);
        onClose();

        // Reset form
        setName('');
        setNumber('');
        setPosition(Position.MID);
        setMatchesPlayed(0);
        setGoals(0);
        setAssists(0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="text-emerald-400" size={24} />
                        Add New Player
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Player Name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Number</label>
                                <input
                                    type="number"
                                    required
                                    value={number}
                                    onChange={(e) => setNumber(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="#"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Position</label>
                                <select
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value as Position)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                >
                                    {Object.values(Position).map((pos) => (
                                        <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 my-4 pt-4">
                        <h3 className="text-sm font-bold text-slate-300 mb-3">Initial Stats (Optional)</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Matches</label>
                                <input
                                    type="number"
                                    value={matchesPlayed}
                                    onChange={(e) => setMatchesPlayed(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Goals</label>
                                <input
                                    type="number"
                                    value={goals}
                                    onChange={(e) => setGoals(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assists</label>
                                <input
                                    type="number"
                                    value={assists}
                                    onChange={(e) => setAssists(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Player
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
