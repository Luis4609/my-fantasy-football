import React, { useState } from 'react';
import { TeamConfig } from '../types';
import { Save, RefreshCw, Shield } from 'lucide-react';

interface TeamSettingsProps {
  config: TeamConfig;
  onSave: (config: TeamConfig) => void;
}

export const TeamSettings: React.FC<TeamSettingsProps> = ({ config, onSave }) => {
  const [name, setName] = useState(config.name);
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(config.secondaryColor);

  const handleSave = () => {
    onSave({ name, primaryColor, secondaryColor });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white">Team Settings</h2>
        <p className="text-slate-400">Customize your team's identity and appearance.</p>
      </div>
      
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
        <div className="space-y-8">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Team Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xl placeholder:text-slate-700"
              placeholder="Enter team name..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Primary Color</label>
              <div className="flex items-center gap-4 p-3 bg-slate-900 rounded-xl border border-slate-700">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <div className="flex flex-col">
                  <span className="text-slate-300 font-mono text-sm">{primaryColor}</span>
                  <span className="text-slate-500 text-xs">Brand & Highlights</span>
                </div>
              </div>
            </div>
            <div>
               <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Secondary Color</label>
              <div className="flex items-center gap-4 p-3 bg-slate-900 rounded-xl border border-slate-700">
                <input 
                  type="color" 
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                 <div className="flex flex-col">
                  <span className="text-slate-300 font-mono text-sm">{secondaryColor}</span>
                  <span className="text-slate-500 text-xs">Accents & Kit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="pt-6 border-t border-slate-700">
             <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-6">Live Preview</h3>
             
             {/* Preview Card */}
             <div className="relative overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 p-8 flex items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
                
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"
                  style={{ backgroundColor: primaryColor }}
                >
                   <Shield className="text-white" size={40} strokeWidth={2.5} />
                </div>
                
                <div>
                   <h1 className="text-3xl font-black text-white tracking-tight mb-1">{name || "Team Name"}</h1>
                   <div className="flex items-center gap-2">
                     <span 
                       className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border"
                       style={{ color: secondaryColor, borderColor: secondaryColor }}
                     >
                       HOME KIT
                     </span>
                     <span className="text-slate-500 text-sm">Est. 2024</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <Save size={20} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
