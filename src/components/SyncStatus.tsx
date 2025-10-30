import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { useJobs } from '../contexts/JobContext';
import { supabase } from '../lib/supabase';

const SyncStatus: React.FC = () => {
  const { syncJobs, loading, error } = useJobs();
  const [showStatus, setShowStatus] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('master_bookings').select('count', { count: 'exact', head: true });
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showStatus) {
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showStatus]);

  return (
    <>
      {showStatus && (
        <div className="fixed bottom-24 left-0 right-0 mx-auto w-5/6 max-w-sm bg-white rounded-lg shadow-lg p-4 z-20 flex items-center animate-fade-in">
          {error ? (
            <AlertTriangle size={20} className="text-cps-red mr-2" />
          ) : (
            <CheckCircle size={20} className="text-cps-green mr-2" />
          )}
          <div className="flex-1">
            <p className="font-medium">{syncMessage}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Database size={12} />
              <span>{isConnected ? 'Connected to Supabase' : 'Connection issues'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SyncStatus;
