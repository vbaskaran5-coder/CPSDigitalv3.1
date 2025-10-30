import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase, RouteAssignment, getRouteAssignments, upsertRouteAssignment } from '../lib/supabase';

interface Contractor {
  firstName: string;
  lastName: string;
  number: string;
}

interface Route {
  number: string;
  name: string;
  area: string;
}

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [assignments, setAssignments] = useState<RouteAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load route assignments from Supabase
      const routeAssignments = await getRouteAssignments();
      setAssignments(routeAssignments);

      // Load routes and contractors from local storage
      const savedRoutes = localStorage.getItem('routes');
      const savedContractors = localStorage.getItem('contractors');

      if (savedRoutes) {
        setRoutes(JSON.parse(savedRoutes));
      }

      if (savedContractors) {
        setContractors(JSON.parse(savedContractors));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const assignContractor = async (routeNumber: string, contractor: Contractor | null) => {
    try {
      setError(null);

      if (contractor) {
        // Update Supabase with the new assignment
        await upsertRouteAssignment({
          route_number: routeNumber,
          contractor_first_name: contractor.firstName,
          contractor_last_name: contractor.lastName
        });

        // Update local state
        setAssignments(prev => {
          const newAssignments = prev.filter(a => a.route_number !== routeNumber);
          return [...newAssignments, {
            id: `${routeNumber}-${Date.now()}`,
            route_number: routeNumber,
            contractor_first_name: contractor.firstName,
            contractor_last_name: contractor.lastName
          }];
        });
      } else {
        // Remove assignment from Supabase
        const { error } = await supabase
          .from('route_assignments')
          .delete()
          .eq('route_number', routeNumber);

        if (error) throw error;

        // Update local state
        setAssignments(prev => prev.filter(a => a.route_number !== routeNumber));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
    }
  };

  const getAssignedContractor = (routeNumber: string): Contractor | null => {
    const assignment = assignments.find(a => a.route_number === routeNumber);
    if (!assignment) return null;

    return {
      firstName: assignment.contractor_first_name,
      lastName: assignment.contractor_last_name,
      number: `${assignment.contractor_first_name}-${assignment.contractor_last_name}`
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cps-red"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Route Assignments</h1>

        {error && (
          <div className="bg-cps-light-red text-white p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {routes.map(route => {
            const assignedContractor = getAssignedContractor(route.number);

            return (
              <div 
                key={route.number}
                className="bg-gray-700/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-200">
                      {route.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Route #{route.number} • {route.area}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={assignedContractor ? `${assignedContractor.firstName} ${assignedContractor.lastName}` : ''}
                      onChange={(e) => {
                        const [firstName, lastName] = e.target.value.split(' ');
                        const contractor = e.target.value 
                          ? contractors.find(c => c.firstName === firstName && c.lastName === lastName)
                          : null;
                        assignContractor(route.number, contractor);
                      }}
                      className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cps-red focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {contractors.map(contractor => (
                        <option 
                          key={`${contractor.firstName}-${contractor.lastName}`}
                          value={`${contractor.firstName} ${contractor.lastName}`}
                        >
                          {contractor.firstName} {contractor.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;