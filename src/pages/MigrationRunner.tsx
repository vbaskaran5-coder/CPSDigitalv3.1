import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { migrateLocalStorageToSupabase } from '../utils/migrateToSupabase';

const MigrationRunner: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setStatus('running');
    setError(null);
    setResult(null);

    try {
      const migrationResult = await migrateLocalStorageToSupabase();
      setResult(migrationResult);

      if (migrationResult.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError('Migration completed with errors. Check console for details.');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Migration failed');
      console.error('Migration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cps-green mb-4">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cps-green mb-2">
            Supabase Migration Tool
          </h1>
          <p className="text-gray-400">
            Migrate data from localStorage to Supabase database
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Migration Status</h2>
            <p className="text-gray-400 text-sm">
              This tool will migrate console profiles, route managers, workers, and territory assignments
              from localStorage to your Supabase database.
            </p>
          </div>

          {status === 'idle' && (
            <button
              onClick={runMigration}
              className="w-full bg-cps-green text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-cps-green transition-colors font-semibold"
            >
              Start Migration
            </button>
          )}

          {status === 'running' && (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 text-cps-green animate-spin mr-3" />
              <span className="text-white text-lg">Migrating data...</span>
            </div>
          )}

          {status === 'success' && result && (
            <div className="space-y-4">
              <div className="flex items-center text-cps-green mb-4">
                <CheckCircle className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">Migration Completed Successfully!</span>
              </div>

              <div className="bg-gray-900 rounded-md p-4 space-y-2">
                <h3 className="text-white font-semibold mb-3">Migration Summary:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-400">Console Profiles:</div>
                  <div className="text-white font-medium">{result.migrated.consoleProfiles}</div>

                  <div className="text-gray-400">Route Managers:</div>
                  <div className="text-white font-medium">{result.migrated.routeManagers}</div>

                  <div className="text-gray-400">Workers:</div>
                  <div className="text-white font-medium">{result.migrated.workers}</div>

                  <div className="text-gray-400">Territory Assignments:</div>
                  <div className="text-white font-medium">{result.migrated.territoryAssignments}</div>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/console/login'}
                className="w-full bg-cps-green text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-cps-green transition-colors mt-4"
              >
                Go to Console Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center text-red-500 mb-4">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">Migration Failed</span>
              </div>

              {error && (
                <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-md p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {result && result.errors && result.errors.length > 0 && (
                <div className="bg-gray-900 rounded-md p-4">
                  <h3 className="text-white font-semibold mb-2">Errors:</h3>
                  <ul className="list-disc list-inside text-red-400 text-sm space-y-1">
                    {result.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Ensure your .env file contains the correct Supabase credentials before running migration
          </p>
        </div>
      </div>
    </div>
  );
};

export default MigrationRunner;
