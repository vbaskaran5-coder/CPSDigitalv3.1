import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getCurrentDate } from './lib/date';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import NewJob from './pages/NewJob';
import NotFound from './pages/NotFound';
import SignIn from './pages/SignIn';
import HomePage from './pages/HomePage';
import RouteManagerLayout from './pages/RouteManager/Layout';
import RouteManagerLoginPage from './pages/RouteManager/LoginPage';
import RouteManagerRoutes from './pages/RouteManager/Routes';
import Team from './pages/RouteManager/Team';
import Bookings from './pages/RouteManager/Bookings';
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
import ShowDetail from './pages/Console/ShowDetail';
import MasterMaps from './pages/Console/MasterMaps';
import PreBooks from './pages/Console/PreBooks';
import BookingsDetails from './pages/Console/BookingsDetails';
import MoveWorkersPage from './pages/Console/MoveWorkersPage';
import BookingsImport from './pages/Console/BookingsImport';
import PayoutContractor from './pages/Console/PayoutContractor';
import PayoutSummary from './pages/Console/PayoutSummary';
import PayoutLogic from './pages/Console/PayoutLogic';
import BusinessPanelLayout from './pages/BusinessPanel/BusinessPanelLayout';
import BusinessPanelLoginPage from './pages/BusinessPanel/BusinessPanelLogin';
import BusinessPanelDashboard from './pages/BusinessPanel/Dashboard';
import ConsoleProfiles from './pages/BusinessPanel/ConsoleProfiles';
import ConsoleProfileDetail from './pages/BusinessPanel/ConsoleProfileDetail';
import RouteManagerProfiles from './pages/BusinessPanel/RouteManagerProfiles';
import UpsellMenuPage from './pages/BusinessPanel/UpsellMenuPage';
import AddUpsell from './pages/BusinessPanel/AddUpsell';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from './lib/localStorage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const contractor = getStorageItem(STORAGE_KEYS.CONTRACTOR, null);
  return contractor ? <>{children}</> : <Navigate to="/logsheet/signin" />;
};

const RouteManagerPrivateRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const routeManager = getStorageItem(STORAGE_KEYS.ROUTE_MANAGER, null);
  return routeManager ? (
    <>{children}</>
  ) : (
    <Navigate to="/route-manager/login" />
  );
};

const ConsolePrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const admin = getStorageItem(STORAGE_KEYS.ADMIN, null);
  return admin ? <>{children}</> : <Navigate to="/console/login" />;
};

const BusinessPanelPrivateRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const businessUser = getStorageItem(STORAGE_KEYS.BUSINESS_USER, null);
  return businessUser ? (
    <>{children}</>
  ) : (
    <Navigate to="/business-panel/login" />
  );
};

function App() {
  useEffect(() => {
    const todayStr = format(getCurrentDate(), 'yyyy-MM-dd');
    const lastAppDate = getStorageItem(STORAGE_KEYS.LAST_APP_DATE, null);

    if (lastAppDate && lastAppDate !== todayStr) {
      console.log(
        'New day detected. Resetting daily assignments and statuses.'
      );

      const yesterdayStr = lastAppDate;

      // Archive previous day's assignments
      const routeAssignments = getStorageItem(
        STORAGE_KEYS.ROUTE_ASSIGNMENTS,
        null
      );
      if (routeAssignments && yesterdayStr) {
        setStorageItem(`routeAssignments_${yesterdayStr}`, routeAssignments);
      }
      localStorage.removeItem(STORAGE_KEYS.ROUTE_ASSIGNMENTS);

      const mapAssignments = getStorageItem(STORAGE_KEYS.MAP_ASSIGNMENTS, null);
      if (mapAssignments && yesterdayStr) {
        setStorageItem(`mapAssignments_${yesterdayStr}`, mapAssignments);
      }
      localStorage.removeItem(STORAGE_KEYS.MAP_ASSIGNMENTS);

      const attendanceFinalized = getStorageItem(
        STORAGE_KEYS.ATTENDANCE_FINALIZED,
        null
      );
      if (attendanceFinalized && yesterdayStr) {
        setStorageItem(
          `attendanceFinalized_${yesterdayStr}`,
          attendanceFinalized
        );
      }
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE_FINALIZED);

      // Reset worker statuses for the new day
      const workers = getStorageItem(STORAGE_KEYS.CONSOLE_WORKERS, []);
      if (workers.length > 0) {
        const resetWorkers = workers.map((w: any) => {
          if (
            w.bookingStatus === 'quit_fired' ||
            w.bookingStatus === 'wdr_tnb'
          ) {
            return w;
          }

          const newWorker = { ...w };

          delete newWorker.showed;
          delete newWorker.showedDate;
          delete newWorker.confirmationStatus;
          delete newWorker.routeManager;

          if (newWorker.bookingStatus === 'next_day') {
            newWorker.bookingStatus = 'today';
            newWorker.bookedDate = todayStr;
          } else if (
            newWorker.bookingStatus === 'calendar' &&
            newWorker.bookedDate === todayStr
          ) {
            newWorker.bookingStatus = 'today';
          } else if (newWorker.bookingStatus === 'today') {
            delete newWorker.bookingStatus;
            delete newWorker.bookedDate;
          }

          return newWorker;
        });
        setStorageItem(STORAGE_KEYS.CONSOLE_WORKERS, resetWorkers);
      }
    }
    setStorageItem(STORAGE_KEYS.LAST_APP_DATE, todayStr);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Business Panel Routes */}
      <Route
        path="/business-panel/login"
        element={<BusinessPanelLoginPage />}
      />
      <Route
        path="/business-panel"
        element={
          <BusinessPanelPrivateRoute>
            <BusinessPanelLayout />
          </BusinessPanelPrivateRoute>
        }
      >
        <Route index element={<Navigate to="/business-panel/dashboard" />} />
        <Route path="dashboard" element={<BusinessPanelDashboard />} />
        <Route path="console-profiles" element={<ConsoleProfiles />} />
        <Route
          path="console-profiles/:profileId"
          element={<ConsoleProfileDetail />}
        />
        <Route
          path="route-manager-profiles"
          element={<RouteManagerProfiles />}
        />
        <Route path="upsell-menu" element={<UpsellMenuPage />} />
        <Route path="upsell-menu/add" element={<AddUpsell />} />
      </Route>

      {/* Route Manager Routes */}
      <Route path="/route-manager/login" element={<RouteManagerLoginPage />} />
      <Route
        path="/route-manager"
        element={
          <RouteManagerPrivateRoute>
            <RouteManagerLayout />
          </RouteManagerPrivateRoute>
        }
      >
        <Route index element={<Navigate to="/route-manager/team" />} />
        <Route path="team" element={<Team />} />
        <Route path="routes" element={<RouteManagerRoutes />} />
        <Route path="bookings" element={<Bookings />} />
      </Route>

      {/* Digital Logsheet Routes */}
      <Route path="/logsheet/signin" element={<SignIn />} />

      <Route
        path="/logsheet"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="jobs/:jobId" element={<JobDetail />} />
        <Route path="new-job" element={<NewJob />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Console Routes */}
      <Route path="/console/login" element={<ConsoleLoginPage />} />
      <Route
        path="/console"
        element={
          <ConsolePrivateRoute>
            <ConsoleLayout />
          </ConsolePrivateRoute>
        }
      >
        <Route index element={<Navigate to="/console/workerbook" />} />
        <Route path="workerbook" element={<Workerbook />} />
        <Route path="workerbook/next-day" element={<WorkerbookNextDay />} />
        <Route path="workerbook/calendar" element={<WorkerbookCalendar />} />
        <Route path="workerbook/day/:date" element={<WorkerbookDay />} />
        <Route path="workerbook/no-shows" element={<WorkerbookNoShows />} />
        <Route path="workerbook/wdr-tnb" element={<WorkerbookWdrTnb />} />
        <Route path="workerbook/not-booked" element={<WorkerbookNotBooked />} />
        <Route path="workerbook/move-workers" element={<MoveWorkersPage />} />
        <Route path="workerbook/quit-fired" element={<WorkerbookQuitFired />} />
        <Route
          path="workerbook/contdetail/:workerId"
          element={<ContDetail />}
        />
        <Route
          path="workerbook/showdetail/:workerId"
          element={<ShowDetail />}
        />
        <Route path="bookings/maps" element={<MasterMaps />} />
        <Route path="bookings/prebooks" element={<PreBooks />} />
        <Route
          path="bookings/prebooks/:bookingId"
          element={<BookingsDetails />}
        />
        <Route path="bookings/import" element={<BookingsImport />} />

        <Route path="payout" element={<Navigate to="/console/workerbook" />} />
        <Route
          path="payout/contractor/:contractorId"
          element={<PayoutContractor />}
        />
        <Route
          path="payout/summary/:contractorId"
          element={<PayoutSummary />}
        />
        <Route
          path="settings"
          element={<Navigate to="/console/settings/payout-logic" />}
        />
        <Route path="settings/payout-logic" element={<PayoutLogic />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
