import React, { useState, useRef } from 'react';
import { Player, Position, MatchRecord, PlayerPerformance } from '../types';
import { OPPONENTS } from '../constants';
import { Save, Calendar, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { read, utils } from 'xlsx';

interface MatchInputProps {
  roster: Player[];
  teamName: string;
  onSave: (match: MatchRecord) => void;
  onCancel: () => void;
}

export const MatchInput: React.FC<MatchInputProps> = ({ roster, teamName, onSave, onCancel }) => {
  const [opponent, setOpponent] = useState('');
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Initialize performances with default values
  const [performances, setPerformances] = useState<Record<string, PlayerPerformance>>(() => {
    const initial: Record<string, PlayerPerformance> = {};
    roster.forEach(p => {
      initial[p.id] = {
        playerId: p.id,
        minutes: 0, // Default to 0, user sets to 90 or whatever
        goals: 0,
        assists: 0,
        rating: 6, // Average default
        yellowCard: false,
        redCard: false,
        manOfTheMatch: false
      };
    });
    return initial;
  });

  const handleStatChange = (id: string, field: keyof PlayerPerformance, value: any) => {
    setPerformances(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const toggleMotm = (id: string) => {
    setPerformances(prev => {
      const currentVal = prev[id].manOfTheMatch;
      const newState = { ...prev };
      
      // If setting to true, clear MOTM from all others to ensure single selection
      if (!currentVal) {
        Object.keys(newState).forEach(key => {
          newState[key] = { ...newState[key], manOfTheMatch: false };
        });
      }
      
      newState[id] = { ...newState[id], manOfTheMatch: !currentVal };
      return newState;
    });
  };

  const handleSave = () => {
    if (!opponent) {
      alert("Please enter an opponent name");
      return;
    }

    const matchRecord: MatchRecord = {
      id: Date.now().toString(),
      date,
      opponent,
      myScore,
      opponentScore: oppScore,
      performances: (Object.values(performances) as PlayerPerformance[]).filter(p => p.minutes > 0) // Only save players who played
    };

    onSave(matchRecord);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      let matchedCount = 0;
      let newPerformances = { ...performances };

      // Normalize helper
      const normalize = (str: string) => str?.toString().toLowerCase().trim();

      jsonData.forEach((row: any) => {
        // Try to find player by name (fuzzy match if possible, but exact for now)
        const rowName = row['Name'] || row['Player'] || row['Nombre'] || row['name'];
        if (!rowName) return;

        const player = roster.find(p => normalize(p.name) === normalize(rowName));
        
        if (player) {
          matchedCount++;
          const minutes = parseInt(row['Minutes'] || row['Minutos'] || row['minutes'] || '0') || (row['Played'] === 'Yes' ? 90 : 0);
          
          if (minutes > 0) {
            const isMotm = row['MOTM'] || row['MVP'] || row['motm'] || row['mvp'];
            newPerformances[player.id] = {
              ...newPerformances[player.id],
              minutes: minutes,
              rating: parseFloat(row['Rating'] || row['Nota'] || row['rating'] || '6'),
              goals: parseInt(row['Goals'] || row['Goles'] || row['goals'] || '0'),
              assists: parseInt(row['Assists'] || row['Asistencias'] || row['assists'] || '0'),
              yellowCard: (row['Yellow'] || row['Amarilla'] || row['yellow']) ? true : false,
              redCard: (row['Red'] || row['Roja'] || row['red']) ? true : false,
              manOfTheMatch: (isMotm === 'Yes' || isMotm === true || isMotm === 1) ? true : false
            };
          }
        }
      });

      setPerformances(newPerformances);
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully updated data for ${matchedCount} players from file.` 
      });

      // Clear file input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error("Excel parse error:", error);
      setUploadStatus({ 
        type: 'error', 
        message: "Failed to parse file. Ensure headers are: Name, Minutes, Rating, Goals, Assists." 
      });
    }
  };

  // Helper to set quick preset for played match
  const setPlayed = (id: string, played: boolean) => {
    handleStatChange(id, 'minutes', played ? 90 : 0);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col h-full">
      {/* Header / Match Info */}
      <div className="p-6 border-b border-slate-700 bg-slate-900/50">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Input Match Stats</h2>
          <div className="flex flex-col items-end gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv" 
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-600"
            >
              <FileSpreadsheet size={16} className="text-green-400" />
              Upload Excel / CSV
            </button>
            {uploadStatus && (
              <div className={`text-xs flex items-center gap-1.5 ${uploadStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {uploadStatus.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {uploadStatus.message}
              </div>
            )}
            <div className="text-[10px] text-slate-500">
              Columns: Name, Minutes, Rating, Goals, Assists, MOTM
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Opponent</label>
            <input 
              type="text" 
              list="opponents-list"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Select or type team name..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <datalist id="opponents-list">
              {OPPONENTS.map(team => (
                <option key={team} value={team} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase mb-2 truncate" style={{ color: '#818cf8' }}>{teamName}</label>
              <input 
                type="number" 
                min="0"
                value={myScore}
                onChange={(e) => setMyScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <span className="mb-3 font-bold text-slate-500">-</span>
            <div className="flex-1">
              <label className="block text-xs font-bold text-red-400 uppercase mb-2">Opponent</label>
              <input 
                type="number" 
                min="0"
                value={oppScore}
                onChange={(e) => setOppScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-end justify-end gap-3">
             <button 
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all"
            >
              <Save size={18} /> Save Match
            </button>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 font-semibold text-slate-400 text-sm">Player</th>
              <th className="p-4 font-semibold text-slate-400 text-sm text-center">Played?</th>
              <th className="p-4 font-semibold text-slate-400 text-sm w-32 text-center">Rating (1-10)</th>
              <th className="p-4 font-semibold text-slate-400 text-sm w-24 text-center">Goals</th>
              <th className="p-4 font-semibold text-slate-400 text-sm w-24 text-center">Assists</th>
              <th className="p-4 font-semibold text-slate-400 text-sm text-center">MOTM</th>
              <th className="p-4 font-semibold text-slate-400 text-sm text-center">Cards</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {roster.filter(p => p.position !== Position.COACH).map(player => {
              const perf = performances[player.id];
              const isPlaying = perf.minutes > 0;

              return (
                <tr key={player.id} className={`hover:bg-slate-700/30 transition-colors ${isPlaying ? 'bg-indigo-900/10' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
                         player.position === Position.GK ? 'text-yellow-400 border-yellow-400/30' :
                         player.position === Position.DEF ? 'text-blue-400 border-blue-400/30' :
                         player.position === Position.MID ? 'text-emerald-400 border-emerald-400/30' :
                         'text-red-400 border-red-400/30'
                      }`}>
                        {player.position.substring(0, 3).toUpperCase()}
                      </span>
                      <div className="font-medium text-white">{player.name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={isPlaying}
                      onChange={(e) => setPlayed(player.id, e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="number" 
                      min="1" max="10" step="0.1"
                      disabled={!isPlaying}
                      value={perf.rating}
                      onChange={(e) => handleStatChange(player.id, 'rating', parseFloat(e.target.value))}
                      className={`w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono ${!isPlaying ? 'opacity-30' : 'text-white'}`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="number" 
                      min="0"
                      disabled={!isPlaying}
                      value={perf.goals}
                      onChange={(e) => handleStatChange(player.id, 'goals', parseInt(e.target.value))}
                      className={`w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center ${!isPlaying ? 'opacity-30' : 'text-green-400 font-bold'}`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="number" 
                      min="0"
                      disabled={!isPlaying}
                      value={perf.assists}
                      onChange={(e) => handleStatChange(player.id, 'assists', parseInt(e.target.value))}
                      className={`w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center ${!isPlaying ? 'opacity-30' : 'text-blue-400 font-bold'}`}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      disabled={!isPlaying}
                      onClick={() => toggleMotm(player.id)}
                      className={`p-2 rounded-full transition-all ${
                        perf.manOfTheMatch ? 'text-yellow-400 bg-yellow-400/10 scale-110' : 'text-slate-600 hover:text-yellow-400 hover:bg-slate-800'
                      } ${!isPlaying ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title="Man of the Match"
                    >
                      <Star size={18} fill={perf.manOfTheMatch ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      disabled={!isPlaying}
                      onClick={() => handleStatChange(player.id, 'yellowCard', !perf.yellowCard)}
                      className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
                        perf.yellowCard ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-yellow-500/50'
                      } ${!isPlaying ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title="Yellow Card"
                    >
                      <div className="w-3 h-4 bg-current rounded-sm"></div>
                    </button>
                    <button 
                      disabled={!isPlaying}
                      onClick={() => handleStatChange(player.id, 'redCard', !perf.redCard)}
                      className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
                        perf.redCard ? 'bg-red-500 text-white border-red-600' : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-red-500/50'
                      } ${!isPlaying ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title="Red Card"
                    >
                      <div className="w-3 h-4 bg-current rounded-sm"></div>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};