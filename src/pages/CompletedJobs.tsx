import React, { useEffect } from 'react';
import { useJobs } from '../contexts/JobContext';
import JobCard from '../components/JobCard';
import DateFilter from '../components/DateFilter';
import { format } from 'date-fns';
import { Loader, AlertCircle } from 'lucide-react';

const CompletedJobs: React.FC = () => {
  const { filteredJobs, loading, error, filter, setFilter } = useJobs();
  
  // Set default filter to show today's completed jobs
  useEffect(() => {
    if (!filter.status) {
      setFilter({
        ...filter,
        status: 'completed'
      });
    }
  }, [filter, setFilter]);
  
  return (
    <div>
      <DateFilter />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <Loader size={40} className="text-cps-green animate-spin mb-4" />
          <p className="text-gray-600">Loading completed jobs...</p>
        </div>
      ) : error ? (
        <div className="bg-cps-light-red p-4 rounded-lg mt-4">
          <div className="flex items-center mb-2">
            <AlertCircle size={20} className="text-cps-red mr-2" />
            <h3 className="font-bold text-cps-red">Error</h3>
          </div>
          <p className="text-red-800">{error}</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm mt-6 text-center">
          <p className="text-gray-600">No completed jobs found for this day</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-cps-dark">
              {filteredJobs.length} completed job{filteredJobs.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedJobs;