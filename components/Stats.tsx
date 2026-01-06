
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TaskStats, Priority } from '../types';

interface StatsProps {
  stats: TaskStats;
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  // 数据清洗：如果没有任何任务，显示默认的占位数据以保持视觉平衡
  const isEmpty = stats.total === 0;

  const pieData = isEmpty 
    ? [{ name: '无任务', value: 1 }]
    : [
        { name: '已完成', value: stats.completed },
        { name: '进行中', value: stats.pending },
      ];

  const barData = [
    { name: '低', value: stats.priorityBreakdown[Priority.LOW], fill: '#10b981' },
    { name: '中', value: stats.priorityBreakdown[Priority.MEDIUM], fill: '#f59e0b' },
    { name: '高', value: stats.priorityBreakdown[Priority.HIGH], fill: '#f43f5e' },
  ];

  const PIE_COLORS = isEmpty ? ['#f1f5f9'] : ['#6366f1', '#e2e8f0'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
          任务完成率
          {!isEmpty && (
            <span className="text-sm font-normal text-slate-400">
              ({Math.round((stats.completed / stats.total) * 100)}%)
            </span>
          )}
        </h4>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={isEmpty ? 0 : 5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              {!isEmpty && <Tooltip formatter={(value, name) => [value, name]} />}
            </PieChart>
          </ResponsiveContainer>
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-medium">
              暂无数据
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <h4 className="text-slate-800 font-bold mb-4">优先级分布</h4>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
              />
              <YAxis 
                hide 
                domain={[0, Math.max(...barData.map(d => d.value)) + 1]} 
              />
              <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => [value, '任务数量']} />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-medium">
              暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
