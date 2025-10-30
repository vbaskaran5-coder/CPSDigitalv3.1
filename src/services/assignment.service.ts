import { supabase } from '../lib/supabase';

export interface RouteAssignmentRecord {
  route_code: string;
  assignment_date: string;
  worker_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MapAssignmentRecord {
  assignment_key: string;
  assignment_date: string;
  route_manager: { name: string; initials: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface DailyArchive {
  id?: string;
  archive_date: string;
  archive_type: 'route_assignments' | 'map_assignments' | 'attendance';
  data: Record<string, any>;
  created_at?: string;
}

export class RouteAssignmentService {
  static async getByDate(date: string): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('route_assignments')
      .select('route_code, worker_id')
      .eq('assignment_date', date);

    if (error) {
      console.error('Error fetching route assignments:', error);
      return {};
    }

    const assignments: Record<string, string> = {};
    data?.forEach((row) => {
      assignments[row.route_code] = row.worker_id;
    });

    return assignments;
  }

  static async setAssignment(
    routeCode: string,
    workerId: string,
    date: string
  ): Promise<void> {
    const { error } = await supabase
      .from('route_assignments')
      .upsert(
        {
          route_code: routeCode,
          assignment_date: date,
          worker_id: workerId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'route_code,assignment_date' }
      );

    if (error) {
      console.error('Error setting route assignment:', error);
      throw error;
    }
  }

  static async removeAssignment(routeCode: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('route_assignments')
      .delete()
      .eq('route_code', routeCode)
      .eq('assignment_date', date);

    if (error) {
      console.error('Error removing route assignment:', error);
      throw error;
    }
  }

  static async setMultipleAssignments(
    assignments: Record<string, string>,
    date: string
  ): Promise<void> {
    const records = Object.entries(assignments).map(([routeCode, workerId]) => ({
      route_code: routeCode,
      assignment_date: date,
      worker_id: workerId,
      updated_at: new Date().toISOString(),
    }));

    if (records.length === 0) return;

    const { error } = await supabase
      .from('route_assignments')
      .upsert(records, { onConflict: 'route_code,assignment_date' });

    if (error) {
      console.error('Error setting multiple route assignments:', error);
      throw error;
    }
  }

  static async clearAssignmentsForDate(date: string): Promise<void> {
    const { error } = await supabase
      .from('route_assignments')
      .delete()
      .eq('assignment_date', date);

    if (error) {
      console.error('Error clearing route assignments:', error);
      throw error;
    }
  }
}

export class MapAssignmentService {
  static async getByDate(
    date: string
  ): Promise<Record<string, { name: string; initials: string } | null>> {
    const { data, error } = await supabase
      .from('map_assignments')
      .select('assignment_key, route_manager')
      .eq('assignment_date', date);

    if (error) {
      console.error('Error fetching map assignments:', error);
      return {};
    }

    const assignments: Record<string, { name: string; initials: string } | null> = {};
    data?.forEach((row) => {
      assignments[row.assignment_key] = row.route_manager;
    });

    return assignments;
  }

  static async setAssignment(
    assignmentKey: string,
    routeManager: { name: string; initials: string } | null,
    date: string
  ): Promise<void> {
    const { error } = await supabase
      .from('map_assignments')
      .upsert(
        {
          assignment_key: assignmentKey,
          assignment_date: date,
          route_manager: routeManager,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'assignment_key,assignment_date' }
      );

    if (error) {
      console.error('Error setting map assignment:', error);
      throw error;
    }
  }

  static async removeAssignment(assignmentKey: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('map_assignments')
      .delete()
      .eq('assignment_key', assignmentKey)
      .eq('assignment_date', date);

    if (error) {
      console.error('Error removing map assignment:', error);
      throw error;
    }
  }

  static async setMultipleAssignments(
    assignments: Record<string, { name: string; initials: string } | null>,
    date: string
  ): Promise<void> {
    const records = Object.entries(assignments).map(([key, manager]) => ({
      assignment_key: key,
      assignment_date: date,
      route_manager: manager,
      updated_at: new Date().toISOString(),
    }));

    if (records.length === 0) return;

    const { error } = await supabase
      .from('map_assignments')
      .upsert(records, { onConflict: 'assignment_key,assignment_date' });

    if (error) {
      console.error('Error setting multiple map assignments:', error);
      throw error;
    }
  }

  static async clearAssignmentsForDate(date: string): Promise<void> {
    const { error } = await supabase
      .from('map_assignments')
      .delete()
      .eq('assignment_date', date);

    if (error) {
      console.error('Error clearing map assignments:', error);
      throw error;
    }
  }
}

export class DailyArchiveService {
  static async createArchive(archive: DailyArchive): Promise<void> {
    const { error } = await supabase.from('daily_archives').upsert(
      {
        archive_date: archive.archive_date,
        archive_type: archive.archive_type,
        data: archive.data,
      },
      { onConflict: 'archive_date,archive_type' }
    );

    if (error) {
      console.error('Error creating archive:', error);
      throw error;
    }
  }

  static async getArchive(
    date: string,
    type: 'route_assignments' | 'map_assignments' | 'attendance'
  ): Promise<Record<string, any> | null> {
    const { data, error } = await supabase
      .from('daily_archives')
      .select('data')
      .eq('archive_date', date)
      .eq('archive_type', type)
      .maybeSingle();

    if (error) {
      console.error('Error fetching archive:', error);
      return null;
    }

    return data?.data || null;
  }

  static async getArchivesByDateRange(
    startDate: string,
    endDate: string,
    type?: 'route_assignments' | 'map_assignments' | 'attendance'
  ): Promise<DailyArchive[]> {
    let query = supabase
      .from('daily_archives')
      .select('*')
      .gte('archive_date', startDate)
      .lte('archive_date', endDate)
      .order('archive_date', { ascending: false });

    if (type) {
      query = query.eq('archive_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching archives:', error);
      return [];
    }

    return data || [];
  }
}

export class AttendanceService {
  static async getFinalizationStatus(
    consoleProfileId: number,
    date: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('attendance_tracking')
      .select('is_finalized')
      .eq('console_profile_id', consoleProfileId)
      .eq('attendance_date', date)
      .maybeSingle();

    if (error) {
      console.error('Error fetching attendance finalization status:', error);
      return false;
    }

    return data?.is_finalized || false;
  }

  static async setFinalizationStatus(
    consoleProfileId: number,
    date: string,
    isFinalized: boolean
  ): Promise<void> {
    const { error } = await supabase.from('attendance_tracking').upsert(
      {
        console_profile_id: consoleProfileId,
        attendance_date: date,
        is_finalized: isFinalized,
        finalized_at: isFinalized ? new Date().toISOString() : null,
      },
      { onConflict: 'console_profile_id,attendance_date' }
    );

    if (error) {
      console.error('Error setting attendance finalization status:', error);
      throw error;
    }
  }
}

export class AppStateService {
  static async getValue(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('app_state')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('Error fetching app state:', error);
      return null;
    }

    return data?.value || null;
  }

  static async setValue(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('app_state')
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Error setting app state:', error);
      throw error;
    }
  }

  static async getLastAppDate(): Promise<string | null> {
    return await this.getValue('last_app_date');
  }

  static async setLastAppDate(date: string): Promise<void> {
    await this.setValue('last_app_date', date);
  }
}
