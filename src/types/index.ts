// src/types/index.ts

// Keep BaseService interfaces from hardcodedData.ts if needed elsewhere,
// or redefine necessary parts here. For brevity, assuming they are imported
// or relevant parts are integrated.

// --- Hardcoded Data Reference Types ---
// These refer to the structures in hardcodedData.ts
export interface HardcodedSeasonRef {
  id: string; // e.g., 'west-aeration'
  name: string;
  type: 'Individual' | 'Team' | 'Service';
  hasPayoutLogic: boolean;
  availableUpsellIds: string[];
}

export interface UpsellRef {
  id: string;
  name: string;
}

// --- Console Profile & Season Configuration ---
export interface ConsoleProfile {
  id: number;
  title: string;
  username: string; // Added username
  password?: string; // Added password
  region: 'West' | 'Central' | 'East'; // Added region
  seasons: ConfiguredSeason[]; // Changed from Season[]
}

export interface ConfiguredSeason {
  hardcodedId: string; // Reference to the HardcodedSeason ID (e.g., 'west-aeration')
  enabled: boolean; // Is this season active for this profile?
  enabledUpsellIds: string[]; // Which upsells are turned on for this profile/season?
  payoutLogic?: PayoutLogicSettings; // Specific payout overrides for this profile/season
}

// --- Route Manager ---
export interface RouteManagerProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password?: string;
  consoleProfileId?: number; // Link to the ConsoleProfile this RM belongs to
}

// --- Payout Logic ---
export interface PayoutLogicSettings {
  taxRate: number;
  productCost?: number; // Cost percentage for Team seasons
  baseCommissionRate?: number; // For Individual seasons (e.g., Aeration)
  soloBaseCommissionRate?: number; // For Team seasons when only one worker
  teamBaseCommissionRate?: number; // For Team seasons with multiple workers
  applySilverRaises: boolean;
  applyAlumniRaises: boolean;
  paymentMethodPercentages: {
    [key: string]: {
      // e.g., Cash, Cheque, Prepaid, Billed, IOS, Custom
      percentage: number; // 0-100, how much counts towards Net Sales
      applyTaxes: boolean; // Should tax be removed before applying percentage?
    };
  };
}

// --- Bookings ---
// Represents a single job entry, either pre-booked or same-day sale
export interface MasterBooking {
  [key: string]: any; // Allow flexibility for misc fields from CSV/imports

  // Core Identifiers
  'Booking ID': string; // Unique ID
  'Route Number'?: string; // e.g., ALD01
  'Contractor Number'?: string; // Worker ID who completed/is assigned

  // Customer Info
  'First Name'?: string;
  'Last Name'?: string;
  'Full Address'?: string;
  'Home Phone'?: string;
  'Cell Phone'?: string;
  'Email Address'?: string;

  // Job Details
  Price?: string; // Price charged
  'FO/BO/FP'?: 'FP' | 'FO' | 'BO' | string; // Full Property, Front Only, Back Only
  'Log Sheet Notes'?: string; // Notes for the worker (e.g., SS, Gate, MBH, CF, 2nd RUN) or JSON for contracts
  services?: SoldService[]; // Array of services sold for THIS specific booking

  // Status & Payment
  Completed?: 'x' | '' | undefined | null; // 'x' if done
  'Date Completed'?: string; // ISO timestamp
  // EXPANDED Status possibilities
  Status?:
    | 'cancelled'
    | 'next_time'
    | 'pending'
    | 'contract'
    | 'redo'
    | 'ref/dnb'
    | string; // Added 'redo', 'ref/dnb'
  Prepaid?: 'x' | '' | undefined | null; // 'x' if paid in advance
  'Payment Method'?: string; // How it was paid (Cash, Cheque, ETF, CCD, Billed, IOS, Prepaid, Custom)
  'Is Paid'?: boolean; // Mainly for Billed status tracking

  // Metadata
  isPrebooked?: boolean; // Was this from the master import?
  isContract?: boolean; // Is this an Upsell/Contract?
  contractTitle?: string; // Title of the contract/upsell menu used
  upsellMenuId?: string; // Reference to the hardcoded Upsell ID
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp

  // Original Import Fields (Optional, for reference)
  'Booked By'?: string;
  'Date/Time Booked'?: string;
  'Master Map'?: string;
  Group?: string;
  Sprinkler?: string;
  Gate?: string;
  'Must be home'?: string;
  'Call First'?: string;
  'Second Run'?: string;
}

// Represents a service sold as part of a MasterBooking
export interface SoldService {
  hardcodedId: string; // e.g., 'aeration', 'dethatching'
  name: string; // e.g., 'Aeration'
  optionId?: string; // e.g., 'aeration-fp' (if applicable)
  optionName?: string; // e.g., 'Full Property' (if applicable)
  price: number; // Price for this specific instance
  // Add any specific parameters captured, if needed, though notes might cover it
}

// --- Workers ---
export interface Worker {
  contractorId: string; // Primary ID
  firstName: string;
  lastName: string;
  cellPhone?: string;
  homePhone?: string;
  email?: string;
  address?: string;
  city?: string;
  status: 'Rookie' | 'Alumni' | string; // Status

  // Historical Performance
  daysWorked?: number; // Days worked this season/year
  daysWorkedPreviousYears?: string; // Total days prior
  aerationSilversPreviousYears?: string; // Count
  rejuvSilversPreviousYears?: string; // Count
  sealingSilversPreviousYears?: string; // Count
  cleaningSilversPreviousYears?: string; // Count

  // Daily Status & Booking
  showed?: boolean; // Did they show up today?
  showedDate?: string; // ISO date they showed up
  bookingStatus?:
    | 'today'
    | 'next_day'
    | 'calendar'
    | 'wdr_tnb'
    | 'quit_fired'
    | 'no_show'
    | string;
  bookedDate?: string; // ISO date they are booked for
  subStatus?: 'WDR' | 'TNB' | 'Quit' | 'Fired' | string; // Reason for wdr/quit etc.
  noShows?: number; // Count of no-shows

  // Assignment
  routeManager?: {
    // Assigned RM for the day (Individual seasons)
    name: string;
    initials: string;
  };
  cartId?: number | null; // Assigned Cart ID for the day (Team seasons)
  shuttleLine?: string; // e.g., R1, B2

  // Payout Related (Updated after payout calculation)
  payoutCompleted?: boolean; // Has today's payout been finalized?
  commission?: number; // Today's calculated commission
  grossSales?: number; // Today's gross sales attributed/split
  equivalent?: number; // Today's calculated EQ attributed/split
  deductions?: Deduction[]; // Today's deductions
  bonuses?: Bonus[]; // Today's bonuses
  payoutHistory?: PayoutRecord[]; // Historical payouts
}

// --- Payout Records & Adjustments ---
export interface PayoutRecord {
  date: string; // ISO date string 'yyyy-MM-dd'
  grossSales: number;
  equivalent: number;
  commission: number;
  deductions: Deduction[];
  bonuses: Bonus[];
}

export interface Deduction {
  id: number; // Unique ID for the deduction instance
  name: string; // e.g., 'Gas', 'Damage'
  amount: number; // Positive value
}

export interface Bonus {
  id: number; // Unique ID for the bonus instance
  type: string; // e.g., 'Referral', 'Performance'
  amount: number; // Positive value
}

// --- Carts (for Team Seasons) ---
export interface Cart {
  id: number; // e.g., 1, 2, 3
  // Workers assigned via worker.cartId
  routeManager?: {
    // Optional RM overseeing the cart
    name: string;
    initials: string;
  };
}

// --- App Settings ---
export interface AppSettings {
  syncFrequency: number;
  notificationsEnabled: boolean;
  darkMode: boolean;
  defaultView: 'list' | 'map';
}
