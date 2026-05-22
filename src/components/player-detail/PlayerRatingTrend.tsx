import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

interface PlayerRatingTrendProps {
  trendData: {
    matchIndex: number;
    opponent: string;
    rating: number;
    goals: number;
    assists: number;
  }[];
  secondaryColor: string;
}

export const PlayerRatingTrend: React.FC<PlayerRatingTrendProps> = ({ trendData, secondaryColor }) => {
  return (
    <div className="flex-1 flex flex-col min-h-[300px]">
      {trendData.length > 0 ? (
        <div className="w-full h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="matchIndex" stroke="#64748b" tickFormatter={(v) => `G${v}`} />
              <YAxis domain={[0, 10]} stroke="#64748b" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs space-y-1.5 text-white">
                        <p className="font-bold text-slate-300">vs {data.opponent}</p>
                        <p>
                          Rating: <span className="font-mono text-indigo-400 font-bold">{data.rating.toFixed(1)}</span>
                        </p>
                        {(data.goals > 0 || data.assists > 0) && (
                          <p className="text-emerald-400">
                            Goals/Assists: {data.goals}/{data.assists}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke={secondaryColor}
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ stroke: secondaryColor, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          No rating trends available. Set player performances in matches first.
        </div>
      )}
    </div>
  );
};
