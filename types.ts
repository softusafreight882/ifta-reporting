
export interface JurisdictionEntry {
  state: string;
  miles: number;
  fuel: number;
}

export interface Trip {
  id: string;
  date: string;
  truckId: string;
  odometerStart: number;
  odometerEnd: number;
  breakdown: JurisdictionEntry[];
  totalMiles: number;
  totalFuel: number;
}

export interface TaxLiabilityRow {
  state: string;
  miles: number;           // MJ
  fuelPurchased: number;   // FPJ
  fuelConsumed: number;    // FJ (MJ / MPG)
  taxRate: number;         // JT
  taxDue: number;          // TD (FJ * JT)
  taxPaidAtPump: number;   // (FPJ * JT)
  netTax: number;          // (TD - PaidAtPump)
}

export interface StateSummary {
  state: string;
  miles: number;
  fuel: number;
  status: 'Paid' | 'Pending' | 'Calculated';
}

export interface FleetSummary {
  totalDistance: number;
  totalFuel: number;
  averageMpg: number;
  estimatedTax: number;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  ADD_TRIP = 'ADD_TRIP',
  IMPORT_REPORTS = 'IMPORT_REPORTS'
}
