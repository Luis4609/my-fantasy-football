import React, { useRef, useState } from 'react';
import { read, utils } from 'xlsx';
import { Player, Position, PlayerPerformance } from '@/types';
import { FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSmartSimilarity } from '@/utils/stringSimilarity';
import { PendingResolution } from './types';

interface ExcelUploadButtonProps {
  roster: Player[];
  performances: Record<string, PlayerPerformance>;
  onUploadSuccess: (updatedPerformances: Record<string, PlayerPerformance>, message: string) => void;
  onUploadError: (message: string) => void;
  onPendingResolutions: (resolutions: PendingResolution[], tempPerformances: Record<string, PlayerPerformance>) => void;
}

export const ExcelUploadButton: React.FC<ExcelUploadButtonProps> = ({
  roster,
  performances,
  onUploadSuccess,
  onUploadError,
  onPendingResolutions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      let exactMatchedCount = 0;
      const newPerformances = { ...performances };
      const resolutionsList: PendingResolution[] = [];

      // Normalize helper
      const normalize = (str: string) => str?.toString().toLowerCase().trim();

      jsonData.forEach((row: any) => {
        const rowName = row['Name'] || row['Player'] || row['Nombre'] || row['name'];
        if (!rowName) return;

        const minutes = parseInt(row['Minutes'] || row['Minutos'] || row['minutes'] || '0') || (row['Played'] === 'Yes' ? 90 : 0);
        if (minutes <= 0) return; // Skip if they didn't play

        const isMotm = row['MOTM'] || row['MVP'] || row['motm'] || row['mvp'];
        const parsedData = {
          minutes: minutes,
          rating: parseFloat(row['Rating'] || row['Nota'] || row['rating'] || '6'),
          goals: parseInt(row['Goals'] || row['Goles'] || row['goals'] || '0'),
          assists: parseInt(row['Assists'] || row['Asistencias'] || row['assists'] || '0'),
          yellowCard: !!(row['Yellow'] || row['Amarilla'] || row['yellow']),
          redCard: !!(row['Red'] || row['Roja'] || row['red']),
          manOfTheMatch: isMotm === 'Yes' || isMotm === true || isMotm === 1,
        };

        const player = roster.find((p) => normalize(p.name) === normalize(rowName));

        if (player) {
          exactMatchedCount++;
          newPerformances[player.id] = {
            ...newPerformances[player.id],
            ...parsedData,
          };
        } else {
          // Calculate fuzzy matches
          const activeRosterPlayers = roster.filter((p) => p.position !== Position.COACH);
          const suggestions = activeRosterPlayers
            .map((p) => ({
              player: p,
              similarity: getSmartSimilarity(rowName, p.name),
            }))
            .filter((item) => item.similarity >= 40)
            .sort((s1, s2) => s2.similarity - s1.similarity)
            .slice(0, 3);

          const defaultSelectedId = suggestions.length > 0 ? suggestions[0].player.id : 'skip';

          resolutionsList.push({
            excelName: rowName,
            parsedData,
            suggestions,
            selectedPlayerId: defaultSelectedId,
          });
        }
      });

      if (resolutionsList.length > 0) {
        onPendingResolutions(resolutionsList, newPerformances);
      } else {
        onUploadSuccess(newPerformances, `Successfully matched ${exactMatchedCount} players exactly.`);
        setUploadStatus({
          type: 'success',
          message: `Successfully matched ${exactMatchedCount} players exactly.`,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Excel parse error:', error);
      onUploadError('Failed to parse file. Ensure headers are: Name, Minutes, Rating, Goals, Assists.');
      setUploadStatus({
        type: 'error',
        message: 'Failed to parse file. Ensure headers are: Name, Minutes, Rating, Goals, Assists.',
      });
    }
  };

  const handleClearInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadStatus(null);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      <button
        onClick={() => {
          handleClearInput();
          fileInputRef.current?.click();
        }}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-600"
      >
        <FileSpreadsheet size={16} className="text-green-400" />
        Upload Excel / CSV
      </button>
      {uploadStatus && (
        <div
          className={`text-xs flex items-center gap-1.5 ${
            uploadStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {uploadStatus.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {uploadStatus.message}
        </div>
      )}
      <div className="text-[10px] text-slate-500">Columns: Name, Minutes, Rating, Goals, Assists, MOTM</div>
    </div>
  );
};
