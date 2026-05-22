import React from 'react';
import { TeamConfig, League, RivalTeam, Player } from '@/types';
import { LeagueManager } from './LeagueManager';
import { TeamIdentitySettings } from './team-settings/TeamIdentitySettings';
import { TeamImporter } from './team-settings/TeamImporter';

interface TeamSettingsProps {
  config: TeamConfig;
  onSave: (config: TeamConfig) => void;
  importTeam: (teamName: string, players: Player[]) => void;
  leagues: League[];
  activeLeagueId: string;
  setActiveLeagueId: (id: string) => void;
  createLeague: (name: string, year: string, teams: RivalTeam[]) => void;
  updateLeague: (id: string, updates: Partial<League>) => void;
  deleteLeague: (id: string) => void;
}

export const TeamSettings: React.FC<TeamSettingsProps> = ({
  config,
  onSave,
  importTeam,
  leagues,
  activeLeagueId,
  setActiveLeagueId,
  createLeague,
  updateLeague,
  deleteLeague,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white">Team Settings</h2>
        <p className="text-slate-400">Customize your team's identity and appearance.</p>
      </div>

      {/* Team Identity Settings */}
      <TeamIdentitySettings config={config} onSave={onSave} />

      {/* Import Team Section */}
      <TeamImporter importTeam={importTeam} />

      {/* League Manager Section */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
        <LeagueManager
          leagues={leagues}
          activeLeagueId={activeLeagueId}
          setActiveLeagueId={setActiveLeagueId}
          createLeague={createLeague}
          updateLeague={updateLeague}
          deleteLeague={deleteLeague}
        />
      </div>
    </div>
  );
};
