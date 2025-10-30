import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabaseBookingStore } from '../../stores/SupabaseBookingStore';
import { MasterBooking } from '../../types';
import { format, parseISO } from 'date-fns';
import { Loader, Phone, Mail } from 'lucide-react';
import { getStorageItem, STORAGE_KEYS } from '../../lib/localStorage';

// Define a simple interface for worker data
interface Worker {
  contractorId: string;
  firstName: string;
  lastName: string;
}

type FilterType = 'Active' | 'Cancelled' | 'Completed' | 'Billed';

const PreBooks: React.FC = () => {
  const [bookings, setBookings] = useState<MasterBooking[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('Active');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
      setLoading(true);

      // Load the list of all workers from localStorage
      setWorkers(getStorageItem(STORAGE_KEYS.CONSOLE_WORKERS, []));

      const allBookings = supabaseBookingStore.getAllBookings();
      const allPreBooks = allBookings.filter((b) => b.isPrebooked);
      let filtered: MasterBooking[] = [];

      switch (filter) {
        case 'Cancelled':
          filtered = allPreBooks.filter((b) => b.Status === 'cancelled');
          break;
        case 'Completed':
          filtered = allPreBooks.filter(
            (b) =>
              b.Completed === 'x' &&
              b['Payment Method']?.toLowerCase() !== 'billed'
          );
          break;
        case 'Billed':
          filtered = allPreBooks.filter(
            (b) =>
              b.Completed === 'x' &&
              b['Payment Method']?.toLowerCase() === 'billed'
          );
          break;
        case 'Active':
        default:
          filtered = allPreBooks.filter(
            (b) => !b.Status && b.Completed !== 'x'
          );
          break;
      }

      setBookings(filtered);
      setLoading(false);
    };

    loadData(); // Load data initially

    // Add event listener to refresh data when changes are made elsewhere
    window.addEventListener('storageUpdated', loadData);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storageUpdated', loadData);
    };
  }, [filter]);

  const handleCopy = (e: React.MouseEvent, text: string | undefined) => {
    e.stopPropagation();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedValue(text);
      setTimeout(() => setCopiedValue(null), 1500);
    }
  };

  const getWorkerName = (contractorId: string): string => {
    const worker = workers.find((w) => w.contractorId === contractorId);
    return worker ? `${worker.firstName} ${worker.lastName}` : 'Unassigned';
  };

  const getBorderColor = () => {
    switch (filter) {
      case 'Cancelled':
        return 'border-cps-red';
      case 'Completed':
      case 'Billed':
        return 'border-cps-green';
      default:
        return 'border-gray-700/30';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="w-8 h-8 text-cps-blue animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No bookings found for the "{filter}" filter.
      </div>
    );
  }

  const bookingsByRoute = bookings.reduce((acc, booking) => {
    const route = booking['Route Number'] || 'Unassigned';
    if (!acc[route]) {
      acc[route] = [];
    }
    acc[route].push(booking);
    return acc;
  }, {} as Record<string, MasterBooking[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-medium text-white">Spring Bookings</h2>
          <span className="text-sm text-gray-400">({bookings.length})</span>
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md focus:ring-cps-blue focus:border-cps-blue block w-full p-2"
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Billed">Billed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No bookings found for the "{filter}" filter.
        </div>
      )}

      {Object.entries(bookingsByRoute)
        .sort(([routeA], [routeB]) => routeA.localeCompare(routeB))
        .map(([route, routeBookings]) => (
          <div key={route} className="space-y-2">
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-sm font-medium text-cps-blue">{route}</h3>
              <span className="text-xs text-gray-400">
                ({routeBookings.length} bookings)
              </span>
            </div>

            {routeBookings.map((booking) => {
              const price = parseFloat(booking['Price'] || '0').toFixed(2);
              const badges = [
                booking['Sprinkler'] === 'x' && {
                  text: 'SS',
                  color: 'bg-blue-900/20 text-blue-300',
                },
                booking['Gate'] === 'x' && {
                  text: 'Gate',
                  color: 'bg-yellow-900/20 text-yellow-300',
                },
                booking['Must be home'] === 'x' && {
                  text: 'MBH',
                  color: 'bg-purple-900/20 text-purple-300',
                },
                booking['Call First'] === 'x' && {
                  text: 'CF',
                  color: 'bg-pink-900/20 text-pink-300',
                },
                booking['Second Run'] === 'x' && {
                  text: '2nd',
                  color: 'bg-red-900/20 text-red-300',
                },
              ].filter(Boolean);

              const contractorName = booking['Contractor Number']
                ? getWorkerName(booking['Contractor Number'])
                : 'N/A';
              const dateCompleted = booking['Date Completed']
                ? format(parseISO(booking['Date Completed']), 'MMMdd')
                : 'N/A';

              let paymentMethod: string;
              if (booking['Prepaid'] === 'x') {
                paymentMethod = 'PREPAID';
              } else {
                paymentMethod = (
                  booking['Payment Method'] || 'N/A'
                ).toUpperCase();
              }

              return (
                <div
                  key={booking['Booking ID']}
                  onClick={() =>
                    navigate(
                      `/console/bookings/prebooks/${booking['Booking ID']}`
                    )
                  }
                  className={`rounded-lg p-3 flex items-center justify-between border hover:bg-gray-700/50 cursor-pointer transition-colors bg-gray-800/50 ${getBorderColor()}`}
                >
                  <div className="flex-1 min-w-0 flex items-baseline gap-x-4 gap-y-1 flex-wrap">
                    <p className="text-sm text-gray-200 font-medium truncate">
                      {booking['Full Address']}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {booking['First Name']} {booking['Last Name']}
                    </p>
                    {booking['Home Phone'] && (
                      <button
                        onClick={(e) => handleCopy(e, booking['Home Phone'])}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
                      >
                        <Phone size={12} />
                        <span>
                          {copiedValue === booking['Home Phone']
                            ? 'Copied!'
                            : booking['Home Phone']}
                        </span>
                      </button>
                    )}
                    {booking['Email Address'] && (
                      <button
                        onClick={(e) => handleCopy(e, booking['Email Address'])}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
                      >
                        <Mail size={12} />
                        <span className="truncate">
                          {copiedValue === booking['Email Address']
                            ? 'Copied!'
                            : booking['Email Address']}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pl-4">
                    {filter === 'Completed' ||
                    filter === 'Billed' ||
                    filter === 'Cancelled' ? (
                      <>
                        <span className="text-sm text-gray-200 font-medium w-16 text-right">
                          ${price}
                        </span>
                        <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-medium">
                          {contractorName}
                        </span>
                        <span className="text-[10px] bg-cps-green/20 text-green-300 px-1.5 py-0.5 rounded font-medium">
                          {dateCompleted}
                        </span>
                        {filter !== 'Cancelled' && (
                          <span className="text-[10px] bg-purple-900/20 text-purple-300 px-1.5 py-0.5 rounded font-medium">
                            {paymentMethod}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          {booking['Prepaid'] === 'x' && (
                            <span className="text-[10px] bg-green-900/20 text-green-300 px-1.5 py-0.5 rounded font-medium">
                              PP
                            </span>
                          )}
                          {badges.map(
                            (badge, i) =>
                              badge && (
                                <span
                                  key={i}
                                  className={`text-[10px] ${badge.color} px-1.5 py-0.5 rounded font-medium`}
                                >
                                  {badge.text}
                                </span>
                              )
                          )}
                          <span className="text-[10px] bg-cps-blue/20 text-blue-300 px-1.5 py-0.5 rounded font-medium">
                            {booking['FO/BO/FP']}
                          </span>
                        </div>
                        <span className="text-sm text-gray-200 font-medium w-16 text-right">
                          ${price}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
};

export default PreBooks;
