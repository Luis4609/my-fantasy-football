import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

interface PlayerAttributesRadarProps {
  attributes: { subject: string; value: number }[];
  playerName: string;
  primaryColor: string;
}

export const PlayerAttributesRadar: React.FC<PlayerAttributesRadarProps> = ({
  attributes,
  playerName,
  primaryColor,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
      {/* Recharts Radar */}
      <div className="h-64 md:h-72 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={attributes}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 99]} tick={false} axisLine={false} />
            <Radar
              name={playerName}
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2}
              fill={primaryColor}
              fillOpacity={0.35}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Attributes Numerical Detail */}
      <div className="space-y-4">
        <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
          Attribute Ratings
        </h5>
        <div className="space-y-2.5">
          {attributes.map((attr, idx) => {
            let barColor = 'bg-red-500';
            if (attr.value >= 80) barColor = 'bg-emerald-400';
            else if (attr.value >= 65) barColor = 'bg-indigo-500';
            else if (attr.value >= 50) barColor = 'bg-yellow-500';

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{attr.subject}</span>
                  <span className="text-white font-mono">{attr.value} / 99</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${attr.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
