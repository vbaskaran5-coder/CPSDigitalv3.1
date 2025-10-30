// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getCurrentDate } from './lib/date';

// Core Layouts & Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import ContractDetail from './pages/ContractDetail';
import NewJob from './pages/NewJob';
import NotFound from './pages/NotFound';
import SignIn from './pages/SignIn';
import HomePage from './pages/HomePage';

// Route Manager Section
import RouteManagerLayout from './pages/RouteManager/Layout';
import RouteManagerLoginPage from './pages/RouteManager/LoginPage';
import RouteManagerRoutes from './pages/RouteManager/Routes';
import Team from './pages/RouteManager/Team';
import Bookings from './pages/RouteManager/Bookings'; // Route Manager Bookings view

// Admin Console Section
import ConsoleLayout from './pages/Console/Layout';
import ConsoleLoginPage from './pages/Console/LoginPage';
import Workerbook from './pages/Console/Workerbook';
import WorkerbookNextDay from './pages/Console/WorkerbookNextDay';
import WorkerbookCalendar from './pages/Console/WorkerbookCalendar';
import WorkerbookDay from './pages/Console/WorkerbookDay';
import WorkerbookNoShows from './pages/Console/WorkerbookNoShows';
import WorkerbookWdrTnb from './pages/Console/WorkerbookWdrTnb';
import WorkerbookNotBooked from './pages/Console/WorkerbookNotBooked';
import WorkerbookQuitFired from './pages/Console/WorkerbookQuitFired';
import ContDetail from './pages/Console/ContDetail';
import MasterBookings from './pages/Console/MasterBookings'; // Renamed/Consolidated view
import BookingsDetails from './pages/Console/BookingsDetails';
import CompletedBookings from './pages/Console/CompletedBookings';
import MoveWorkersPage from './pages/Console/MoveWorkersPage';
import PayoutContractor from './pages/Console/PayoutContractor';
import PayoutSummary from './pages/Console/PayoutSummary'; // Console Payout Summary
import PayoutLogic from './pages/Console/PayoutLogic';
import PayoutToday from './pages/Console/PayoutToday'; // Component used within Workerbook

// Business Panel Section
import BusinessPanelLayout from './pages/BusinessPanel/BusinessPanelLayout';
import BusinessPanelLoginPage from './pages/BusinessPanel/BusinessPanelLogin';
// Removed BusinessPanelDashboard import as it wasn't used for routing
import ConsoleProfiles from './pages/BusinessPanel/ConsoleProfiles';
import ConsoleProfileDetail from './pages/BusinessPanel/ConsoleProfileDetail';
import EditSeason from './pages/BusinessPanel/EditSeason';
import RouteManagerProfiles from './pages/BusinessPanel/RouteManagerProfiles';
import BookingManagement from './pages/BusinessPanel/BookingManagement';
import TerritoryManagement from './pages/BusinessPanel/TerritoryManagement';
// Removed AddUpsell, UpsellMenuPage imports as they might not be directly routed or handled differently

// Migration Tool
import MigrationRunner from './pages/MigrationRunner';

import { Worker } from './types';

// --- Private Route Components ---
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { AuthService } = await import('./services/auth.service');
      const session = await AuthService.getSession();
      setIsAuthenticated(
        session?.userType === 'contractor' || session?.userType === 'cart_worker'
      );
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-cps-red">Loading...</div>
    </div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/logsheet/signin" replace />;
};

const RouteManagerPrivateRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { AuthService } = await import('./services/auth.service');
      const session = await AuthService.getSession();
      setIsAuthenticated(session?.userType === 'route_manager');
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-cps-blue">Loading...</div>
    </div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/route-manager/login" replace />;
};

const ConsolePrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { AuthService } = await import('./services/auth.service');
      const session = await AuthService.getSession();
      setIsAuthenticated(session?.userType === 'console');
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-cps-yellow">Loading...</div>
    </div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/console/login" replace />;
};

const BusinessPanelPrivateRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { AuthService } = await import('./services/auth.service');
      const session = await AuthService.getSession();
      setIsAuthenticated(session?.userType === 'business_panel');
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-cps-yellow">Loading...</div>
    </div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/business-panel/login" replace />;
};

// --- App Component ---
function App() {
  // Daily reset logic effect - now using Supabase
  useEffect(() => {
    const performDailyReset = async () => {
      const todayStr = format(getCurrentDate(), 'yyyy-MM-dd');

      const { AppStateService, RouteAssignmentService, MapAssignmentService, DailyArchiveService } = await import('./services/assignment.service');
      const { WorkerService } = await import('./services/database.service');

      const lastAppDate = await AppStateService.getLastAppDate();

      if (lastAppDate && lastAppDate !== todayStr) {
        console.log(
          `New day detected (${todayStr}). Resetting daily assignments and statuses from ${lastAppDate}.`
        );

        const yesterdayStr = lastAppDate;

        try {
          // Archive previous day's route assignments
          const routeAssignments = await RouteAssignmentService.getByDate(yesterdayStr);
          if (routeAssignments && Object.keys(routeAssignments).length > 0) {
            await DailyArchiveService.createArchive({
              archive_date: yesterdayStr,
              archive_type: 'route_assignments',
              data: routeAssignments,
            });
            console.log('Route assignments archived for', yesterdayStr);
          }
          await RouteAssignmentService.clearAssignmentsForDate(yesterdayStr);

          // Archive previous day's map assignments
          const mapAssignments = await MapAssignmentService.getByDate(yesterdayStr);
          if (mapAssignments && Object.keys(mapAssignments).length > 0) {
            await DailyArchiveService.createArchive({
              archive_date: yesterdayStr,
              archive_type: 'map_assignments',
              data: mapAssignments,
            });
            console.log('Map assignments archived for', yesterdayStr);
          }
          await MapAssignmentService.clearAssignmentsForDate(yesterdayStr);

          // Reset worker statuses for the new day
          const workers = await WorkerService.getAll();
          if (workers.length > 0) {
            for (const worker of workers) {
              // Keep workers who are Quit/Fired or WDR/TNB as they are
              if (
                worker.bookingStatus === 'quit_fired' ||
                worker.bookingStatus === 'wdr_tnb'
              ) {
                continue;
              }

              const updates: Partial<Worker> = {};

              // Clear daily status fields
              updates.showed = undefined;
              updates.showedDate = undefined;
              updates.confirmationStatus = undefined;
              updates.routeManager = undefined;
              updates.cartId = undefined;

              // Update booking status based on previous day
              if (worker.bookingStatus === 'next_day') {
                updates.bookingStatus = 'today';
                updates.bookedDate = todayStr;
              } else if (
                worker.bookingStatus === 'calendar' &&
                worker.bookedDate === todayStr
              ) {
                updates.bookingStatus = 'today';
              } else if (worker.bookingStatus === 'today') {
                updates.bookingStatus = undefined;
                updates.bookedDate = undefined;
              } else if (worker.bookingStatus === 'no_show') {
                updates.bookingStatus = undefined;
                updates.bookedDate = undefined;
              }

              if (Object.keys(updates).length > 0) {
                await WorkerService.update(worker.contractorId, updates);
              }
            }
            console.log('Worker daily statuses reset.');
          }
        } catch (error) {
          console.error('Error during daily reset:', error);
        }
      }

      // Update the last date the app was opened
      await AppStateService.setLastAppDate(todayStr);
    };

    performDailyReset();
  }, []); // Run only once on initial mount

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* --- Migration Tool Route --- */}
      <Route path="/migrate" element={<MigrationRunner />} />
      {/* --- Business Panel Routes --- */}
      <Route
        path="/business-panel/login"
        element={<BusinessPanelLoginPage />}
      />
      <Route
        path="/business-panel"
        element={
          <BusinessPanelPrivateRoute>
            {' '}
            <BusinessPanelLayout />{' '}
          </BusinessPanelPrivateRoute>
        }
      >
        <Route
          index
          element={<Navigate to="console-profiles" replace />}
        />{' '}
        {/* Default to console profiles */}
        {/* <Route path="dashboard" element={<BusinessPanelDashboard />} /> {/* Keep if needed */}
        <Route path="console-profiles" element={<ConsoleProfiles />} />
        <Route
          path="console-profiles/:profileId"
          element={<ConsoleProfileDetail />}
        />
        <Route
          path="console-profiles/:profileId/edit-season/:seasonHardcodedId"
          element={<EditSeason />}
        />
        <Route
          path="route-manager-profiles"
          element={<RouteManagerProfiles />}
        />
        <Route path="booking-management" element={<BookingManagement />} />
        <Route path="territory-management" element={<TerritoryManagement />} />
        {/* Add other Business Panel routes here */}
      </Route>
      {/* --- Route Manager Routes --- */}
      <Route path="/route-manager/login" element={<RouteManagerLoginPage />} />
      <Route
        path="/route-manager"
        element={
          <RouteManagerPrivateRoute>
            {' '}
            <RouteManagerLayout />{' '}
          </RouteManagerPrivateRoute>
        }
      >
        <Route index element={<Navigate to="team" replace />} />{' '}
        {/* Default to team view */}
        <Route path="team" element={<Team />} />
        <Route path="routes" element={<RouteManagerRoutes />} />
        <Route path="bookings" element={<Bookings />} />{' '}
        {/* RM view of bookings */}
      </Route>
      {/* --- Digital Logsheet Routes --- */}
      <Route path="/logsheet/signin" element={<SignIn />} />
      <Route
        path="/logsheet"
        element={
          <PrivateRoute>
            {' '}
            <Layout />{' '}
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="jobs/:jobId" element={<JobDetail />} />{' '}
        {/* Route for regular jobs */}
        <Route path="contracts/:jobId" element={<ContractDetail />} />{' '}
        {/* Route for contracts */}
        <Route path="new-job" element={<NewJob />} />
        {/* Payout routes might belong here if contractors submit their own */}
        {/* <Route path="payout" element={<Payout />} /> */}
        {/* <Route path="payout/summary" element={<PayoutSummary />} /> */}
        <Route path="*" element={<NotFound />} /> {/* Logsheet specific 404 */}
      </Route>
      {/* --- Admin Console Routes --- */}
      <Route path="/console/login" element={<ConsoleLoginPage />} />
      <Route
        path="/console"
        element={
          <ConsolePrivateRoute>
            {' '}
            <ConsoleLayout />{' '}
          </ConsolePrivateRoute>
        }
      >
        {/* Workerbook */}
        <Route index element={<Navigate to="workerbook" replace />} />{' '}
        {/* Default to workerbook */}
        <Route path="workerbook" element={<Workerbook />} />{' '}
        {/* Today's view, includes PayoutToday conditionally */}
        <Route path="workerbook/next-day" element={<WorkerbookNextDay />} />
        <Route path="workerbook/calendar" element={<WorkerbookCalendar />} />
        <Route path="workerbook/day/:date" element={<WorkerbookDay />} />{' '}
        {/* Specific past/future day view */}
        <Route path="workerbook/no-shows" element={<WorkerbookNoShows />} />
        <Route path="workerbook/wdr-tnb" element={<WorkerbookWdrTnb />} />
        <Route path="workerbook/not-booked" element={<WorkerbookNotBooked />} />
        <Route path="workerbook/move-workers" element={<MoveWorkersPage />} />
        <Route path="workerbook/quit-fired" element={<WorkerbookQuitFired />} />
        <Route
          path="workerbook/contdetail/:workerId"
          element={<ContDetail />}
        />{' '}
        {/* Worker details */}
        {/* Bookings */}
        <Route
          path="bookings"
          element={<Navigate to="prebooks" replace />}
        />{' '}
        {/* Default bookings to MasterBookings */}
        <Route path="bookings/prebooks" element={<MasterBookings />} />{' '}
        {/* Main view for all DBs, includes Maps */}
        <Route
          path="bookings/prebooks/:bookingId"
          element={<BookingsDetails />}
        />{' '}
        {/* Detail/Edit view */}
        <Route path="bookings/completed" element={<CompletedBookings />} />
        {/* Payout (Admin processing) */}
        <Route
          path="payout"
          element={<Navigate to="/console/workerbook" replace />}
        />{' '}
        {/* Redirect base payout to workerbook */}
        <Route
          path="payout/contractor/:contractorId"
          element={<PayoutContractor />}
        />{' '}
        {/* Payout form for individual */}
        <Route path="payout/cart/:cartId" element={<PayoutContractor />} />{' '}
        {/* Payout form for team via cart */}
        <Route
          path="payout/summary/:payoutId"
          element={<PayoutSummary />}
        />{' '}
        {/* Generic summary display - needs adjustment? Or use worker/cart ID? */}
        {/* Settings */}
        <Route
          path="settings"
          element={<Navigate to="payout-logic" replace />}
        />
        <Route path="settings/payout-logic" element={<PayoutLogic />} />
        {/* Add other console settings routes */}
      </Route>
      {/* --- Catch-all Fallback --- */}
      <Route path="*" element={<Navigate to="/" replace />} />{' '}
      {/* Redirect unknown paths to home */}
    </Routes>
  );
}

export default App;
