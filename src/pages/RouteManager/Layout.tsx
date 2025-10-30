import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, MapPin, ClipboardList, Loader } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { RouteManagerProfile } from '../../types';

interface TeamStats {
  totalSteps: number;
  averagePrice: number;
  totalGross: number;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [routeManager, setRouteManager] = useState<RouteManagerProfile | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalSteps: 0,
    averagePrice: 0,
    totalGross: 0,
  });
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  useEffect(() => {
    const loadRouteManagerData = async () => {
      try {
        const session = await AuthService.getSession();
        if (!session || session.userType !== 'route_manager') {
          navigate('/route-manager/login', { replace: true });
          return;
        }

        const profile = session.profile as RouteManagerProfile;
        setRouteManager(profile);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load route manager data:', error);
        navigate('/route-manager/login', { replace: true });
      }
    };

    loadRouteManagerData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Static Sidebar */}
      <div className="w-20 bg-gray-900 border-r border-gray-800 fixed h-screen">
        <div className="p-4">
          <nav className="space-y-2">
            <button
              onClick={() => navigate('/route-manager/team')}
              className={`w-full flex flex-col items-center gap-1 px-2 py-2.5 text-gray-300 hover:bg-gray-800 rounded-md ${
                isActive('/team') ? 'bg-gray-800' : ''
              }`}
            >
              <Users size={16} />
              <span className="text-[10px]">Team</span>
            </button>
            <button
              onClick={() => navigate('/route-manager/routes')}
              className={`w-full flex flex-col items-center gap-1 px-2 py-2.5 text-gray-300 hover:bg-gray-800 rounded-md ${
                isActive('/routes') ? 'bg-gray-800' : ''
              }`}
            >
              <MapPin size={16} />
              <span className="text-[10px]">Routes</span>
            </button>
            <button
              onClick={() => navigate('/route-manager/bookings')}
              className={`w-full flex flex-col items-center gap-1 px-2 py-2.5 text-gray-300 hover:bg-gray-800 rounded-md ${
                isActive('/bookings') ? 'bg-gray-800' : ''
              }`}
            >
              <ClipboardList size={16} />
              <span className="text-[10px]">Bookings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-20">
        <header className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.svg" alt="" className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Route Manager Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  {routeManager?.name || 'Loading...'}
                </p>
              </div>
            </button>

            {loading ? (
              <div className="flex items-center gap-4">
                <Loader className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-8 px-4 py-1.5 bg-gray-800 rounded-md">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Steps</p>
                  <p className="text-sm font-medium text-white">
                    {teamStats.totalSteps}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Avg Price</p>
                  <p className="text-sm font-medium text-white">
                    ${teamStats.averagePrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Gross Sales</p>
                  <p className="text-sm font-medium text-white">
                    ${teamStats.totalGross.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
