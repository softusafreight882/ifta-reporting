
import React, { useState, useMemo } from 'react';
import { KpiCard } from './components/KpiCard';
import { AddTripForm } from './components/AddTripForm';
import { ReportImporter } from './components/ReportImporter';
import { ActivityMap } from './components/ActivityMap';
import { JurisdictionDetailTable } from './components/JurisdictionDetailTable';
import { Trip, ViewMode, FleetSummary, TaxLiabilityRow } from './types';
import { STATE_TAX_RATES } from './constants';
import { getComplianceInsights } from './geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [aiInsights, setAiInsights] = useState<{riskLevel: string, summary: string, recommendations: string[]} | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Derived state for the entire fleet using mandatory IFTA chain logic
  const fleetSummary = useMemo<FleetSummary>(() => {
    // 1. Total TM (Total Miles)
    const totalDist = trips.reduce((acc, trip) => acc + trip.totalMiles, 0);
    // 2. Total FC (Total Fuel Purchased) - Diesel only
    const totalFuel = trips.reduce((acc, trip) => acc + trip.totalFuel, 0);
    // 3. Fleet MPG (Calculated ONCE at fleet level)
    const avgMpg = totalFuel > 0 ? totalDist / totalFuel : 0;
    
    let totalNetTax = 0;
    const stateStats: Record<string, { miles: number; fuelPurchased: number }> = {};
    
    trips.forEach(trip => {
      trip.breakdown.forEach(entry => {
        if (!stateStats[entry.state]) stateStats[entry.state] = { miles: 0, fuelPurchased: 0 };
        stateStats[entry.state].miles += entry.miles;
        stateStats[entry.state].fuelPurchased += entry.fuel;
      });
    });

    // 4. Calculate Net Tax across all jurisdictions
    Object.entries(stateStats).forEach(([state, stats]) => {
      const rate = STATE_TAX_RATES[state] || STATE_TAX_RATES['DEFAULT'];
      // FJ = MJ / MPG
      const fj = stats.miles / (avgMpg || 1);
      // TD = FJ * JT
      const td = fj * rate;
      // PP = FPJ * JT
      const pp = stats.fuelPurchased * rate;
      totalNetTax += (td - pp);
    });

    return {
      totalDistance: totalDist,
      totalFuel: totalFuel,
      averageMpg: Number(avgMpg.toFixed(4)), // Use 4 decimal places for IFTA accuracy
      estimatedTax: totalNetTax
    };
  }, [trips]);

  // Tax Liability Table following official IFTA Worksheet nomenclature
  const taxLiabilityData = useMemo<TaxLiabilityRow[]>(() => {
    const data: Record<string, { miles: number; fuelPurchased: number }> = {};
    
    // Aggregate across all imported reports
    trips.forEach(trip => {
      trip.breakdown.forEach(entry => {
        if (!data[entry.state]) data[entry.state] = { miles: 0, fuelPurchased: 0 };
        data[entry.state].miles += entry.miles;
        data[entry.state].fuelPurchased += entry.fuel;
      });
    });

    const mpg = fleetSummary.averageMpg || 1;

    return Object.entries(data).map(([state, stats]) => {
      const taxRate = STATE_TAX_RATES[state] || STATE_TAX_RATES['DEFAULT'];
      const fuelConsumed = stats.miles / mpg; // FJ = MJ / MPG (Standard IFTA Requirement)
      const taxDue = fuelConsumed * taxRate; // TD = FJ * JT
      const taxPaidAtPump = stats.fuelPurchased * taxRate; // PP = FPJ * JT (Credit for State of Purchase)
      const netTax = taxDue - taxPaidAtPump; // Net = TD - PP

      return {
        state,
        miles: stats.miles,
        fuelPurchased: stats.fuelPurchased,
        fuelConsumed,
        taxRate,
        taxDue,
        taxPaidAtPump,
        netTax
      };
    }).sort((a, b) => b.miles - a.miles);
  }, [trips, fleetSummary.averageMpg]);

  const handleSaveTrip = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
    setView(ViewMode.DASHBOARD);
  };

  const handleImportReports = (mileageData: any[], fuelData: any[], truckNumber: string) => {
    const newTrip: Trip = {
      id: `IMP-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      truckId: truckNumber,
      odometerStart: 0,
      odometerEnd: mileageData.reduce((acc, m) => acc + m.miles, 0),
      totalMiles: mileageData.reduce((acc, m) => acc + m.miles, 0),
      totalFuel: fuelData.reduce((acc, f) => acc + f.fuel, 0),
      breakdown: []
    };

    // Correctly mapping both mileage and fuel into a single breakdown per state
    const states = new Set([...mileageData.map(m => m.state), ...fuelData.map(f => f.state)]);
    newTrip.breakdown = Array.from(states).map(state => {
      return {
        state,
        miles: mileageData.find(m => m.state === state)?.miles || 0,
        fuel: fuelData.find(f => f.state === state)?.fuel || 0
      };
    });

    setTrips([newTrip, ...trips]);
    setAiInsights(null);
    setView(ViewMode.DASHBOARD);
  };

  const requestInsights = async () => {
    if (trips.length === 0) return;
    setLoadingInsights(true);
    try {
      const insights = await getComplianceInsights(trips);
      setAiInsights(insights);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-10 py-3 sticky top-0 z-50 no-print">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-primary dark:text-slate-100 cursor-pointer" onClick={() => setView(ViewMode.DASHBOARD)}>
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">IFTA Pro</h2>
          </div>
          <div className="flex items-center gap-6">
            <button 
              className={`${view === ViewMode.DASHBOARD ? 'text-primary dark:text-white border-b-2 border-primary' : 'text-slate-600 dark:text-slate-400'} text-sm font-semibold h-10 flex items-center px-1 transition-all`}
              onClick={() => setView(ViewMode.DASHBOARD)}>
              Dashboard
            </button>
            <button 
              className={`${view === ViewMode.IMPORT_REPORTS ? 'text-primary dark:text-white border-b-2 border-primary' : 'text-slate-600 dark:text-slate-400'} text-sm font-semibold h-10 flex items-center px-1 transition-all`}
              onClick={() => setView(ViewMode.IMPORT_REPORTS)}>
              Import Reports
            </button>
            <button 
              className={`${view === ViewMode.ADD_TRIP ? 'text-primary dark:text-white border-b-2 border-primary' : 'text-slate-600 dark:text-slate-400'} text-sm font-semibold h-10 flex items-center px-1 transition-all`}
              onClick={() => setView(ViewMode.ADD_TRIP)}>
              Add Manual Trip
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Action buttons removed from the right as per user request */}
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-10 py-8">
        {view === ViewMode.ADD_TRIP ? (
          <AddTripForm onSave={handleSaveTrip} onCancel={() => setView(ViewMode.DASHBOARD)} />
        ) : view === ViewMode.IMPORT_REPORTS ? (
          <ReportImporter onImportComplete={handleImportReports} onCancel={() => setView(ViewMode.DASHBOARD)} />
        ) : (
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">IFTA Filing Summary</h1>
                <p className="text-slate-500 dark:text-slate-400">Calculations follow standard IFTA Chain: TM &rarr; FC &rarr; Fleet MPG &rarr; MJ/MPG (FJ) &rarr; (FJ*JT) - (FPJ*JT).</p>
              </div>
              <div className="flex items-center gap-3 no-print">
                <button 
                  onClick={handleExportPdf}
                  disabled={trips.length === 0}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print Report
                </button>
                <button 
                  onClick={requestInsights}
                  disabled={loadingInsights || trips.length === 0}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 transition-all disabled:opacity-50">
                  <span className={`material-symbols-outlined text-sm ${loadingInsights ? 'animate-spin' : ''}`}>
                    {loadingInsights ? 'sync' : 'analytics'}
                  </span>
                  AI Audit
                </button>
              </div>
            </div>

            {aiInsights && (
              <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl no-print">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                      </div>
                      <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">Compliance Scan Results</h3>
                    </div>
                    <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium italic">"{aiInsights.summary}"</p>
                  </div>
                  <div className="w-full md:w-80">
                    <span className={`mb-4 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        aiInsights.riskLevel === 'Low' ? 'bg-green-100 text-green-700 border-green-200' : 
                        aiInsights.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        Risk Level: {aiInsights.riskLevel}
                    </span>
                    <div className="space-y-3">
                      {aiInsights.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-indigo-100/50">
                          <span className="text-indigo-500 font-bold">#</span>
                          <p className="text-slate-700 dark:text-slate-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard label="Total Miles (TM)" value={fleetSummary.totalDistance.toLocaleString(undefined, { minimumFractionDigits: 2 })} unit="mi" icon="route" />
              <KpiCard label="Total Fuel (FC)" value={fleetSummary.totalFuel.toLocaleString(undefined, { minimumFractionDigits: 2 })} unit="gal" icon="gas_meter" />
              <KpiCard label="Fleet MPG" value={fleetSummary.averageMpg.toFixed(4)} icon="speed" />
              <KpiCard 
                label="Total IFTA Tax" 
                value={fleetSummary.estimatedTax < 0 ? `($${Math.abs(fleetSummary.estimatedTax).toFixed(2)})` : `$${fleetSummary.estimatedTax.toFixed(2)}`} 
                icon="account_balance" 
                highlight 
              />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mb-8">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Calculation Worksheet</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Consolidated Jurisdiction Reconciliation</p>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">Reporting Period MPG: {fleetSummary.averageMpg}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] uppercase font-black tracking-tighter">
                    <tr>
                      <th className="px-6 py-4">State</th>
                      <th className="px-6 py-4 text-right">Miles (MJ)</th>
                      <th className="px-6 py-4 text-right">Fuel Purch (FPJ)</th>
                      <th className="px-6 py-4 text-right">Fuel Cons (FJ)</th>
                      <th className="px-6 py-4 text-right">Tax Rate (JT)</th>
                      <th className="px-6 py-4 text-right">Tax Due (TD)</th>
                      <th className="px-6 py-4 text-right">Paid @ Pump (PP)</th>
                      <th className="px-6 py-4 text-right">Net Tax Owed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {taxLiabilityData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500 italic">Please import mileage and fuel reports to perform calculation.</td>
                      </tr>
                    ) : (
                      taxLiabilityData.map((row) => (
                        <tr key={row.state} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-black text-slate-900 dark:text-white">{row.state}</td>
                          <td className="px-6 py-4 text-right text-xs font-medium">{row.miles.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-right text-xs font-medium">{row.fuelPurchased.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-indigo-600">{row.fuelConsumed.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-[10px] font-bold text-slate-400">${row.taxRate.toFixed(4)}</td>
                          <td className="px-6 py-4 text-right text-xs font-medium">${row.taxDue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">${row.taxPaidAtPump.toFixed(2)}</td>
                          <td className={`px-6 py-4 text-right font-black ${row.netTax > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {row.netTax < 0 ? `($${Math.abs(row.netTax).toFixed(2)})` : `$${row.netTax.toFixed(2)}`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Settlement Amount</span>
                  <span className="text-[9px] uppercase tracking-tighter text-slate-600">Sum of net liability/credits across all jurisdictions</span>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black ${fleetSummary.estimatedTax > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {fleetSummary.estimatedTax < 0 ? `($${Math.abs(fleetSummary.estimatedTax).toFixed(2)})` : `$${fleetSummary.estimatedTax.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ActivityMap data={taxLiabilityData} />
      <JurisdictionDetailTable data={taxLiabilityData} summary={fleetSummary} />
    </div>
  );
};

export default App;
