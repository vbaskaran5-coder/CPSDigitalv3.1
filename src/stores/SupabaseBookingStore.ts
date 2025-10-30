import { MasterBooking } from '../types';
import {
  BookingService,
  TerritoryAssignmentService,
  ActiveSeasonService,
  ConsoleProfileService,
  RouteAssignmentService,
} from '../services/database.service';
import { RealtimeSubscription } from '../lib/supabase';

interface BookingUpdates extends Partial<MasterBooking> {
  Completed?: string;
  Status?: string;
  'Payment Method'?: string;
  'Is Paid'?: boolean;
  'Date Completed'?: string;
}

class SupabaseBookingStore {
  private static instance: SupabaseBookingStore;
  private rawActiveBookings: MasterBooking[] = [];
  private filteredActiveBookings: MasterBooking[] = [];
  private activeSeasonId: string | null = null;
  private currentConsoleProfileId: number | null = null;
  private territoryAssignments: Record<string, number[]> = {};
  private realtimeSubscription: RealtimeSubscription | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SupabaseBookingStore {
    if (!SupabaseBookingStore.instance) {
      SupabaseBookingStore.instance = new SupabaseBookingStore();
    }
    return SupabaseBookingStore.instance;
  }

  public async initialize(consoleProfileId: number): Promise<void> {
    this.currentConsoleProfileId = consoleProfileId;
    await this.loadTerritoryAssignments();
    await this.loadActiveSeasonAndBookings();
    this.setupRealtimeSubscription();
    this.isInitialized = true;
  }

  private async loadTerritoryAssignments(): Promise<void> {
    try {
      this.territoryAssignments = await TerritoryAssignmentService.getAll();
      console.log('Loaded territory assignments from Supabase:', this.territoryAssignments);
    } catch (error) {
      console.error('Failed to load territory assignments:', error);
      this.territoryAssignments = {};
    }
  }

  private async loadActiveSeasonAndBookings(): Promise<void> {
    if (!this.currentConsoleProfileId) {
      console.warn('No console profile ID set, cannot load bookings');
      return;
    }

    try {
      const seasonData = await ActiveSeasonService.get(this.currentConsoleProfileId);
      this.activeSeasonId = seasonData?.activeSeasonId || null;
      console.log('Active season ID:', this.activeSeasonId);

      if (this.activeSeasonId) {
        await this.syncBookingsFromDatabase();
      } else {
        this.rawActiveBookings = [];
        this.filteredActiveBookings = [];
      }
    } catch (error) {
      console.error('Failed to load active season and bookings:', error);
      this.rawActiveBookings = [];
      this.filteredActiveBookings = [];
    }
  }

  private async syncBookingsFromDatabase(): Promise<void> {
    if (!this.activeSeasonId) return;

    try {
      this.rawActiveBookings = await BookingService.getAll(this.activeSeasonId);
      console.log(`Loaded ${this.rawActiveBookings.length} bookings from Supabase for season ${this.activeSeasonId}`);
      this.filterBookingsByTerritory();
      this.notifyRefresh();
    } catch (error) {
      console.error('Failed to sync bookings from database:', error);
    }
  }

  private setupRealtimeSubscription(): void {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }

    if (!this.activeSeasonId) return;

    this.realtimeSubscription = BookingService.subscribe(
      (booking, eventType) => {
        console.log(`Realtime booking ${eventType}:`, booking['Booking ID']);
        this.syncBookingsFromDatabase();
      },
      this.activeSeasonId
    );
  }

  private filterBookingsByTerritory(): void {
    if (this.currentConsoleProfileId === null) {
      console.log('No console profile ID, showing no bookings');
      this.filteredActiveBookings = [];
      return;
    }

    const assignedMaps = new Set<string>();
    for (const map in this.territoryAssignments) {
      if (this.territoryAssignments[map]?.includes(this.currentConsoleProfileId)) {
        assignedMaps.add(map);
      }
    }

    console.log(`Profile ${this.currentConsoleProfileId} has ${assignedMaps.size} maps assigned`);

    this.filteredActiveBookings = this.rawActiveBookings.filter((booking) => {
      const map = booking['Master Map'];
      return map && assignedMaps.has(map);
    });

    console.log(`Filtered ${this.rawActiveBookings.length} raw bookings down to ${this.filteredActiveBookings.length}`);
  }

  private notifyRefresh(): void {
    window.dispatchEvent(new Event('bookingStoreRefreshed'));
  }

  public async switchSeason(seasonId: string): Promise<void> {
    if (!this.currentConsoleProfileId) {
      throw new Error('Cannot switch season: No console profile set');
    }

    try {
      await ActiveSeasonService.set(this.currentConsoleProfileId, seasonId);
      this.activeSeasonId = seasonId;
      await this.syncBookingsFromDatabase();
      this.setupRealtimeSubscription();
    } catch (error) {
      console.error('Failed to switch season:', error);
      throw error;
    }
  }

  public async refreshTerritoryAssignments(): Promise<void> {
    await this.loadTerritoryAssignments();
    this.filterBookingsByTerritory();
    this.notifyRefresh();
  }

  public getAllBookings(): MasterBooking[] {
    return [...this.filteredActiveBookings];
  }

  public async getBookingsForContractor(contractorNumber: string): Promise<MasterBooking[]> {
    if (!contractorNumber || typeof contractorNumber !== 'string' || contractorNumber.trim() === '') {
      return [];
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const routeAssignments = await RouteAssignmentService.getByDate(today);

      if (!this.isInitialized || this.filteredActiveBookings.length === 0) {
        console.log('Store not initialized for console, fetching bookings directly for contractor');
        const directBookings = await BookingService.getByContractor(contractorNumber);

        const bookingsWithRouteAssignments = directBookings.filter((booking) => {
          if (booking['Contractor Number'] === contractorNumber) return true;

          if (
            booking['Route Number'] &&
            (!booking['Contractor Number'] || booking['Contractor Number'] === '')
          ) {
            return routeAssignments[booking['Route Number']] === contractorNumber;
          }
          return false;
        });

        return bookingsWithRouteAssignments;
      }

      return this.filteredActiveBookings.filter((booking) => {
        if (booking['Contractor Number'] === contractorNumber) return true;

        if (
          booking['Route Number'] &&
          (!booking['Contractor Number'] || booking['Contractor Number'] === '')
        ) {
          return routeAssignments[booking['Route Number']] === contractorNumber;
        }
        return false;
      });
    } catch (error) {
      console.error('Error getting bookings for contractor:', error);
      const directBookings = await BookingService.getByContractor(contractorNumber);
      return directBookings.filter(
        (booking) => booking['Contractor Number'] === contractorNumber
      );
    }
  }

  public getBookingById(bookingId: string): MasterBooking | undefined {
    return this.filteredActiveBookings.find((booking) => booking['Booking ID'] === bookingId);
  }

  public async updateBooking(bookingId: string, updates: Partial<MasterBooking>): Promise<void> {
    try {
      if (updates.Price && typeof updates.Price === 'number') {
        updates.Price = updates.Price.toFixed(2);
      }

      await BookingService.update(bookingId, updates);
      console.log(`Updated booking ${bookingId} in Supabase`);
    } catch (error) {
      console.error(`Failed to update booking ${bookingId}:`, error);
      throw error;
    }
  }

  public async addBooking(bookingData: Partial<MasterBooking>): Promise<void> {
    try {
      let seasonId = this.activeSeasonId;

      if (!seasonId) {
        console.log('No active season set, using default season for booking');
        seasonId = bookingData['season_id'] as string || 'default-season';
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const bookingId = bookingData['Route Number']
        ? `${bookingData['Route Number']}-${seasonId}-${timestamp}-${random}`
        : `${seasonId}-nobooking-${timestamp}-${random}`;

      const newBooking: Partial<MasterBooking> = {
        ...bookingData,
        'Booking ID': bookingId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isPrebooked: bookingData.isPrebooked ?? false,
        Completed: bookingData.Completed || '',
        Status: bookingData.Status || 'pending',
        Price: bookingData.Price?.toString() || '0.00',
        'First Name': bookingData['First Name'] || '',
        'Last Name': bookingData['Last Name'] || '',
        'Full Address': bookingData['Full Address'] || '',
        'Master Map': bookingData['Master Map'] || 'Unknown',
        Group: bookingData['Group'] || 'Unknown',
      };

      newBooking['season_id'] = seasonId;

      await BookingService.create(newBooking);
      console.log(`Added booking ${bookingId} to Supabase`);
    } catch (error) {
      console.error('Failed to add booking:', error);
      throw error;
    }
  }

  public async completeBooking(bookingId: string, paymentMethod: string, isPaid: boolean): Promise<void> {
    await this.updateBooking(bookingId, {
      Completed: 'x',
      Status: '',
      'Payment Method': paymentMethod,
      'Is Paid': isPaid,
      'Date Completed': new Date().toISOString(),
    });
  }

  public async cancelBooking(bookingId: string): Promise<void> {
    await this.updateBooking(bookingId, {
      Status: 'cancelled',
      Completed: '',
      'Date Completed': new Date().toISOString(),
    });
  }

  public async replaceAllBookingsForSeason(bookings: MasterBooking[], seasonId: string): Promise<void> {
    try {
      await BookingService.deleteBySeasonId(seasonId);
      console.log(`Deleted all existing bookings for season ${seasonId}`);

      const bookingsWithSeasonId = bookings.map(b => ({
        ...b,
        'season_id': seasonId,
      }));

      await BookingService.bulkInsert(bookingsWithSeasonId);
      console.log(`Inserted ${bookings.length} bookings for season ${seasonId}`);

      if (seasonId === this.activeSeasonId) {
        await this.syncBookingsFromDatabase();
      }
    } catch (error) {
      console.error('Failed to replace bookings:', error);
      throw error;
    }
  }

  public cleanup(): void {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
  }
}

export const supabaseBookingStore = SupabaseBookingStore.getInstance();
