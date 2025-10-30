// src/pages/HomePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  LayoutDashboard,
  Database,
  Shield,
  RotateCcw,
} from 'lucide-react';
// Corrected import paths
import { STORAGE_KEYS, removeStorageItem } from '../lib/localStorage';
import { ensureEastTerritoryStructureFetched } from '../lib/dataSyncService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showResetOptions, setShowResetOptions] = useState(false);
  const [resetting, setResetting] = useState(false); // State for reset loading indicator

  const handleReset = async (type: 'full' | 'excludePanel') => {
    // <<< MADE ASYNC
    if (
      !window.confirm(
        `Are you sure you want to perform a "${type}" reset? This will clear local data and reload the app.`
      )
    ) {
      return;
    }

    setResetting(true); // Start loading indicator

    // Keys related to Business Panel config and structure cache
    const keysToExcludeOnPartialReset = [
      STORAGE_KEYS.BUSINESS_USER,
      STORAGE_KEYS.CONSOLE_PROFILES,
      STORAGE_KEYS.ROUTE_MANAGER_PROFILES,
      STORAGE_KEYS.UPSELL_MENUS, // Assuming these contain config
      STORAGE_KEYS.SERVICES, // Assuming these contain config
      STORAGE_KEYS.TERRITORY_ASSIGNMENTS, // Keep assignments on partial reset
      STORAGE_KEYS.EAST_TERRITORY_STRUCTURE, // Keep cached structure on partial reset
    ];

    // All known static keys from STORAGE_KEYS
    const allKnownStaticKeys = Object.values(STORAGE_KEYS);

    const keysToRemove: string[] = [];

    // Iterate through all keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        let shouldRemove = false;

        // Check if it's a known static key
        if (allKnownStaticKeys.includes(key as any)) {
          // Cast needed
          shouldRemove = true;
        }
        // Check if it's a known dynamic/archived key pattern
        else if (
          key.startsWith('routeAssignments_') ||
          key.startsWith('mapAssignments_') ||
          key.startsWith('attendanceFinalized_') ||
          key.startsWith('payout_logic_settings') // Include payout settings pattern
        ) {
          shouldRemove = true;
        }
        // Check for other known singleton keys
        else if (['lastSynced', 'cps_settings'].includes(key)) {
          shouldRemove = true;
        }

        if (shouldRemove) {
          // If doing a partial reset, check if the key should be excluded
          if (
            type === 'excludePanel' &&
            keysToExcludeOnPartialReset.includes(key as any)
          ) {
            // Do not remove these keys on a partial reset
          } else {
            keysToRemove.push(key);
          }
        }
        // Optionally, remove unknown keys (be cautious with this)
        // else {
        //   console.log(`Found potentially unknown key during reset: "${key}". Leaving it untouched.`);
        // }
      }
    }

    console.log(`Resetting session (${type}), removing keys:`, keysToRemove);
    keysToRemove.forEach((key) => {
      // Use removeStorageItem to ensure consistency if it adds extra logic later
      removeStorageItem(key);
      // localStorage.removeItem(key); // Direct removal also works
    });

    // <<< RE-FETCH TERRITORY STRUCTURE AFTER FULL RESET >>>
    if (type === 'full') {
      try {
        console.log(
          'Performing full reset, forcing territory structure re-fetch...'
        );
        // Force re-fetch by passing true
        await ensureEastTerritoryStructureFetched(true);
        console.log('Territory structure re-fetched successfully.');
      } catch (e) {
        console.error(
          'Failed to re-fetch territory structure after full reset:',
          e
        );
        // Alert the user, but still proceed with reload
        alert(
          `Warning: Failed to refresh territory data after reset. Error: ${
            e instanceof Error ? e.message : 'Unknown error'
          }`
        );
      }
    }

    // Short delay before reloading to allow state update and potential UI feedback
    setTimeout(() => {
      window.location.reload();
    }, 500); // 500ms delay
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Reset Options Modal */}
      {showResetOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-auto border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Reset Session
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Choose the reset type:
              <ul className="list-disc list-inside mt-2 text-xs">
                <li>
                  <strong className="text-gray-300">Full Reset:</strong> Clears
                  ALL application data including login sessions, bookings,
                  settings, and cached territory info. Use if experiencing major
                  issues.
                </li>
                <li>
                  <strong className="text-gray-300">App Data Only:</strong>{' '}
                  Clears daily operational data (logins, assignments, daily
                  worker status) but keeps Business Panel configurations and
                  cached territory info. Use for minor glitches.
                </li>
              </ul>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleReset('full')}
                disabled={resetting}
                className="w-full py-3 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {resetting ? 'Resetting...' : 'Full Reset (Clear All)'}
              </button>
              <button
                onClick={() => handleReset('excludePanel')}
                disabled={resetting}
                className="w-full py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {resetting ? 'Resetting...' : 'Reset App Data Only'}
              </button>
              <button
                onClick={() => setShowResetOptions(false)}
                disabled={resetting}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <img
            src="/logo.svg"
            alt="Canadian Property Stars"
            className="h-24 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-cps-red mb-2">
            Canadian Property Stars
          </h1>
          <p className="text-gray-400">Digital Management System</p>
        </div>

        {/* Navigation Grid */}
        <div className="grid md:grid-cols-4 gap-6 px-4">
          {/* Digital Logsheet Card */}
          <button
            onClick={() => navigate('/logsheet')}
            className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-6 text-left group relative overflow-hidden border border-gray-700/50"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-8 h-8 text-cps-red" />
                <h2 className="text-xl font-semibold text-white">
                  Digital Logsheet
                </h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Manage your daily jobs, track payments, and process completed
                work efficiently.
              </p>
              <span className="text-sm text-cps-red font-medium group-hover:underline">
                Enter App →
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Route Manager Card */}
          <button
            onClick={() => navigate('/route-manager')}
            className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-6 text-left group relative overflow-hidden border border-gray-700/50"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <LayoutDashboard className="w-8 h-8 text-cps-blue" />
                <h2 className="text-xl font-semibold text-white">
                  Route Manager
                </h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                View and manage route assignments, track team performance, and
                optimize service delivery.
              </p>
              <span className="text-sm text-cps-blue font-medium group-hover:underline">
                Enter App →
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Admin Console Card */}
          <button
            onClick={() => navigate('/console')}
            className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-6 text-left group relative overflow-hidden border border-gray-700/50"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-cps-green" />
                <h2 className="text-xl font-semibold text-white">
                  Admin Console
                </h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Access and manage workerbook data and master bookings in one
                centralized location.
              </p>
              <span className="text-sm text-cps-green font-medium group-hover:underline">
                Enter App →
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Business Panel Card */}
          <button
            onClick={() => navigate('/business-panel')}
            className="bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-6 text-left group relative overflow-hidden border border-gray-700/50"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-cps-yellow" />
                <h2 className="text-xl font-semibold text-white">
                  Business Panel
                </h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Manage administrative users and system-wide settings for the
                entire application.
              </p>
              <span className="text-sm text-cps-yellow font-medium group-hover:underline">
                Enter App →
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Reset Button */}
        <div className="mt-8 text-center flex justify-center gap-4">
          <button
            onClick={() => setShowResetOptions(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors text-sm border border-gray-700/50"
            title="Clear local application data and refresh"
          >
            <RotateCcw size={14} />
            <span>Reset Session</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Canadian Property Stars. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
