// src/contexts/JobContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { MasterBooking, Worker, ConsoleProfile } from '../types';
import { supabaseBookingStore } from '../stores/SupabaseBookingStore';
import { AuthService } from '../services/auth.service';
import { TerritoryStructureService } from '../services/database.service';

// Filter interface
interface Filter {
  status?: 'pending' | 'completed' | 'contracts' | undefined;
}

interface JobContextType {
  bookings: MasterBooking[]; // Filtered bookings for the current view
  allBookings: MasterBooking[]; // All relevant bookings for the user
  loading: boolean;
  error: string | null;
  addJob: (jobData: Partial<MasterBooking>) => void;
  getJob: (id: string) => MasterBooking | undefined;
  updateJob: (id: string, updates: Partial<MasterBooking>) => void;
  completeJob: (id: string, paymentMethod: string, isPaid: boolean) => void;
  cancelJob: (id: string) => void;
  completedSteps: number;
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  syncJobs: () => Promise<void>; // Kept for potential manual trigger, though less critical now
  isAddContractOpen: boolean;
  openAddContract: () => void;
  closeAddContract: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>({ status: undefined });
  // This state holds ALL relevant bookings for the logged-in worker for the active season
  const [allBookings, setAllBookings] = useState<MasterBooking[]>([]);
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);

  const openAddContract = () => setIsAddContractOpen(true);
  const closeAddContract = () => setIsAddContractOpen(false);

  // Function to load and filter bookings based on user type
  const loadAndFilterBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('JobContext: Reloading and filtering bookings for worker...');

    try {
      const session = await AuthService.getSession();
      const loggedInWorkerId = session?.userId;

      let relevantBookings: MasterBooking[] = [];

      if (loggedInWorkerId && typeof loggedInWorkerId === 'string') {
        try {
          relevantBookings = await supabaseBookingStore.getBookingsForContractor(loggedInWorkerId);
          console.log(
            `JobContext: Filtered down to ${relevantBookings.length} relevant bookings for worker ${loggedInWorkerId}.`
          );
        } catch (bookingError) {
          console.error('Error fetching bookings for contractor:', bookingError);
          relevantBookings = [];
        }
      } else {
        console.log('JobContext: No logged-in worker found, will load after authentication.');
      }

      setAllBookings(relevantBookings);
    } catch (err) {
      console.error('Error loading/filtering bookings in JobContext:', err);
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to load initially and listen for store refreshes
  useEffect(() => {
    loadAndFilterBookings();

    const handleStoreRefresh = () => {
      console.log('JobContext detected bookingStoreRefreshed event.');
      loadAndFilterBookings();
    };
    window.addEventListener('bookingStoreRefreshed', handleStoreRefresh);

    return () => {
      window.removeEventListener('bookingStoreRefreshed', handleStoreRefresh);
    };
  }, [loadAndFilterBookings]);

  // Filter the `allBookings` based on the UI filter state
  const filteredBookings = useMemo(() => {
    console.log('JobContext: Applying UI filter:', filter);
    return allBookings.filter((booking) => {
      // Apply status filter
      if (filter.status === 'completed' && booking['Completed'] !== 'x')
        return false;
      if (filter.status === 'contracts' && !booking.isContract) return false;
      if (
        filter.status === 'pending' &&
        // Pending should EXCLUDE completed, any with a status (cancelled, redo etc.), and contracts
        (booking['Completed'] === 'x' ||
          !!booking['Status'] || // Check if Status has any value other than empty/null/undefined
          booking.isContract)
      )
        return false;

      // Add more filter logic here if needed (e.g., date filtering)

      return true; // Passed all filters
    });
  }, [allBookings, filter]);

  // Calculate completed steps based on the worker's relevant bookings
  const completedSteps = useMemo(
    () => allBookings.filter((booking) => booking['Completed'] === 'x').length,
    [allBookings]
  );

  // --- Store Interaction Methods ---
  // These methods now just pass calls through to the bookingStore instance.
  // The store handles saving and triggering the 'bookingStoreRefreshed' event.

  const addJob = useCallback(async (jobData: Partial<MasterBooking>) => {
    setError(null);

    try {
      const session = await AuthService.getSession();
      const loggedInWorkerId = session?.userId;

      if (!loggedInWorkerId) {
        const msg = 'Cannot add job: No logged-in worker identified.';
        setError(msg);
        console.error(msg);
        alert(msg);
        return;
      }

      let group = 'Unknown';
      let masterMap = 'Unknown';

      if (jobData['Route Number']) {
        try {
          const territoryStructure = await TerritoryStructureService.get('East');
          let found = false;
          for (const grp in territoryStructure) {
            for (const map in territoryStructure[grp]) {
              if (territoryStructure[grp][map].includes(jobData['Route Number'])) {
                group = grp;
                masterMap = map;
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (!found) {
            console.warn(
              `Route Number ${jobData['Route Number']} not found in East Territory Structure.`
            );
          }
        } catch (err) {
          console.error('Failed to fetch territory structure:', err);
        }
      }

      const bookingToAdd: Partial<MasterBooking> = {
        ...jobData,
        'Contractor Number': typeof loggedInWorkerId === 'string' ? loggedInWorkerId : String(loggedInWorkerId),
        isPrebooked: false,
        Completed: jobData.Completed || 'x',
        Status: jobData.Status || '',
        'Date Completed': jobData['Date Completed'] || new Date().toISOString(),
        'Is Paid': jobData['Is Paid'] ?? jobData['Payment Method'] !== 'Billed',
        Price: jobData.Price?.toString() || '0.00',
        'First Name': jobData['First Name'] || '',
        'Last Name': jobData['Last Name'] || '',
        'Full Address': jobData['Full Address'] || '',
        Group: group,
        'Master Map': masterMap,
      };

      await supabaseBookingStore.addBooking(bookingToAdd);
    } catch (err) {
      const errorMsg = `Failed to add job: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`;
      console.error('Error in JobContext addJob:', err);
      setError(errorMsg);
      alert(errorMsg);
    }
  }, []);

  const getJob = useCallback(
    (id: string): MasterBooking | undefined => {
      // This gets from the worker's *currently loaded* filtered list
      return allBookings.find((b) => b['Booking ID'] === id);
    },
    [allBookings]
  ); // Recreate if allBookings changes

  const updateJob = useCallback(
    async (id: string, updates: Partial<MasterBooking>) => {
      setError(null);
      if (updates.Price && typeof updates.Price === 'number') {
        updates.Price = updates.Price.toFixed(2);
      }
      try {
        await supabaseBookingStore.updateBooking(id, updates);
      } catch (err) {
        const errorMsg = `Failed to update job ${id}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`;
        console.error('Error in JobContext updateJob:', err);
        setError(errorMsg);
      }
    },
    []
  );

  const completeJob = useCallback(
    async (id: string, paymentMethod: string, isPaid: boolean) => {
      setError(null);
      try {
        await supabaseBookingStore.completeBooking(id, paymentMethod, isPaid);
      } catch (err) {
        const errorMsg = `Failed to complete job ${id}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`;
        console.error('Error in JobContext completeJob:', err);
        setError(errorMsg);
      }
    },
    []
  );

  const cancelJob = useCallback(async (id: string) => {
    setError(null);
    try {
      await supabaseBookingStore.cancelBooking(id);
    } catch (err) {
      const errorMsg = `Failed to cancel job ${id}: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`;
      console.error('Error in JobContext cancelJob:', err);
      setError(errorMsg);
    }
  }, []);

  // Sync function might be less critical if store events work reliably,
  // but can be kept as a manual refresh trigger.
  const syncJobs = useCallback(async (): Promise<void> => {
    console.log('Manual sync triggered in JobContext...');
    loadAndFilterBookings(); // Manually trigger a reload from the store
  }, [loadAndFilterBookings]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      bookings: filteredBookings,
      allBookings: allBookings,
      loading,
      error,
      addJob,
      getJob,
      updateJob,
      completeJob,
      cancelJob,
      completedSteps,
      filter,
      setFilter,
      syncJobs,
      isAddContractOpen,
      openAddContract,
      closeAddContract,
    }),
    [
      filteredBookings,
      allBookings,
      loading,
      error,
      addJob,
      getJob,
      updateJob,
      completeJob,
      cancelJob,
      completedSteps,
      filter,
      syncJobs,
      isAddContractOpen,
    ]
  );

  return (
    <JobContext.Provider value={contextValue}>{children}</JobContext.Provider>
  );
};

// useJobs hook remains the same
export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
