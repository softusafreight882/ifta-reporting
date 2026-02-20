
import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  highlight?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, unit, icon, trend, highlight }) => {
  return (
    <div className={`p-6 rounded-xl border shadow-sm transition-all ${
      highlight 
        ? 'bg-white dark:bg-slate-900 border-primary/20 dark:border-primary border-2 ring-1 ring-primary/5' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`${highlight ? 'text-primary dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'} text-sm font-medium`}>
          {label}
        </p>
        <span className={`material-symbols-outlined ${highlight ? 'text-primary dark:text-slate-300' : 'text-slate-400'} text-xl`}>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-2xl font-bold ${highlight ? 'text-primary dark:text-white' : 'text-slate-900 dark:text-white'}`}>
          {value} {unit && <span className="text-sm font-normal text-slate-500">{unit}</span>}
        </h3>
        {trend && (
          <p className={`${trend.isUp ? 'text-green-600' : 'text-red-600'} text-xs font-bold flex items-center`}>
            {trend.isUp ? '+' : ''}{trend.value}
          </p>
        )}
      </div>
    </div>
  );
};
