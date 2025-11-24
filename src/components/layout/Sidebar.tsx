import React from 'react';
import { LayoutDashboard, Users, Trophy, History, PlusCircle, Settings, Shirt } from 'lucide-react';
import { TeamConfig } from '../../types';

export type View = 'dashboard' | 'roster' | 'leaderboard' | 'match_input' | 'history' | 'settings';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    teamConfig: TeamConfig;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    setSelectedMatch: (match: any) => void;
}

interface NavItemProps {
    view: View;
    icon: any;
    label: string;
    currentView: View;
    setCurrentView: (view: View) => void;
    teamConfig: TeamConfig;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    setSelectedMatch: (match: any) => void;
}

const NavItem: React.FC<NavItemProps> = ({ view, icon: Icon, label, currentView, setCurrentView, teamConfig, setIsMobileMenuOpen, setSelectedMatch }) => (
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

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, teamConfig, setIsMobileMenuOpen, setSelectedMatch }) => {
    return (
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
                <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                <NavItem view="roster" icon={Users} label="My Team" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                <NavItem view="history" icon={History} label="Match History" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                <NavItem view="leaderboard" icon={Trophy} label="Performance Table" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
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
                <NavItem view="settings" icon={Settings} label="Settings" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
            </div>
        </aside>
    );
};
