import React, { useState, useRef } from 'react';
import { Player, Position } from '@/types';
import { FileSpreadsheet, AlertCircle, CheckCircle2, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { read, utils } from 'xlsx';

interface TeamImporterProps {
  importTeam: (teamName: string, players: Player[]) => void;
}

export const TeamImporter: React.FC<TeamImporterProps> = ({ importTeam }) => {
  const [importTeamName, setImportTeamName] = useState('');
  const [parsedPlayers, setParsedPlayers] = useState<Player[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsePosition = (val: any): Position => {
    if (!val) return Position.MID;
    const str = val.toString().trim().toLowerCase();
    if (['gk', 'po', 'por', 'portero', 'arquero', 'goalkeeper', 'guardameta'].includes(str)) return Position.GK;
    if (['def', 'df', 'defensa', 'zaguero', 'defender', 'ld', 'li', 'ct', 'central'].includes(str)) return Position.DEF;
    if (['mid', 'mc', 'med', 'medio', 'centrocampista', 'volante', 'pivote', 'midfielder'].includes(str)) return Position.MID;
    if (['fwd', 'dl', 'del', 'delantero', 'atacante', 'punta', 'extremo', 'forward', 'striker'].includes(str)) return Position.FWD;
    if (['coach', 'co', 'ent', 'entrenador', 'mister', 'míster', 'dt'].includes(str)) return Position.COACH;

    if (str.startsWith('gk') || str.startsWith('por')) return Position.GK;
    if (str.startsWith('def') || str.startsWith('df')) return Position.DEF;
    if (str.startsWith('mid') || str.startsWith('med') || str.startsWith('mc')) return Position.MID;
    if (str.startsWith('del') || str.startsWith('dl') || str.startsWith('fwd')) return Position.FWD;
    if (str.startsWith('coach') || str.startsWith('ent') || str.startsWith('dt')) return Position.COACH;

    return Position.MID;
  };

  const parseNumber = (val: any): number | null => {
    if (val === undefined || val === null || val === '') return null;
    const num = parseInt(val);
    if (isNaN(num) || num < 1 || num > 99) return null;
    return num;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    setParsedPlayers([]);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        setImportError('No data found in the spreadsheet.');
        return;
      }

      const usedNumbers = new Set<number>();
      const rawRows = jsonData
        .map((row: any) => {
          const findVal = (keysToMatch: string[]) => {
            const foundKey = Object.keys(row).find((k) => {
              const normalizedKey = k.trim().toLowerCase();
              return keysToMatch.includes(normalizedKey);
            });
            return foundKey ? row[foundKey] : undefined;
          };

          const name = findVal(['name', 'nombre', 'jugador', 'player']);
          const posVal = findVal(['position', 'posición', 'posicion', 'puesto', 'rol']);
          const numVal = findVal(['number', 'número', 'numero', 'dorsal', 'no', 'num', 'shirt', 'camiseta']);

          return {
            name: name ? name.toString().trim() : '',
            position: parsePosition(posVal),
            number: parseNumber(numVal),
          };
        })
        .filter((r) => r.name !== '');

      if (rawRows.length === 0) {
        setImportError(
          'Could not find any players with valid names in the Excel sheet. Ensure headers match Name / Nombre.'
        );
        return;
      }

      // Add specified numbers first
      rawRows.forEach((row) => {
        if (row.number !== null) {
          usedNumbers.add(row.number);
        }
      });

      // Generator for free numbers
      const getFirstFree = () => {
        for (let i = 1; i <= 99; i++) {
          if (!usedNumbers.has(i)) {
            usedNumbers.add(i);
            return i;
          }
        }
        return 99;
      };

      const finalPlayers: Player[] = rawRows.map((row, index) => {
        const num = row.number !== null ? row.number : getFirstFree();
        return {
          id: `custom-${Date.now()}-${index}`,
          name: row.name,
          position: row.position,
          number: num,
          matchesPlayed: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          totalPoints: 0,
          averageRating: 0,
          form: [],
        };
      });

      setParsedPlayers(finalPlayers);
      setImportSuccess(
        `Successfully parsed ${finalPlayers.length} players. Please verify the squad below and click 'Import Team'.`
      );
    } catch (err) {
      console.error('Error parsing team excel:', err);
      setImportError('Failed to read the file. Ensure it is a valid Excel (.xlsx, .xls) or CSV file.');
    }
  };

  const handleImportExecute = () => {
    setImportError(null);
    if (!importTeamName || importTeamName.trim() === '') {
      setImportError('Please enter a name for the new team.');
      return;
    }
    if (importTeamName.trim().length > 50) {
      setImportError('Team name must be 50 characters or less.');
      return;
    }
    if (parsedPlayers.length === 0) {
      setImportError('No parsed players available to import. Please upload a file first.');
      return;
    }

    importTeam(importTeamName.trim(), parsedPlayers);

    // Clear states
    setImportTeamName('');
    setParsedPlayers([]);
    setImportSuccess('Team successfully imported! Roster replaced and matches reset.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelImport = () => {
    setImportTeamName('');
    setParsedPlayers([]);
    setImportError(null);
    setImportSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="text-green-400" size={24} />
          Import Squad from Excel / CSV
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Set up your entire team roster in one step by uploading a spreadsheet.
        </p>
      </div>

      {importError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-pulse">
          <AlertCircle size={18} className="shrink-0" />
          <div className="font-semibold">{importError}</div>
        </div>
      )}

      {importSuccess && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="shrink-0 animate-bounce" />
          <div className="font-semibold">{importSuccess}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">New Team Name</label>
          <input
            type="text"
            value={importTeamName}
            onChange={(e) => setImportTeamName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg placeholder:text-slate-700"
            placeholder="E.g. Real Coders FC..."
          />
        </div>

        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-green-500/50 rounded-2xl p-8 bg-slate-900/30 transition-all cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <Upload size={32} className="text-slate-500 group-hover:text-green-400 transition-colors mb-3" />
          <span className="text-slate-300 font-bold text-sm">Click to select spreadsheet file</span>
          <span className="text-slate-500 text-xs mt-1">
            Supports .xlsx, .xls, .csv with columns: Name, Position, Number (Optional)
          </span>
        </div>
      </div>

      {parsedPlayers.length > 0 && (
        <div className="pt-6 border-t border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Roster Preview ({parsedPlayers.length} Players)
            </h4>
            <button
              onClick={handleCancelImport}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-colors"
            >
              <Trash2 size={12} /> Clear Preview
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/50">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 sticky top-0 text-slate-400 text-xs font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Player Name</th>
                  <th className="p-3 text-center">Position</th>
                  <th className="p-3 text-center">Shirt #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {parsedPlayers.map((p, idx) => {
                  const posColor =
                    p.position === Position.GK
                      ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                      : p.position === Position.DEF
                      ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'
                      : p.position === Position.MID
                      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                      : p.position === Position.FWD
                      ? 'text-red-400 bg-red-400/10 border-red-400/20'
                      : 'text-purple-400 bg-purple-400/10 border-purple-400/20';

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-semibold text-white">{p.name}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${posColor}`}>
                          {p.position}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-400">#{p.number}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs flex gap-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">WARNING</span>
              Importing this team will replace your current roster, clear all player attributes/stats, and reset all
              matches/leagues. This action is permanent.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleImportExecute}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              <Upload size={18} /> Confirm & Import Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
