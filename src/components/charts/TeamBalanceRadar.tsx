import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { TeamConfig } from '../../types';

interface TeamBalanceRadarProps {
    data: { subject: string; A: number; fullMark: number }[];
    teamConfig: TeamConfig;
}

export const TeamBalanceRadar: React.FC<TeamBalanceRadarProps> = ({ data, teamConfig }) => {
    return (
        <div className="h-64 w-full" style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                        name="Points"
                        dataKey="A"
                        stroke={teamConfig.secondaryColor}
                        strokeWidth={2}
                        fill={teamConfig.secondaryColor}
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
