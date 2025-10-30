import React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useJobs } from '../contexts/JobContext';
import { getCurrentDate } from '../lib/date';

const DateFilter: React.FC = () => {
  const { filter, setFilter } = useJobs();
  const today = getCurrentDate();

  // Initialize with today's date if no date is set
  const currentDate = filter.date ? new Date(filter.date) : today;

  const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const formatDisplayDate = (date: Date): string => {
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    return isToday ? 'Today' : format(date, 'EEE, MMM d');
  };

  const goToPreviousDay = () => {
    const newDate = subDays(currentDate, 1);
    setFilter({ ...filter, date: formatDate(newDate) });
  };

  const goToNextDay = () => {
    const newDate = addDays(currentDate, 1);
    setFilter({ ...filter, date: formatDate(newDate) });
  };

  const goToToday = () => {
    setFilter({ ...filter, date: formatDate(today) });
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm mb-4 flex items-center justify-between">
      <button
        onClick={goToPreviousDay}
        className="p-1 rounded-full hover:bg-gray-100"
        aria-label="Previous day"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={goToToday}
        className="flex items-center px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <Calendar size={16} className="mr-2" />
        <span className="font-medium">{formatDisplayDate(currentDate)}</span>
      </button>

      <button
        onClick={goToNextDay}
        className="p-1 rounded-full hover:bg-gray-100"
        aria-label="Next day"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateFilter;
