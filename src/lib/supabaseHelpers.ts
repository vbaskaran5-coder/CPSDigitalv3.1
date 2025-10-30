import { MasterBooking, Worker, ConsoleProfile, RouteManagerProfile, Cart } from '../types';

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformKeysToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformKeysToCamelCase) as any;
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = transformKeysToCamelCase(obj[key]);
    }
  }
  return result;
}

export function transformKeysToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformKeysToSnakeCase) as any;
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = transformKeysToSnakeCase(obj[key]);
    }
  }
  return result;
}

export interface DBMasterBooking {
  booking_id: string;
  route_number?: string | null;
  contractor_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_address?: string | null;
  home_phone?: string | null;
  cell_phone?: string | null;
  email_address?: string | null;
  price?: string | null;
  property_type?: string | null;
  log_sheet_notes?: string | null;
  services?: any;
  completed?: string | null;
  date_completed?: string | null;
  status?: string | null;
  prepaid?: string | null;
  payment_method?: string | null;
  is_paid?: boolean | null;
  is_prebooked?: boolean | null;
  is_contract?: boolean | null;
  contract_title?: string | null;
  upsell_menu_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  booked_by?: string | null;
  date_time_booked?: string | null;
  master_map?: string | null;
  group?: string | null;
  sprinkler?: string | null;
  gate?: string | null;
  must_be_home?: string | null;
  call_first?: string | null;
  second_run?: string | null;
  city?: string | null;
  phone_type?: string | null;
  season_id?: string | null;
}

export function dbBookingToMasterBooking(dbBooking: DBMasterBooking): MasterBooking {
  return {
    'Booking ID': dbBooking.booking_id,
    'Route Number': dbBooking.route_number || undefined,
    'Contractor Number': dbBooking.contractor_number || undefined,
    'First Name': dbBooking.first_name || undefined,
    'Last Name': dbBooking.last_name || undefined,
    'Full Address': dbBooking.full_address || undefined,
    'Home Phone': dbBooking.home_phone || undefined,
    'Cell Phone': dbBooking.cell_phone || undefined,
    'Email Address': dbBooking.email_address || undefined,
    Price: dbBooking.price || undefined,
    'FO/BO/FP': dbBooking.property_type || undefined,
    'Log Sheet Notes': dbBooking.log_sheet_notes || undefined,
    services: dbBooking.services || undefined,
    Completed: dbBooking.completed || undefined,
    'Date Completed': dbBooking.date_completed || undefined,
    Status: dbBooking.status || undefined,
    Prepaid: dbBooking.prepaid || undefined,
    'Payment Method': dbBooking.payment_method || undefined,
    'Is Paid': dbBooking.is_paid || undefined,
    isPrebooked: dbBooking.is_prebooked || undefined,
    isContract: dbBooking.is_contract || undefined,
    contractTitle: dbBooking.contract_title || undefined,
    upsellMenuId: dbBooking.upsell_menu_id || undefined,
    created_at: dbBooking.created_at || undefined,
    updated_at: dbBooking.updated_at || undefined,
    'Booked By': dbBooking.booked_by || undefined,
    'Date/Time Booked': dbBooking.date_time_booked || undefined,
    'Master Map': dbBooking.master_map || undefined,
    Group: dbBooking.group || undefined,
    Sprinkler: dbBooking.sprinkler || undefined,
    Gate: dbBooking.gate || undefined,
    'Must be home': dbBooking.must_be_home || undefined,
    'Call First': dbBooking.call_first || undefined,
    'Second Run': dbBooking.second_run || undefined,
  };
}

export function masterBookingToDbBooking(booking: Partial<MasterBooking>): Partial<DBMasterBooking> {
  return {
    booking_id: booking['Booking ID'],
    route_number: booking['Route Number'],
    contractor_number: booking['Contractor Number'],
    first_name: booking['First Name'],
    last_name: booking['Last Name'],
    full_address: booking['Full Address'],
    home_phone: booking['Home Phone'],
    cell_phone: booking['Cell Phone'],
    email_address: booking['Email Address'],
    price: booking.Price,
    property_type: booking['FO/BO/FP'],
    log_sheet_notes: booking['Log Sheet Notes'],
    services: booking.services,
    completed: booking.Completed,
    date_completed: booking['Date Completed'],
    status: booking.Status,
    prepaid: booking.Prepaid,
    payment_method: booking['Payment Method'],
    is_paid: booking['Is Paid'],
    is_prebooked: booking.isPrebooked,
    is_contract: booking.isContract,
    contract_title: booking.contractTitle,
    upsell_menu_id: booking.upsellMenuId,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    booked_by: booking['Booked By'],
    date_time_booked: booking['Date/Time Booked'],
    master_map: booking['Master Map'],
    group: booking.Group,
    sprinkler: booking.Sprinkler,
    gate: booking.Gate,
    must_be_home: booking['Must be home'],
    call_first: booking['Call First'],
    second_run: booking['Second Run'],
    city: booking['City'],
    phone_type: booking['Phone Type'],
  };
}

export interface DBWorker {
  contractor_id: string;
  first_name: string;
  last_name: string;
  cell_phone?: string | null;
  home_phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  status?: string | null;
  days_worked_previous_years?: string | null;
  aeration_silvers_previous_years?: string | null;
  rejuv_silvers_previous_years?: string | null;
  sealing_silvers_previous_years?: string | null;
  cleaning_silvers_previous_years?: string | null;
  days_worked?: number | null;
  no_shows?: number | null;
  showed?: boolean | null;
  showed_date?: string | null;
  booking_status?: string | null;
  booked_date?: string | null;
  sub_status?: string | null;
  route_manager?: any;
  cart_id?: number | null;
  shuttle_line?: string | null;
  payout_completed?: boolean | null;
  commission?: number | null;
  gross_sales?: number | null;
  equivalent?: number | null;
  deductions?: any;
  bonuses?: any;
  payout_history?: any;
  created_at?: string | null;
  updated_at?: string | null;
}

export function dbWorkerToWorker(dbWorker: DBWorker): Worker {
  return {
    contractorId: dbWorker.contractor_id,
    firstName: dbWorker.first_name,
    lastName: dbWorker.last_name,
    cellPhone: dbWorker.cell_phone || undefined,
    homePhone: dbWorker.home_phone || undefined,
    email: dbWorker.email || undefined,
    address: dbWorker.address || undefined,
    city: dbWorker.city || undefined,
    status: dbWorker.status || 'Rookie',
    daysWorkedPreviousYears: dbWorker.days_worked_previous_years || undefined,
    aerationSilversPreviousYears: dbWorker.aeration_silvers_previous_years || undefined,
    rejuvSilversPreviousYears: dbWorker.rejuv_silvers_previous_years || undefined,
    sealingSilversPreviousYears: dbWorker.sealing_silvers_previous_years || undefined,
    cleaningSilversPreviousYears: dbWorker.cleaning_silvers_previous_years || undefined,
    daysWorked: dbWorker.days_worked || undefined,
    noShows: dbWorker.no_shows || undefined,
    showed: dbWorker.showed || undefined,
    showedDate: dbWorker.showed_date || undefined,
    bookingStatus: dbWorker.booking_status || undefined,
    bookedDate: dbWorker.booked_date || undefined,
    subStatus: dbWorker.sub_status || undefined,
    routeManager: dbWorker.route_manager || undefined,
    cartId: dbWorker.cart_id || undefined,
    shuttleLine: dbWorker.shuttle_line || undefined,
    payoutCompleted: dbWorker.payout_completed || undefined,
    commission: dbWorker.commission ? Number(dbWorker.commission) : undefined,
    grossSales: dbWorker.gross_sales ? Number(dbWorker.gross_sales) : undefined,
    equivalent: dbWorker.equivalent ? Number(dbWorker.equivalent) : undefined,
    deductions: dbWorker.deductions || undefined,
    bonuses: dbWorker.bonuses || undefined,
    payoutHistory: dbWorker.payout_history || undefined,
  };
}

export function workerToDbWorker(worker: Partial<Worker>): Partial<DBWorker> {
  return {
    contractor_id: worker.contractorId,
    first_name: worker.firstName,
    last_name: worker.lastName,
    cell_phone: worker.cellPhone,
    home_phone: worker.homePhone,
    email: worker.email,
    address: worker.address,
    city: worker.city,
    status: worker.status,
    days_worked_previous_years: worker.daysWorkedPreviousYears,
    aeration_silvers_previous_years: worker.aerationSilversPreviousYears,
    rejuv_silvers_previous_years: worker.rejuvSilversPreviousYears,
    sealing_silvers_previous_years: worker.sealingSilversPreviousYears,
    cleaning_silvers_previous_years: worker.cleaningSilversPreviousYears,
    days_worked: worker.daysWorked,
    no_shows: worker.noShows,
    showed: worker.showed,
    showed_date: worker.showedDate,
    booking_status: worker.bookingStatus,
    booked_date: worker.bookedDate,
    sub_status: worker.subStatus,
    route_manager: worker.routeManager,
    cart_id: worker.cartId,
    shuttle_line: worker.shuttleLine,
    payout_completed: worker.payoutCompleted,
    commission: worker.commission,
    gross_sales: worker.grossSales,
    equivalent: worker.equivalent,
    deductions: worker.deductions,
    bonuses: worker.bonuses,
    payout_history: worker.payoutHistory,
  };
}
