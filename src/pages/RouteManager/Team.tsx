// src/pages/RouteManager/Team.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { getCurrentDate } from '../../lib/date';
import ContractorJobs from '../../components/ContractorJobs';
import { AuthService } from '../../services/auth.service';
import {
  WorkerService,
  CartService,
  ActiveSeasonService,
} from '../../services/database.service';
import {
  ConsoleProfile,
  Worker,
  Cart,
  MasterBooking,
  HardcodedSeason,
  PayoutLogicSettings,
  RouteManagerProfile,
} from '../../types';
import { defaultPayoutLogicSettings } from '../../lib/hardcodedData';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  number: string;
  phone: string;
  steps: number;
  averagePrice: number;
  gasSteps: number; // This field seems unused in calc, but kept for type structure
  equivalent: number;
  assignedRoutes: string[];
  cartId?: number | null;
}

interface TeamCart {
  id: number;
  members: TeamMember[];
  steps: number;
  averagePrice: number;
  gasSteps: number; // This field seems unused in calc, but kept for type structure
  equivalent: number;
  assignedRoutes: string[];
}

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamCarts, setTeamCarts] = useState<TeamCart[]>([]);
  const [isTeamSeason, setIsTeamSeason] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const loadTeamData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await AuthService.getSession();
      const routeManager = session?.profile as RouteManagerProfile;

      if (!routeManager) {
        setError('Route manager not found');
        setLoading(false);
        return;
      }

      const routeManagerName = `${routeManager.firstName} ${routeManager.lastName}`.toLowerCase();
      if (!routeManagerName.trim()) {
        throw new Error('No route manager found. Please log in again.');
      }

      const allWorkers = await WorkerService.getAll();
      const assignedWorkers = allWorkers.filter(
        (w: Worker) =>
          w.routeManager &&
          `${w.routeManager.name}`.toLowerCase() === routeManagerName &&
          w.showed &&
          w.showedDate === format(getCurrentDate(), 'yyyy-MM-dd')
      );

      const activeSeason = await ActiveSeasonService.get(routeManager.consoleProfileId);
      const isTeam = activeSeason?.activeSeasonId?.toLowerCase().includes('rejuv') ||
                     activeSeason?.activeSeasonId?.toLowerCase().includes('sealing') ||
                     activeSeason?.activeSeasonId?.toLowerCase().includes('cleaning');

      if (!isTeam) {
        const teamMembersList: TeamMember[] = assignedWorkers.map((w: Worker) => ({
          id: w.contractorId,
          firstName: w.firstName,
          lastName: w.lastName,
          number: w.contractorId,
          phone: w.cellPhone,
          steps: 0,
          averagePrice: 0,
          gasSteps: 0,
          equivalent: 0,
          assignedRoutes: [],
          cartId: w.cartId || null,
        }));
        setTeamMembers(teamMembersList);
        setIsTeamSeason(false);
      } else {
        const carts = await CartService.getAll();
        const rmCarts = carts.filter(
          (cart: Cart) =>
            cart.routeManager &&
            `${cart.routeManager.name}`.toLowerCase() === routeManagerName
        );
        setTeamCarts(rmCarts as any);
        setIsTeamSeason(true);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cps-blue"></div>
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

  return (
    <div className="space-y-2">
      {(isTeamSeason ? teamCarts.length > 0 : teamMembers.length > 0) ? (
        isTeamSeason ? (
          teamCarts.map((cart) => (
            <div
              key={cart.id}
              className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700/80 transition-colors w-full"
            >
              <button
                onClick={() => toggleItem(`cart-${cart.id}`)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="w-1/4">
                    <h3 className="text-sm font-medium text-white">
                      Cart #{cart.id}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {cart.members.map((m) => m.firstName).join(', ')}
                    </p>
                  </div>
                  <div className="w-2/4 flex flex-col items-center justify-center gap-2">
                    {cart.assignedRoutes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {cart.assignedRoutes.map((route) => (
                          <span
                            key={route}
                            className="px-2 py-0.5 bg-cps-blue text-white rounded text-xs font-medium"
                          >
                            {route}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-1/4 flex items-center justify-end gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          Steps:
                        </span>
                        <span className="text-sm text-gray-200">
                          {cart.steps}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          Avg:
                        </span>
                        <span className="text-sm text-gray-200">
                          ${cart.averagePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          EQ:
                        </span>
                        <span className="text-sm text-gray-200">
                          {cart.equivalent.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {expandedItem === `cart-${cart.id}` ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
              {expandedItem === `cart-${cart.id}` &&
                cart.members.map((member) => (
                  <ContractorJobs
                    key={member.id}
                    contractorNumber={member.number}
                  />
                ))}
            </div>
          ))
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700/80 transition-colors w-full"
            >
              <button
                onClick={() => toggleItem(member.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="w-1/4">
                    <h3 className="text-sm font-medium text-white">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-xs text-gray-400">{member.phone}</p>
                  </div>

                  <div className="w-2/4 flex flex-col items-center justify-center gap-2">
                    {member.assignedRoutes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {member.assignedRoutes.map((route) => (
                          <span
                            key={route}
                            className="px-2 py-0.5 bg-cps-blue text-white rounded text-xs font-medium"
                          >
                            {route}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-1/4 flex items-center justify-end gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          Steps:
                        </span>
                        <span className="text-sm text-gray-200">
                          {member.steps}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          Avg:
                        </span>
                        <span className="text-sm text-gray-200">
                          ${member.averagePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          EQ:
                        </span>
                        <span className="text-sm text-gray-200">
                          {member.equivalent.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {expandedItem === member.id ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
              {expandedItem === member.id && (
                <ContractorJobs contractorNumber={member.number} />
              )}
            </div>
          ))
        )
      ) : (
        <div className="text-center text-gray-400 py-12">
          No team members or carts are assigned to you for today in the active
          season.
        </div>
      )}
    </div>
  );
};

export default Team;
