import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronDown, ChevronUp, Mail, Users, X } from 'lucide-react';
import EmailTemplate from '../../components/EmailTemplate';
import AssignRouteManager from '../../components/AssignRouteManager';
import { MapAssignmentService } from '../../services/assignment.service';
import { supabaseBookingStore } from '../../stores/SupabaseBookingStore';

interface Territory {
  group: string;
  map: string;
  routeCount: number;
  bookingsCount: number;
  routesWithBookings: number;
  totalValue: number;
  routes: Route[];
}

interface Route {
  code: string;
  bookings: number;
  value: number;
}

interface GroupedTerritories {
  [key: string]: Territory[];
}

interface RouteManager {
  name: string;
  initials: string;
}

const MasterMaps: React.FC = () => {
  const [territories, setTerritories] = useState<GroupedTerritories>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<string | null>(null);
  const [selectedMaps, setSelectedMaps] = useState<Set<string>>(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState<Set<string>>(new Set());
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [showAssignManager, setShowAssignManager] = useState(false);
  const [assignments, setAssignments] = useState<
    Record<string, { manager: RouteManager; date: string }>
  >({});
  const navigate = useNavigate();

  useEffect(() => {
    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener('bookingStoreRefreshed', handleRefresh);
    return () =>
      window.removeEventListener('bookingStoreRefreshed', handleRefresh);
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      setError(null);

      // Load assignments
      setAssignments(getStorageItem(STORAGE_KEYS.MAP_ASSIGNMENTS, {}));

      // Get bookings from localStorage
      const bookings = getStorageItem(STORAGE_KEYS.BOOKINGS, []);

      if (!bookings.length) {
        setTerritories({});
        setLoading(false);
        return;
      }

      // Group bookings by master map
      const mapData: Record<string, Territory> = {};

      bookings.forEach((booking: any) => {
        const masterMap = booking['Master Map'];
        const routeNumber = booking['Route Number'];
        const group = booking['Group'];
        const price = parseFloat(booking['Price'] || '59.99');

        if (!masterMap || !routeNumber || !group) return;

        if (!mapData[masterMap]) {
          mapData[masterMap] = {
            group,
            map: masterMap,
            routeCount: 0,
            bookingsCount: 0,
            routesWithBookings: 0,
            totalValue: 0,
            routes: [],
          };
        }

        // Update map statistics
        mapData[masterMap].bookingsCount++;
        mapData[masterMap].totalValue += price;

        // Update route statistics
        let route = mapData[masterMap].routes.find(
          (r) => r.code === routeNumber
        );
        if (!route) {
          route = { code: routeNumber, bookings: 0, value: 0 };
          mapData[masterMap].routes.push(route);
          mapData[masterMap].routeCount++;
        }
        route.bookings++;
        route.value += price;
      });

      // Calculate routes with bookings
      Object.values(mapData).forEach((territory) => {
        territory.routesWithBookings = territory.routes.filter(
          (r) => r.bookings > 0
        ).length;
        territory.routes.sort((a, b) => a.code.localeCompare(b.code));
      });

      // Group by territory
      const groupedData = Object.values(mapData).reduce(
        (acc: GroupedTerritories, territory) => {
          if (!acc[territory.group]) {
            acc[territory.group] = [];
          }
          acc[territory.group].push(territory);
          return acc;
        },
        {}
      );

      // Sort groups and territories
      const sortedGroups = Object.keys(groupedData).sort();
      const sortedTerritories = sortedGroups.reduce(
        (acc: GroupedTerritories, group) => {
          acc[group] = groupedData[group].sort((a, b) =>
            a.map.toLowerCase().localeCompare(b.map.toLowerCase())
          );
          return acc;
        },
        {}
      );

      setTerritories(sortedTerritories);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };

  const toggleMap = (map: string) => {
    setExpandedMap(expandedMap === map ? null : map);
  };

  const handleMapSelect = (map: string) => {
    const newSelectedMaps = new Set(selectedMaps);
    const territory = Object.values(territories)
      .flat()
      .find((t) => t.map === map);

    if (territory) {
      if (selectedMaps.has(map)) {
        newSelectedMaps.delete(map);
        const newSelectedRoutes = new Set(selectedRoutes);
        territory.routes.forEach((route) => {
          newSelectedRoutes.delete(route.code);
        });
        setSelectedRoutes(newSelectedRoutes);
      } else {
        newSelectedMaps.add(map);
        const newSelectedRoutes = new Set(selectedRoutes);
        territory.routes.forEach((route) => {
          newSelectedRoutes.add(route.code);
        });
        setSelectedRoutes(newSelectedRoutes);
      }
      setSelectedMaps(newSelectedMaps);
    }
  };

  const handleRouteSelect = (route: string, map: string) => {
    const newSelectedRoutes = new Set(selectedRoutes);
    const territory = Object.values(territories)
      .flat()
      .find((t) => t.map === map);

    if (territory) {
      if (selectedRoutes.has(route)) {
        newSelectedRoutes.delete(route);
        const hasSelectedRoutes = territory.routes.some((r) =>
          newSelectedRoutes.has(r.code)
        );
        if (!hasSelectedRoutes) {
          const newSelectedMaps = new Set(selectedMaps);
          newSelectedMaps.delete(map);
          setSelectedMaps(newSelectedMaps);
        }
      } else {
        newSelectedRoutes.add(route);
        const allRoutesSelected = territory.routes.every(
          (r) => newSelectedRoutes.has(r.code) || r.code === route
        );
        if (allRoutesSelected) {
          const newSelectedMaps = new Set(selectedMaps);
          newSelectedMaps.add(map);
          setSelectedMaps(newSelectedMaps);
        }
      }
      setSelectedRoutes(newSelectedRoutes);
    }
  };

  const handleAssignManager = (manager: RouteManager) => {
    const newAssignments = { ...assignments };
    const today = new Date();
    const assignmentDate = `${today.toLocaleString('default', {
      month: 'short',
    })}${today.getDate()}`;

    selectedMaps.forEach((map) => {
      newAssignments[map] = { manager, date: assignmentDate };
    });

    selectedRoutes.forEach((route) => {
      newAssignments[route] = { manager, date: assignmentDate };
    });

    setStorageItem(STORAGE_KEYS.MAP_ASSIGNMENTS, newAssignments);
    setAssignments(newAssignments);
    setSelectedMaps(new Set());
    setSelectedRoutes(new Set());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cps-blue"></div>
      </div>
    );
  }

  if (!Object.keys(territories).length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-gray-400">No bookings data available</p>
        <button
          onClick={() => navigate('/console/bookings/import')}
          className="flex items-center gap-2 px-4 py-2 bg-cps-blue text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          <span>Import Bookings</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-10 -mx-6 px-6 py-2 bg-[#1a2832] border-b border-gray-800">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowEmailTemplate(true)}
            className="px-3 py-1.5 bg-cps-blue text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm"
          >
            <Mail size={14} />
            <span>Notifications</span>
          </button>
          <button
            onClick={() => setShowAssignManager(true)}
            disabled={selectedMaps.size === 0 && selectedRoutes.size === 0}
            className="px-3 py-1.5 bg-[#f97316] text-white rounded-md hover:bg-[#ea580c] transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Users size={14} />
            <span>Assign</span>
          </button>
        </div>
      </div>

      {Object.entries(territories).map(([group, maps]) => (
        <div key={group} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400 border-b border-gray-700 pb-1">
            {group}
          </h3>

          <div className="grid grid-cols-1 gap-1">
            {maps.map((territory) => (
              <div key={territory.map}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMaps.has(territory.map)}
                    onChange={() => handleMapSelect(territory.map)}
                    className="rounded border-gray-600 bg-gray-700 text-cps-blue focus:ring-cps-blue"
                  />
                  <button
                    onClick={() => toggleMap(territory.map)}
                    className="flex-1 bg-gray-800 rounded-md py-1.5 px-3 hover:bg-gray-700/80 transition-colors border border-gray-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white">
                        {territory.map}
                      </h4>
                      {assignments[territory.map] && (
                        <div className="w-6 h-6 rounded-full bg-cps-blue flex items-center justify-center text-xs font-medium text-white">
                          {assignments[territory.map].manager.initials}
                        </div>
                      )}
                      {expandedMap === territory.map ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Rts:</span>
                        <span className="text-xs font-medium text-gray-200">
                          {territory.routeCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">PBs:</span>
                        <span className="text-xs font-medium text-cps-blue">
                          {territory.bookingsCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Over:</span>
                        <span className="text-xs font-medium text-cps-green">
                          {territory.routesWithBookings}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">$$:</span>
                        <span className="text-xs font-medium text-cps-yellow">
                          ${territory.totalValue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                {expandedMap === territory.map && (
                  <div className="mt-1 grid grid-cols-3 gap-1">
                    {territory.routes.map((route) => (
                      <div
                        key={route.code}
                        className="bg-gray-700/30 rounded-md p-2 border border-gray-700/30 flex items-center"
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={selectedRoutes.has(route.code)}
                            onChange={() =>
                              handleRouteSelect(route.code, territory.map)
                            }
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cps-blue focus:ring-cps-blue cursor-pointer"
                          />
                        </div>

                        <div className="flex-1 flex items-center justify-center gap-2">
                          <span className="text-sm font-medium text-gray-200">
                            {route.code}
                          </span>
                          {assignments[route.code] && (
                            <div className="w-6 h-6 rounded-full bg-cps-blue flex items-center justify-center text-xs font-medium text-white">
                              {assignments[route.code].manager.initials}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end justify-between min-w-[60px]">
                          <span className="text-xs font-medium text-cps-blue">
                            {route.bookings} PBs
                          </span>
                          <span className="text-xs text-gray-400">
                            ${route.value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <EmailTemplate
        isOpen={showEmailTemplate}
        onClose={() => setShowEmailTemplate(false)}
        selectedMaps={selectedMaps}
        selectedRoutes={selectedRoutes}
      />

      <AssignRouteManager
        isOpen={showAssignManager}
        onClose={() => setShowAssignManager(false)}
        onAssign={handleAssignManager}
        selectedMaps={selectedMaps}
        selectedRoutes={selectedRoutes}
      />
    </div>
  );
};

export default MasterMaps;
