
import React, { useState, useEffect } from 'react';
import { US_STATES, MOCK_TRUCKS } from '../constants';
import { JurisdictionEntry } from '../types';

interface AddTripFormProps {
  onSave: (tripData: any) => void;
  onCancel: () => void;
}

export const AddTripForm: React.FC<AddTripFormProps> = ({ onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [truckId, setTruckId] = useState(MOCK_TRUCKS[0].id);
  const [odoStart, setOdoStart] = useState<number>(0);
  const [odoEnd, setOdoEnd] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<JurisdictionEntry[]>([
    { state: 'NY', miles: 0, fuel: 0 }
  ]);

  const totalMilesFromOdo = Math.max(0, odoEnd - odoStart);
  const totalMilesFromBreakdown = breakdown.reduce((acc, curr) => acc + curr.miles, 0);
  const totalFuel = breakdown.reduce((acc, curr) => acc + curr.fuel, 0);
  const averageMpg = totalFuel > 0 ? (totalMilesFromBreakdown / totalFuel).toFixed(2) : '0.00';

  const addJurisdiction = () => {
    setBreakdown([...breakdown, { state: 'PA', miles: 0, fuel: 0 }]);
  };

  const updateJurisdiction = (index: number, field: keyof JurisdictionEntry, value: string | number) => {
    const newBreakdown = [...breakdown];
    if (field === 'miles' || field === 'fuel') {
      newBreakdown[index][field] = Number(value);
    } else {
      newBreakdown[index].state = value as string;
    }
    setBreakdown(newBreakdown);
  };

  const removeJurisdiction = (index: number) => {
    if (breakdown.length > 1) {
      setBreakdown(breakdown.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (odoEnd <= odoStart) {
      alert("Odometer end must be greater than start");
      return;
    }
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      date,
      truckId,
      odometerStart: odoStart,
      odometerEnd: odoEnd,
      totalMiles: totalMilesFromOdo,
      totalFuel,
      breakdown
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary dark:text-white">Log New Trip</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Enter trip details and jurisdictional breakdown for precise IFTA filing.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-opacity-90">
            Save Trip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Trip Info */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="material-symbols-outlined text-primary dark:text-slate-400">info</span>
              <h2 className="text-lg font-bold text-primary dark:text-white">Trip Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Trip</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Truck / Fleet ID</label>
                <select 
                  value={truckId}
                  onChange={(e) => setTruckId(e.target.value)}
                  className="w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  {MOCK_TRUCKS.map(truck => (
                    <option key={truck.id} value={truck.id}>{truck.id} ({truck.name})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Odometer Start</label>
                <input 
                  type="number" 
                  value={odoStart}
                  onChange={(e) => setOdoStart(Number(e.target.value))}
                  className="w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                  placeholder="0" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Odometer End</label>
                <input 
                  type="number" 
                  value={odoEnd}
                  onChange={(e) => setOdoEnd(Number(e.target.value))}
                  className="w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                  placeholder="0" 
                />
                {odoEnd > 0 && odoEnd <= odoStart && (
                  <p className="text-[12px] text-red-500 font-medium">
                    <span className="material-symbols-outlined !text-[14px]">error</span> Odometer end must be greater than start
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Breakdown */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary dark:text-slate-400">map</span>
                  <h2 className="text-lg font-bold text-primary dark:text-white">Jurisdiction Breakdown</h2>
                </div>
                <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary dark:bg-primary/20 dark:text-white">
                  {breakdown.length} Jurisdictions
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="pb-4 pr-4">State/Province</th>
                      <th className="pb-4 pr-4">Miles Traveled</th>
                      <th className="pb-4 pr-4">Fuel Purchased (Gal)</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {breakdown.map((row, index) => (
                      <tr key={index}>
                        <td className="py-4 pr-4">
                          <select 
                            value={row.state}
                            onChange={(e) => updateJurisdiction(index, 'state', e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="py-4 pr-4">
                          <input 
                            type="number" 
                            value={row.miles}
                            onChange={(e) => updateJurisdiction(index, 'miles', e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                          />
                        </td>
                        <td className="py-4 pr-4">
                          <input 
                            type="number" 
                            value={row.fuel}
                            onChange={(e) => updateJurisdiction(index, 'fuel', e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                          />
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => removeJurisdiction(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={addJurisdiction}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-sm font-bold text-slate-600 transition-all hover:border-primary/50 hover:bg-white hover:text-primary dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <span className="material-symbols-outlined">add_circle</span>
                Add Another Jurisdiction
              </button>
            </div>
          </section>
        </div>

        {/* Summary Sidebar */}
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-primary dark:text-white">Trip Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Odometer Distance</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{totalMilesFromOdo} mi</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Jurisdiction Total</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{totalMilesFromBreakdown} mi</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Fuel</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{totalFuel} gal</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm font-bold text-primary dark:text-white">Average MPG</span>
                <span className="text-sm font-black text-primary dark:text-white">{averageMpg}</span>
              </div>
            </div>
            
            <div className={`mt-6 rounded-lg p-4 ${totalMilesFromOdo === totalMilesFromBreakdown ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
              <div className="flex items-start gap-3">
                <span className={`material-symbols-outlined ${totalMilesFromOdo === totalMilesFromBreakdown ? 'text-green-600' : 'text-amber-600'}`}>
                  {totalMilesFromOdo === totalMilesFromBreakdown ? 'check_circle' : 'warning'}
                </span>
                <p className={`text-xs font-medium ${totalMilesFromOdo === totalMilesFromBreakdown ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {totalMilesFromOdo === totalMilesFromBreakdown 
                    ? 'Odometer totals match the jurisdictional breakdown perfectly.' 
                    : 'Discrepancy detected between odometer and jurisdictional miles.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
