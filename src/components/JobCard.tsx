import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterBooking, Service } from '../types';
import { MapPin, Phone, Mail, DollarSign, CreditCard, Tag } from 'lucide-react';

interface JobCardProps {
  job: MasterBooking;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const cardColorClass = job.isContract
    ? 'border-orange-500'
    : job.isPrebooked
    ? 'border-green-500'
    : 'border-yellow-500';

  return (
    <div
      onClick={() => navigate(`/logsheet/jobs/${job['Booking ID']}`)}
      className={`bg-gray-800 rounded-lg p-4 border-l-4 ${cardColorClass} hover:bg-gray-700/80 transition-colors cursor-pointer w-full`}
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
        <div className="mb-2 sm:mb-0">
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full font-mono">
            RC: {job['Route Number']}
          </span>
          <h3 className="text-lg font-bold text-white mt-2">
            {job['First Name']} {job['Last Name']}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
            <DollarSign size={12} />
            {parseFloat(job.Price || '0').toFixed(2)}
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
            <CreditCard size={12} />
            {job['Payment Method']}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span>{job['Full Address']}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} />
          <span>{job['Home Phone'] || 'No phone'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={14} />
          <span>{job['Email Address'] || 'No email'}</span>
        </div>
      </div>

      {job.services && job.services.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-3">
          <div className="flex flex-wrap gap-2">
            {job.services.map((service: Service) => (
              <span
                key={service.id}
                className="flex items-center gap-1.5 text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full"
              >
                <Tag size={12} />
                {service.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
