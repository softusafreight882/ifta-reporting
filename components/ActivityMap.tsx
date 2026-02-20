
import React from 'react';
import { TaxLiabilityRow } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ActivityMapProps {
  data: TaxLiabilityRow[];
}

export const ActivityMap: React.FC<ActivityMapProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-10 pb-12 no-print">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Mileage Activity by Jurisdiction</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Visual distribution of MJ (Miles Traveled) across operating states</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="state" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 900}}
                stroke="#94a3b8"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700}}
                stroke="#94a3b8"
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#ffffff'
                }} 
              />
              <Bar dataKey="miles" radius={[4, 4, 0, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.netTax > 0 ? '#ef4444' : '#1b273b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-primary"></div>
            <span className="text-slate-500">Credit Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-red-500"></div>
            <span className="text-slate-500">Tax Liability</span>
          </div>
        </div>
      </div>
    </div>
  );
};
