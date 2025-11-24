import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Player, TeamConfig } from '../../types';

interface TopPlayersChartProps {
    roster: Player[];
    teamConfig: TeamConfig;
}

export const TopPlayersChart: React.FC<TopPlayersChartProps> = ({ roster, teamConfig }) => {
    const data = [...roster]
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5)
        .map(p => ({ name: p.name, points: p.totalPoints }));

    return (
        <div className="h-64 w-full" style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? teamConfig.primaryColor : '#6366f1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
