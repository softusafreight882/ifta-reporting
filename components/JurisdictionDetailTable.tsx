
import React from 'react';
import { TaxLiabilityRow, FleetSummary } from '../types';
import { US_STATES } from '../constants';

interface JurisdictionDetailTableProps {
  data: TaxLiabilityRow[];
  summary: FleetSummary;
}

export const JurisdictionDetailTable: React.FC<JurisdictionDetailTableProps> = ({ data, summary }) => {
  if (!data || data.length === 0) return null;

  // Create a map for quick lookup of existing jurisdictional data
  // Fixed typo: changed "item item" to "item" and added explicit Map types to ensure 'row' is typed correctly.
  const dataMap = new Map<string, TaxLiabilityRow>(data.map(item => [item.state, item]));

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-10 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Jurisdiction Detail (Official Format)</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Full fleet reconciliation spreadsheet based on standard IFTA reporting template</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-primary/20 no-print">
            <span className="material-symbols-outlined text-sm">table_chart</span>
            Spreadsheet View
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] uppercase font-black tracking-widest">
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">Jurisdiction</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 dark:border-slate-700">Total Miles (MJ)</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 dark:border-slate-700">Taxable Gallons (FJ)</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 dark:border-slate-700">Tax Rate (JT)</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 dark:border-slate-700">Tax Due (TD)</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 dark:border-slate-700">Gallons Purchased (FPJ)</th>
                <th className="px-4 py-3 text-right border-r border-slate-200 dark:border-slate-700">Tax Paid (PP)</th>
                <th className="px-4 py-3 text-right">Net Tax Owed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {US_STATES.map((stateCode) => {
                const row = dataMap.get(stateCode);
                const isActive = row && (row.miles > 0 || row.fuelPurchased > 0);

                return (
                  <tr 
                    key={stateCode} 
                    className={`transition-colors text-[11px] font-medium ${
                      isActive 
                        ? 'bg-primary/5 dark:bg-primary/10 text-slate-900 dark:text-white' 
                        : 'text-slate-400 dark:text-slate-600'
                    } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                  >
                    <td className="px-4 py-2 font-black border-r border-slate-100 dark:border-slate-800">{stateCode}</td>
                    <td className="px-4 py-2 text-right border-r border-slate-100 dark:border-slate-800">
                      {isActive ? row.miles.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-4 py-2 text-right border-r border-slate-100 dark:border-slate-800">
                      {isActive ? row.fuelConsumed.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-4 py-2 text-right border-r border-slate-100 dark:border-slate-800 font-mono">
                      {isActive ? `$${row.taxRate.toFixed(4)}` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right border-r border-slate-100 dark:border-slate-800">
                      {isActive ? `$${row.taxDue.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="px-4 py-2 text-right border-r border-slate-100 dark:border-slate-800">
                      {isActive ? row.fuelPurchased.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-4 py-2 text-right border-r border-slate-100 dark:border-slate-800">
                      {isActive ? `$${row.taxPaidAtPump.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className={`px-4 py-2 text-right font-black ${
                      isActive ? (row.netTax > 0 ? 'text-red-500' : 'text-green-500') : ''
                    }`}>
                      {isActive 
                        ? (row.netTax < 0 ? `($${Math.abs(row.netTax).toFixed(2)})` : `$${row.netTax.toFixed(2)}`) 
                        : '$0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-black text-xs uppercase tracking-tight">
                <td className="px-4 py-4 border-r border-slate-700">TOTALS (RECONCILED)</td>
                <td className="px-4 py-4 text-right border-r border-slate-700">
                  {summary.totalDistance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-4 text-right border-r border-slate-700 text-indigo-400">
                  {summary.totalFuel > 0 ? (summary.totalDistance / summary.averageMpg).toFixed(2) : '0.00'}
                </td>
                <td className="px-4 py-4 text-center border-r border-slate-700 italic text-[9px] text-slate-500">Fleet MPG: {summary.averageMpg}</td>
                <td className="px-4 py-4 text-right border-r border-slate-700">
                  ${data.reduce((acc, r) => acc + r.taxDue, 0).toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right border-r border-slate-700">
                  {summary.totalFuel.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-4 text-right border-r border-slate-700">
                  ${data.reduce((acc, r) => acc + r.taxPaidAtPump, 0).toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right bg-primary">
                  {summary.estimatedTax < 0 
                    ? `($${Math.abs(summary.estimatedTax).toFixed(2)})` 
                    : `$${summary.estimatedTax.toFixed(2)}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/20 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-xs">verified</span>
          Calculated using standard IFTA order of operations. Net Tax = (MJ / Fleet MPG * JT) - (FPJ * JT).
        </div>
      </div>
    </div>
  );
};
