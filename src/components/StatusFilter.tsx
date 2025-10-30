import React from 'react';
import { useJobs } from '../contexts/JobContext';

const StatusFilter: React.FC = () => {
  const { filter, setFilter } = useJobs();
  
  const handleStatusChange = (status: 'pending' | 'completed' | 'canceled' | undefined) => {
    setFilter({ ...filter, status });
  };
  
  return (
    <div className="flex bg-white rounded-lg shadow-sm overflow-hidden mb-4">
      <button
        onClick={() => handleStatusChange(undefined)}
        className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
          filter.status === undefined 
            ? 'bg-cps-blue text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        All
      </button>
      <button
        onClick={() => handleStatusChange('pending')}
        className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
          filter.status === 'pending' 
            ? 'bg-cps-yellow text-yellow-900' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Pending
      </button>
      <button
        onClick={() => handleStatusChange('completed')}
        className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
          filter.status === 'completed' 
            ? 'bg-cps-green text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Completed
      </button>
      <button
        onClick={() => handleStatusChange('canceled')}
        className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
          filter.status === 'canceled' 
            ? 'bg-cps-red text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Canceled
      </button>
    </div>
  );
};

export default StatusFilter;