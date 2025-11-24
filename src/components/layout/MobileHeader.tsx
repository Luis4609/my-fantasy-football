import React from 'react';
import { LayoutDashboard, Users, Trophy, History, PlusCircle, Settings, Shirt, Menu, X } from 'lucide-react';
import { TeamConfig } from '../../types';
import { View } from './Sidebar';

interface MobileHeaderProps {
    teamConfig: TeamConfig;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    currentView: View;
    setCurrentView: (view: View) => void;
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

export const MobileHeader: React.FC<MobileHeaderProps> = ({ teamConfig, isMobileMenuOpen, setIsMobileMenuOpen, currentView, setCurrentView, setSelectedMatch }) => {
    return (
        <>
            <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: teamConfig.primaryColor }}>
                        <Shirt className="text-white" size={18} />
                    </div>
                    <span className="font-bold text-white truncate max-w-[200px]">{teamConfig.name}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </header>

            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-slate-900 z-40 pt-20 px-6 space-y-4">
                    <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                    <NavItem view="roster" icon={Users} label="My Team" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                    <NavItem view="history" icon={History} label="Match History" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                    <NavItem view="leaderboard" icon={Trophy} label="Performance Table" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                    <NavItem view="match_input" icon={PlusCircle} label="Add Match Data" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                    <NavItem view="settings" icon={Settings} label="Settings" currentView={currentView} setCurrentView={setCurrentView} teamConfig={teamConfig} setIsMobileMenuOpen={setIsMobileMenuOpen} setSelectedMatch={setSelectedMatch} />
                </div>
            )}
        </>
    );
};
