// src/pages/RouteManager/Routes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, X } from 'lucide-react';
import {
  ensureEastTerritoryStructureFetched,
  createRouteToTerritoryMap,
} from '../../lib/dataSyncService';
import { MasterBooking } from '../../types';
import { RouteAssignmentService, MapAssignmentService } from '../../services/assignment.service';
import { AuthService } from '../../services/auth.service';
import { supabaseBookingStore } from '../../stores/SupabaseBookingStore';
import { format } from 'date-fns';
import { getCurrentDate } from '../../lib/date';

interface Route {
  routeNumber: string;
  totalBookings: number;
  prepaidBookings: number;
  totalValue: number;
  assignedTo: string | null;
  status: 'in-progress' | 'completed';
}

interface Contractor {
  id: string;
  firstName: string;
  lastName: string;
  assignedRoutes: string[];
}

// Define FullTerritoryStructure locally for this component
interface FullTerritoryStructure {
  [group: string]: {
    [map: string]: string[];
  };
}

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get Logged-in Route Manager from AuthService
      const session = await AuthService.getSession();
      if (!session || session.userType !== 'route_manager') {
        navigate('/route-manager/login', { replace: true });
        return;
      }

      const routeManager = session.profile;
      const routeManagerName = routeManager.name;

      if (!routeManagerName?.trim()) {
        throw new Error('No route manager found. Please log in again.');
      }

      // 2. Get Route/Map Assignments for this RM from Supabase
      const today = format(getCurrentDate(), 'yyyy-MM-dd');
      const mapAssignments = await MapAssignmentService.getByDate(today);
      const managerAssignedKeys = new Set<string>();
      Object.entries(mapAssignments).forEach(([key, assignment]) => {
        if (!assignment) return;
        if (assignment.name?.toLowerCase() === routeManagerName.toLowerCase()) {
          managerAssignedKeys.add(key);
        }
      });

      // 3. Fetch Full Territory Structure (to find all routes in assigned maps)
      const structure = await ensureEastTerritoryStructureFetched();
      const allMapsInStructure = new Set<string>();
      Object.values(structure).forEach((maps) =>
        Object.keys(maps).forEach((map) => allMapsInStructure.add(map))
      );

      // 4. Determine Full List of Assigned Routes
      const routeSet = new Set<string>();
      managerAssignedKeys.forEach((key) => {
        if (allMapsInStructure.has(key)) {
          // It's a map, find all its routes
          const groupName = Object.keys(structure).find(
            (g) => structure[g][key]
          );
          if (groupName) {
            const routesInMap = structure[groupName][key] || [];
            routesInMap.forEach((route) => routeSet.add(route));
          }
        } else {
          // It's an individual route
          routeSet.add(key);
        }
      });

      // 5. Load Bookings from Supabase
      const allBookingsForSeason: MasterBooking[] = await supabaseBookingStore.getAllBookings();

      // 6. Filter bookings to only those relevant to this RM's routes
      const relevantBookings = allBookingsForSeason.filter(
        (b) => b['Route Number'] && routeSet.has(b['Route Number'])
      );

      // 7. Calculate Route Data (Iterate over `routeSet` to include routes with 0 bookings)
      const routeAssignments = await RouteAssignmentService.getByDate(today);

      const routesData: Route[] = Array.from(routeSet).map((routeNumber) => {
        const routeBookings = relevantBookings.filter(
          (booking) => booking['Route Number'] === routeNumber
        );

        const completedBookings = routeBookings.filter(
          (booking) => booking['Completed'] === 'x'
        );

        const prepaidBookings = routeBookings.filter(
          (booking) => booking['Prepaid'] === 'x'
        ).length;

        const totalValue = routeBookings.reduce(
          (sum: number, booking: MasterBooking) =>
            sum + (parseFloat(booking['Price'] || '59.99') || 59.99),
          0
        );

        const status =
          routeBookings.length > 0 &&
          completedBookings.length === routeBookings.length
            ? 'completed'
            : 'in-progress';

        return {
          routeNumber,
          totalBookings: routeBookings.length,
          prepaidBookings,
          totalValue,
          assignedTo: routeAssignments[routeNumber] || null, // Contractor assignment
          status,
        };
      });

      // Sort routes: unassigned first, then by value
      routesData.sort((a, b) => {
        if (a.assignedTo === null && b.assignedTo !== null) return -1;
        if (a.assignedTo !== null && b.assignedTo === null) return 1;
        return b.totalValue - a.totalValue;
      });

      // 8. Load Contractors available for assignment from Supabase
      const { WorkerService } = await import('../../services/database.service');
      const workers = await WorkerService.getAll();
      const filteredWorkers = workers.filter((worker) => {
        if (!worker?.routeManager) return false;
        return (
          worker.routeManager.toLowerCase() ===
          routeManagerName.toLowerCase()
        );
      });

      const availableContractors = filteredWorkers.map((worker: any) => {
        const assignedRoutes = Object.entries(routeAssignments)
          .filter(([_, contractorId]) => contractorId === worker.contractorId)
          .map(([route]) => route);

        return {
          id: worker.contractorId,
          firstName: worker.firstName,
          lastName: worker.lastName,
          assignedRoutes,
        };
      });

      setRoutes(routesData);
      setContractors(availableContractors);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []); // Use useCallback to stabilize the function

  useEffect(() => {
    loadData();

    // Refresh data periodically or on custom events
    window.addEventListener('bookingStoreRefreshed', loadData);

    return () => {
      window.removeEventListener('bookingStoreRefreshed', loadData);
    };
  }, [loadData]);

  const assignContractor = async (
    routeNumber: string,
    contractorId: string | null
  ) => {
    try {
      const today = format(getCurrentDate(), 'yyyy-MM-dd');

      // Update Route Assignments in Supabase
      if (contractorId) {
        await RouteAssignmentService.setAssignment(routeNumber, contractorId, today);
      } else {
        await RouteAssignmentService.removeAssignment(routeNumber, today);
      }

      // Update the bookings to reflect the contractor assignment
      const allBookings = await supabaseBookingStore.getAllBookings();
      for (const booking of allBookings) {
        if (booking['Route Number'] === routeNumber) {
          await supabaseBookingStore.updateBooking(booking.id, {
            'Contractor Number': contractorId || undefined,
          });
        }
      }

      setSelectedRoute(null);
      loadData(); // Refresh the UI
    } catch (error) {
      console.error('Error assigning contractor:', error);
      setError('Failed to assign contractor');
    }
  };

  const getContractorInitials = (contractorId: string | null) => {
    if (!contractorId) return '';
    const contractor = contractors.find((c) => c.id === contractorId);
    if (!contractor) return '';
    return `${contractor.firstName[0] || ''}${contractor.lastName[0] || ''}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="w-8 h-8 text-cps-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cps-light-red text-white p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const unassignedRoutes = routes.filter((route) => !route.assignedTo);
  const assignedRoutes = routes.filter((route) => route.assignedTo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-white">Routes</h2>
          <span className="text-sm text-gray-400">({routes.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {unassignedRoutes.map((route) => (
          <div
            key={route.routeNumber}
            onClick={() => setSelectedRoute(route.routeNumber)}
            className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">
                {route.routeNumber}
              </h3>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-gray-700 text-gray-400"
                title="Unassigned"
              >
                {getContractorInitials(route.assignedTo) || '?'}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                PBs:{' '}
                <span className="text-cps-blue">{route.totalBookings}</span>
              </span>
              <span>
                PPs:{' '}
                <span className="text-green-400">{route.prepaidBookings}</span>
              </span>
              <span>
                $:{' '}
                <span className="text-cps-yellow">
                  {route.totalValue.toFixed(0)}
                </span>
              </span>
            </div>
          </div>
        ))}

        {assignedRoutes.map((route) => (
          <div
            key={route.routeNumber}
            onClick={() => setSelectedRoute(route.routeNumber)}
            className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700/80 transition-colors cursor-pointer border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">
                {route.routeNumber}
              </h3>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-cps-blue text-white"
                title={`Assigned to ${getContractorInitials(route.assignedTo)}`}
              >
                {getContractorInitials(route.assignedTo)}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                PBs:{' '}
                <span className="text-cps-blue">{route.totalBookings}</span>
              </span>
              <span>
                PPs:{' '}
                <span className="text-green-400">{route.prepaidBookings}</span>
              </span>
              <span>
                $:{' '}
                <span className="text-cps-yellow">
                  {route.totalValue.toFixed(0)}
                </span>
              </span>
            </div>
          </div>
        ))}

        {routes.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">
            No routes assigned to your profile.
          </div>
        )}
      </div>

      {selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-4 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">
                Assign Route {selectedRoute}
              </h3>
              <button
                onClick={() => setSelectedRoute(null)}
                className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
              {/* Unassign Button */}
              <button
                onClick={() => assignContractor(selectedRoute, null)}
                className="w-full py-2 px-4 text-left bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Unassign
              </button>
              {/* Contractor List */}
              {contractors
                .sort((a, b) => {
                  const aHasRoute = a.assignedRoutes.length > 0;
                  const bHasRoute = b.assignedRoutes.length > 0;
                  if (aHasRoute === bHasRoute) {
                    return a.firstName.localeCompare(b.firstName); // Sort alphabetically
                  }
                  return aHasRoute ? 1 : -1; // Sort those without routes first
                })
                .map((contractor) => (
                  <button
                    key={contractor.id}
                    onClick={() =>
                      assignContractor(selectedRoute, contractor.id)
                    }
                    className="w-full py-2 px-4 text-left bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-between"
                  >
                    <span>
                      {contractor.firstName} {contractor.lastName}
                    </span>
                    {contractor.assignedRoutes.length > 0 && (
                      <span className="text-xs text-gray-400">
                        ({contractor.assignedRoutes.length} routes)
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routes;
