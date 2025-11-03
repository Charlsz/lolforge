'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyTimeline } from '@/lib/types';

interface TimelineChartProps {
  data: MonthlyTimeline[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  // Format month for display (2024-10 -> Oct)
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Prepare data for chart
  const chartData = data.map(item => ({
    month: formatMonth(item.month),
    'Win Rate': parseFloat(item.winRate.toFixed(1)),
    'KDA': parseFloat(item.avgKDA.toFixed(2)),
    games: item.games,
  }));

  return (
    <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
      <h2 className="text-xl font-bold text-[#FFFAFA] mb-4">Performance Timeline</h2>
      <p className="text-sm text-[#E0EDFF]/60 mb-6">Your Win Rate and KDA progression over time</p>

      {/* Win Rate Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-[#6366F1] mb-3 uppercase tracking-wide">Win Rate by Month</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0EDFF10" />
            <XAxis 
              dataKey="month" 
              stroke="#E0EDFF60"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#E0EDFF60"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1C1E22', 
                border: '1px solid #6366F1',
                borderRadius: '8px',
                color: '#FFFAFA'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Win Rate') return `${value}%`;
                return value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="Win Rate" 
              stroke="#6366F1" 
              strokeWidth={3}
              dot={{ fill: '#6366F1', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* KDA Chart */}
      <div>
        <h3 className="text-sm font-semibold text-[#6366F1] mb-3 uppercase tracking-wide">KDA by Month</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0EDFF10" />
            <XAxis 
              dataKey="month" 
              stroke="#E0EDFF60"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#E0EDFF60"
              style={{ fontSize: '12px' }}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1C1E22', 
                border: '1px solid #10B981',
                borderRadius: '8px',
                color: '#FFFAFA'
              }}
              formatter={(value: number) => value.toFixed(2)}
            />
            <Line 
              type="monotone" 
              dataKey="KDA" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {chartData.map((item, index) => (
          <div key={index} className="bg-[#23262A] rounded-lg p-3 text-center">
            <div className="text-[#E0EDFF]/60 text-xs mb-1">{item.month}</div>
            <div className="text-[#FFFAFA] font-bold">{item['Win Rate']}%</div>
            <div className="text-[#E0EDFF]/60 text-xs">{item.games} games</div>
          </div>
        ))}
      </div>
    </div>
  );
}
