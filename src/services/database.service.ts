import { supabase, subscribeToTable, RealtimeSubscription } from '../lib/supabase';
import { MasterBooking, Worker, ConsoleProfile, RouteManagerProfile, Cart } from '../types';
import {
  dbBookingToMasterBooking,
  masterBookingToDbBooking,
  dbWorkerToWorker,
  workerToDbWorker,
  DBMasterBooking,
  DBWorker,
} from '../lib/supabaseHelpers';

export class BookingService {
  static async getAll(seasonId?: string): Promise<MasterBooking[]> {
    let query = supabase.from('master_bookings').select('*').order('created_at', { ascending: false });

    if (seasonId) {
      query = query.eq('season_id', seasonId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(dbBookingToMasterBooking);
  }

  static async getAllBySeasonIds(seasonIds: string[]): Promise<MasterBooking[]> {
    if (seasonIds.length === 0) return [];

    const { data, error } = await supabase
      .from('master_bookings')
      .select('*')
      .in('season_id', seasonIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbBookingToMasterBooking);
  }

  static async getByContractor(contractorNumber: string, seasonId?: string): Promise<MasterBooking[]> {
    let query = supabase
      .from('master_bookings')
      .select('*')
      .eq('contractor_number', contractorNumber);

    if (seasonId) {
      query = query.eq('season_id', seasonId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(dbBookingToMasterBooking);
  }

  static async getByRoute(routeNumber: string, seasonId?: string): Promise<MasterBooking[]> {
    let query = supabase
      .from('master_bookings')
      .select('*')
      .eq('route_number', routeNumber);

    if (seasonId) {
      query = query.eq('season_id', seasonId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(dbBookingToMasterBooking);
  }

  static async getByMap(masterMap: string, seasonId?: string): Promise<MasterBooking[]> {
    let query = supabase
      .from('master_bookings')
      .select('*')
      .eq('master_map', masterMap);

    if (seasonId) {
      query = query.eq('season_id', seasonId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(dbBookingToMasterBooking);
  }

  static async getByMaps(masterMaps: string[], seasonId?: string): Promise<MasterBooking[]> {
    if (masterMaps.length === 0) return [];

    let query = supabase
      .from('master_bookings')
      .select('*')
      .in('master_map', masterMaps);

    if (seasonId) {
      query = query.eq('season_id', seasonId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(dbBookingToMasterBooking);
  }

  static async getById(bookingId: string): Promise<MasterBooking | null> {
    const { data, error } = await supabase
      .from('master_bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error) throw error;
    return data ? dbBookingToMasterBooking(data) : null;
  }

  static async create(booking: Partial<MasterBooking>): Promise<MasterBooking> {
    const dbBooking = masterBookingToDbBooking(booking);

    const { data, error } = await supabase
      .from('master_bookings')
      .insert(dbBooking)
      .select()
      .single();

    if (error) throw error;
    return dbBookingToMasterBooking(data);
  }

  static async update(bookingId: string, updates: Partial<MasterBooking>): Promise<MasterBooking> {
    const dbUpdates = masterBookingToDbBooking(updates);
    delete dbUpdates.booking_id;

    const { data, error } = await supabase
      .from('master_bookings')
      .update(dbUpdates)
      .eq('booking_id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return dbBookingToMasterBooking(data);
  }

  static async delete(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('master_bookings')
      .delete()
      .eq('booking_id', bookingId);

    if (error) throw error;
  }

  static async bulkInsert(bookings: Partial<MasterBooking>[]): Promise<MasterBooking[]> {
    if (bookings.length === 0) return [];

    const dbBookings = bookings.map(masterBookingToDbBooking);

    const batchSize = 100;
    const results: MasterBooking[] = [];

    for (let i = 0; i < dbBookings.length; i += batchSize) {
      const batch = dbBookings.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('master_bookings')
        .insert(batch)
        .select();

      if (error) throw error;
      results.push(...(data || []).map(dbBookingToMasterBooking));
    }

    return results;
  }

  static async bulkUpsert(bookings: Partial<MasterBooking>[]): Promise<MasterBooking[]> {
    if (bookings.length === 0) return [];

    const dbBookings = bookings.map(masterBookingToDbBooking);

    const { data, error } = await supabase
      .from('master_bookings')
      .upsert(dbBookings)
      .select();

    if (error) throw error;
    return (data || []).map(dbBookingToMasterBooking);
  }

  static async deleteBySeasonId(seasonId: string): Promise<void> {
    const { error } = await supabase
      .from('master_bookings')
      .delete()
      .eq('season_id', seasonId);

    if (error) throw error;
  }

  static subscribe(callback: (booking: MasterBooking, eventType: string) => void, seasonId?: string): RealtimeSubscription {
    const filter = seasonId ? `season_id=eq.${seasonId}` : undefined;
    return subscribeToTable<DBMasterBooking>(
      'master_bookings',
      (payload) => {
        const booking = payload.new ? dbBookingToMasterBooking(payload.new) : null;
        if (booking) {
          callback(booking, payload.eventType);
        }
      },
      filter
    );
  }
}

export class WorkerService {
  static async getAll(): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*');

    if (error) throw error;
    return (data || []).map(dbWorkerToWorker);
  }

  static async getById(contractorId: string): Promise<Worker | null> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('contractor_id', contractorId)
      .maybeSingle();

    if (error) throw error;
    return data ? dbWorkerToWorker(data) : null;
  }

  static async getByBookingStatus(status: string): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('booking_status', status);

    if (error) throw error;
    return (data || []).map(dbWorkerToWorker);
  }

  static async getByCartId(cartId: number): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('cart_id', cartId);

    if (error) throw error;
    return (data || []).map(dbWorkerToWorker);
  }

  static async create(worker: Worker): Promise<Worker> {
    const dbWorker = workerToDbWorker(worker);

    const { data, error } = await supabase
      .from('workers')
      .insert(dbWorker)
      .select()
      .single();

    if (error) throw error;
    return dbWorkerToWorker(data);
  }

  static async update(contractorId: string, updates: Partial<Worker>): Promise<Worker> {
    const dbUpdates = workerToDbWorker(updates);
    delete dbUpdates.contractor_id;

    const { data, error } = await supabase
      .from('workers')
      .update(dbUpdates)
      .eq('contractor_id', contractorId)
      .select()
      .single();

    if (error) throw error;
    return dbWorkerToWorker(data);
  }

  static async delete(contractorId: string): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('contractor_id', contractorId);

    if (error) throw error;
  }

  static async bulkInsert(workers: Worker[]): Promise<Worker[]> {
    const dbWorkers = workers.map(workerToDbWorker);

    const { data, error } = await supabase
      .from('workers')
      .insert(dbWorkers)
      .select();

    if (error) throw error;
    return (data || []).map(dbWorkerToWorker);
  }

  static subscribe(callback: (worker: Worker, eventType: string) => void): RealtimeSubscription {
    return subscribeToTable<DBWorker>(
      'workers',
      (payload) => {
        const worker = payload.new ? dbWorkerToWorker(payload.new) : null;
        if (worker) {
          callback(worker, payload.eventType);
        }
      }
    );
  }
}

export class ConsoleProfileService {
  static async getAll(): Promise<ConsoleProfile[]> {
    const { data, error } = await supabase
      .from('console_profiles')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: number): Promise<ConsoleProfile | null> {
    const { data, error } = await supabase
      .from('console_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getByUsername(username: string): Promise<ConsoleProfile | null> {
    const { data, error } = await supabase
      .from('console_profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getByTitle(title: string): Promise<ConsoleProfile | null> {
    const { data, error } = await supabase
      .from('console_profiles')
      .select('*')
      .eq('title', title)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(profile: Omit<ConsoleProfile, 'id'>): Promise<ConsoleProfile> {
    const { data, error } = await supabase
      .from('console_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: number, updates: Partial<ConsoleProfile>): Promise<ConsoleProfile> {
    const { data, error } = await supabase
      .from('console_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('console_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static subscribe(callback: (profile: ConsoleProfile, eventType: string) => void): RealtimeSubscription {
    return subscribeToTable<ConsoleProfile>(
      'console_profiles',
      (payload) => {
        if (payload.new) {
          callback(payload.new, payload.eventType);
        }
      }
    );
  }
}

export class RouteManagerService {
  static async getAll(): Promise<RouteManagerProfile[]> {
    const { data, error } = await supabase
      .from('route_manager_profiles')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: number): Promise<RouteManagerProfile | null> {
    const { data, error } = await supabase
      .from('route_manager_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getByUsername(username: string): Promise<RouteManagerProfile | null> {
    const { data, error } = await supabase
      .from('route_manager_profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getByConsoleProfileId(consoleProfileId: number): Promise<RouteManagerProfile[]> {
    const { data, error } = await supabase
      .from('route_manager_profiles')
      .select('*')
      .eq('console_profile_id', consoleProfileId);

    if (error) throw error;
    return data || [];
  }

  static async create(profile: Omit<RouteManagerProfile, 'id'>): Promise<RouteManagerProfile> {
    const { data, error } = await supabase
      .from('route_manager_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: number, updates: Partial<RouteManagerProfile>): Promise<RouteManagerProfile> {
    const { data, error } = await supabase
      .from('route_manager_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('route_manager_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class CartService {
  static async getAll(): Promise<Cart[]> {
    const { data, error } = await supabase
      .from('carts')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: number): Promise<Cart | null> {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(cart: Omit<Cart, 'id'>): Promise<Cart> {
    const { data, error } = await supabase
      .from('carts')
      .insert(cart)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: number, updates: Partial<Cart>): Promise<Cart> {
    const { data, error } = await supabase
      .from('carts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class RouteAssignmentService {
  static async getByDate(date: string): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('route_assignments')
      .select('*')
      .eq('assignment_date', date);

    if (error) throw error;

    const assignments: Record<string, string> = {};
    (data || []).forEach((row: any) => {
      assignments[row.route_code] = row.worker_id;
    });

    return assignments;
  }

  static async setAssignment(routeCode: string, workerId: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('route_assignments')
      .upsert({
        route_code: routeCode,
        assignment_date: date,
        worker_id: workerId,
      });

    if (error) throw error;
  }

  static async deleteAssignment(routeCode: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('route_assignments')
      .delete()
      .eq('route_code', routeCode)
      .eq('assignment_date', date);

    if (error) throw error;
  }

  static async bulkSet(assignments: Record<string, string>, date: string): Promise<void> {
    const rows = Object.entries(assignments).map(([routeCode, workerId]) => ({
      route_code: routeCode,
      assignment_date: date,
      worker_id: workerId,
    }));

    if (rows.length === 0) return;

    await supabase.from('route_assignments').delete().eq('assignment_date', date);

    const { error } = await supabase
      .from('route_assignments')
      .insert(rows);

    if (error) throw error;
  }
}

export class TerritoryAssignmentService {
  static async getAll(): Promise<Record<string, number[]>> {
    const { data, error } = await supabase
      .from('territory_assignments')
      .select('*');

    if (error) throw error;

    const assignments: Record<string, number[]> = {};
    (data || []).forEach((row: any) => {
      assignments[row.map_name] = row.assigned_profile_ids || [];
    });

    return assignments;
  }

  static async setAssignment(mapName: string, profileIds: number[]): Promise<void> {
    const { error } = await supabase
      .from('territory_assignments')
      .upsert({
        map_name: mapName,
        assigned_profile_ids: profileIds,
      });

    if (error) throw error;
  }

  static async deleteAssignment(mapName: string): Promise<void> {
    const { error } = await supabase
      .from('territory_assignments')
      .delete()
      .eq('map_name', mapName);

    if (error) throw error;
  }

  static async bulkSet(assignments: Record<string, number[]>): Promise<void> {
    await supabase.from('territory_assignments').delete().neq('map_name', '');

    const rows = Object.entries(assignments).map(([mapName, profileIds]) => ({
      map_name: mapName,
      assigned_profile_ids: profileIds,
    }));

    if (rows.length === 0) return;

    const { error } = await supabase
      .from('territory_assignments')
      .insert(rows);

    if (error) throw error;
  }
}

export class TerritoryStructureService {
  static async get(region: 'East' | 'West' | 'Central'): Promise<any> {
    const { data, error } = await supabase
      .from('territory_structure')
      .select('*')
      .eq('region', region)
      .maybeSingle();

    if (error) throw error;
    return data?.structure_data || {};
  }

  static async set(region: 'East' | 'West' | 'Central', structureData: any): Promise<void> {
    const { error } = await supabase
      .from('territory_structure')
      .upsert({
        region,
        structure_data: structureData,
      }, {
        onConflict: 'region',
      });

    if (error) throw error;
  }
}

export class ActiveSeasonService {
  static async get(consoleProfileId: number): Promise<{ activeSeasonId: string } | null> {
    const { data, error } = await supabase
      .from('active_season_settings')
      .select('active_season_id')
      .eq('console_profile_id', consoleProfileId)
      .maybeSingle();

    if (error) throw error;
    return data ? { activeSeasonId: data.active_season_id } : null;
  }

  static async set(consoleProfileId: number, seasonId: string): Promise<void> {
    const { error } = await supabase
      .from('active_season_settings')
      .upsert({
        console_profile_id: consoleProfileId,
        active_season_id: seasonId,
      });

    if (error) throw error;
  }
}

export class AttendanceService {
  static async isFinalized(consoleProfileId: number, date: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('attendance_tracking')
      .select('is_finalized')
      .eq('console_profile_id', consoleProfileId)
      .eq('attendance_date', date)
      .maybeSingle();

    if (error) throw error;
    return data?.is_finalized || false;
  }

  static async setFinalized(consoleProfileId: number, date: string, finalized: boolean): Promise<void> {
    const { error } = await supabase
      .from('attendance_tracking')
      .upsert({
        console_profile_id: consoleProfileId,
        attendance_date: date,
        is_finalized: finalized,
        finalized_at: finalized ? new Date().toISOString() : null,
      });

    if (error) throw error;
  }
}

export class AppStateService {
  static async get(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('app_state')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data?.value || null;
  }

  static async set(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('app_state')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  static async getLastRouteCode(workerId: string): Promise<string | null> {
    return await this.get(`last_route_code_${workerId}`);
  }

  static async setLastRouteCode(workerId: string, routeCode: string): Promise<void> {
    await this.set(`last_route_code_${workerId}`, routeCode);
  }
}

export class WorkerSessionService {
  static async create(workerId: string, sessionType: 'contractor' | 'cart_worker', cartId?: number, sessionData?: any): Promise<string> {
    const { data, error } = await supabase
      .from('worker_sessions')
      .insert({
        worker_id: workerId,
        cart_id: cartId,
        session_type: sessionType,
        session_data: sessionData || {},
      })
      .select('session_id')
      .single();

    if (error) throw error;
    return data.session_id;
  }

  static async get(sessionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('worker_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getByWorkerId(workerId: string): Promise<any> {
    const { data, error } = await supabase
      .from('worker_sessions')
      .select('*')
      .eq('worker_id', workerId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async delete(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('worker_sessions')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
  }

  static async cleanup(): Promise<void> {
    const { error } = await supabase
      .from('worker_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  }
}

export class ServiceCatalogService {
  static async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('services_catalog')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('services_catalog')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(service: any): Promise<any> {
    const { data, error } = await supabase
      .from('services_catalog')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('services_catalog')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('services_catalog')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class UpsellMenuService {
  static async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('upsell_menus')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('upsell_menus')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(menu: any): Promise<any> {
    const { data, error } = await supabase
      .from('upsell_menus')
      .insert(menu)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('upsell_menus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('upsell_menus')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class PayoutLogicService {
  static async get(consoleProfileId: number, seasonId: string): Promise<any> {
    const { data, error } = await supabase
      .from('payout_logic_settings')
      .select('settings')
      .eq('console_profile_id', consoleProfileId)
      .eq('season_id', seasonId)
      .maybeSingle();

    if (error) throw error;
    return data?.settings || null;
  }

  static async set(consoleProfileId: number, seasonId: string, settings: any): Promise<void> {
    const { error } = await supabase
      .from('payout_logic_settings')
      .upsert({
        console_profile_id: consoleProfileId,
        season_id: seasonId,
        settings,
      });

    if (error) throw error;
  }

  static async delete(consoleProfileId: number, seasonId: string): Promise<void> {
    const { error } = await supabase
      .from('payout_logic_settings')
      .delete()
      .eq('console_profile_id', consoleProfileId)
      .eq('season_id', seasonId);

    if (error) throw error;
  }
}
