import React, { useState } from 'react';
import {
  Save,
  RefreshCw,
  Bell,
  Moon,
  LayoutGrid,
  AlertTriangle,
} from 'lucide-react';
import { AppSettings } from '../types';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '../lib/localStorage';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    return getStorageItem('cps_settings', {
      syncFrequency: 30,
      notificationsEnabled: true,
      darkMode: false,
      defaultView: 'list',
    });
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStorageItem('cps_settings', settings);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all local data? This will remove all jobs and settings.'
      )
    ) {
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      localStorage.removeItem('cps_settings');
      localStorage.removeItem('lastSynced');
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-4">
          <h2 className="text-xl font-bold mb-4">Settings</h2>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <RefreshCw size={18} className="mr-2" /> Synchronization
            </h3>

            <div className="mb-4">
              <label htmlFor="syncFrequency" className="label">
                Auto-sync Frequency (minutes)
              </label>
              <select
                id="syncFrequency"
                name="syncFrequency"
                value={settings.syncFrequency}
                onChange={handleChange}
                className="input"
              >
                <option value="0">Never (Manual only)</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
                <option value="120">Every 2 hours</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How often the app should automatically sync with the central
                database.
              </p>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <Bell size={18} className="mr-2" /> Notifications
            </h3>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                <span>Enable Notifications</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Receive notifications for new jobs and updates.
              </p>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <Moon size={18} className="mr-2" /> Appearance
            </h3>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="darkMode"
                  checked={settings.darkMode}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                <span>Dark Mode</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Use dark theme for the app (Coming soon).
              </p>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <LayoutGrid size={18} className="mr-2" /> Display
            </h3>

            <div className="mb-4">
              <label htmlFor="defaultView" className="label">
                Default View
              </label>
              <select
                id="defaultView"
                name="defaultView"
                value={settings.defaultView}
                onChange={handleChange}
                className="input"
              >
                <option value="list">List View</option>
                <option value="map">Map View (Coming soon)</option>
              </select>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <AlertTriangle size={18} className="mr-2 text-cps-red" /> Danger
              Zone
            </h3>

            <div className="mb-4">
              <button
                type="button"
                onClick={clearAllData}
                className="bg-cps-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Local Data
              </button>
              <p className="text-xs text-gray-500 mt-1">
                This will remove all locally stored jobs and settings.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button type="submit" className="btn btn-primary flex items-center">
              <Save size={16} className="mr-2" /> Save Settings
            </button>

            {saved && (
              <span className="text-cps-green text-sm font-medium">
                Settings saved!
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Digital Logsheet v0.1.0</p>
        <p>© 2025 Canadian Property Stars</p>
      </div>
    </div>
  );
};

export default Settings;
