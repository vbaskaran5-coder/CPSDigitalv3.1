import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  Bell,
  Moon,
  LayoutGrid,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { AppSettings } from '../types';
import { AuthService } from '../services/auth.service';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    syncFrequency: 30,
    notificationsEnabled: true,
    darkMode: false,
    defaultView: 'list',
  });
  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('master_bookings').select('count', { count: 'exact', head: true });
      setConnectionStatus(error ? 'disconnected' : 'connected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

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
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await AuthService.logout();
      window.location.href = '/';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-4">
          <h2 className="text-xl font-bold mb-4">Settings</h2>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <Database size={18} className="mr-2" /> Database Connection
            </h3>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm">
                {connectionStatus === 'connected' ? 'Connected to Supabase' :
                 connectionStatus === 'disconnected' ? 'Connection issues' : 'Checking connection...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              All data is automatically synced with the cloud database in real-time.
            </p>
          </div>

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
                disabled
              >
                <option value="0">Real-time (Supabase)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Data syncs automatically using Supabase real-time subscriptions.
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
                  disabled
                />
                <span>Dark Mode (Coming soon)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Use dark theme for the app.
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
              <AlertTriangle size={18} className="mr-2 text-cps-red" /> Account
            </h3>

            <div className="mb-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="bg-cps-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Sign out of your account and return to the login screen.
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
        <p>Digital Logsheet v2.0.0 (Supabase)</p>
        <p>© 2025 Canadian Property Stars</p>
      </div>
    </div>
  );
};

export default Settings;
