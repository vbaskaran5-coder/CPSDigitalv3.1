import React, { useState } from 'react';
import { useJobs } from '../contexts/JobContext';
import { format } from 'date-fns';
import { DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStorageItem, STORAGE_KEYS } from '../../lib/localStorage';

const Payout: React.FC = () => {
  const { bookings = [] } = useJobs();
  const navigate = useNavigate();
  const [machineRental, setMachineRental] = useState(true);
  const [actualAmounts, setActualAmounts] = useState({
    cash: '',
    change: '',
    cheque: '',
  });

  const contractor = getStorageItem(STORAGE_KEYS.CONTRACTOR, {});

  // Get completed bookings
  const completedBookings = bookings.filter(
    (booking) => booking['Completed'] === 'x'
  );

  // Calculate ratio
  const prebookedCompleted = completedBookings.filter(
    (booking) => booking.isPrebooked
  ).length;
  const newSalesCompleted = completedBookings.filter(
    (booking) => !booking.isPrebooked
  ).length;
  const hasRatio = prebookedCompleted > 0 || newSalesCompleted > 0;
  const ratio = hasRatio ? prebookedCompleted / (newSalesCompleted || 1) : 0;

  // Group bookings by payment method
  const bookingsByPayment = completedBookings.reduce((acc, booking) => {
    let method = 'billed';
    if (booking['Payment Method']) {
      method = booking['Payment Method'].toLowerCase();
    } else if (booking['Prepaid'] === 'x') {
      method = 'prepaid';
    }

    if (!acc[method]) {
      acc[method] = [];
    }
    acc[method].push(booking);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate totals for each payment method
  const paymentTotals = Object.entries(bookingsByPayment).reduce(
    (acc, [method, bookings]) => {
      acc[method] = bookings.reduce(
        (sum, booking) => sum + parseFloat(booking['Price'] || '0'),
        0
      );
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate differences
  const actualCash =
    parseFloat(actualAmounts.cash || '0') +
    parseFloat(actualAmounts.change || '0');
  const cashDifference = actualCash - (paymentTotals.cash || 0);
  const chequeDifference =
    parseFloat(actualAmounts.cheque || '0') - (paymentTotals.cheque || 0);

  // Calculate silver bonus percentage
  const calculateSilverBonus = (silvers: number): number => {
    if (silvers >= 8) return 4;
    if (silvers >= 6) return 3;
    if (silvers >= 4) return 2;
    if (silvers >= 2) return 1;
    return 0;
  };

  const handleSubmit = () => {
    // Calculate actual cash including change
    const actualCash =
      parseFloat(actualAmounts.cash || '0') +
      parseFloat(actualAmounts.change || '0');
    const actualCheque = parseFloat(actualAmounts.cheque || '0');

    // Calculate gross sales
    const grossSales =
      actualCash +
      actualCheque +
      (paymentTotals.credit || 0) +
      (paymentTotals.etransfer || 0) +
      (paymentTotals.billed || 0) +
      (paymentTotals.prepaid || 0);

    // Calculate payable sales (remove HST)
    const payableSales = grossSales / 1.13;

    // Calculate aeration equivalent
    const aerEquivalent = payableSales / 25;

    // Calculate commission
    const baseRate = 8.0; // Base rate per equivalent
    const bonusRate = 0.25; // Bonus rate per percentage point
    const daysPercentage = contractor.daysPercentage || 0;
    const silverBonus = calculateSilverBonus(contractor.silvers || 0);
    const bonusPercentage = daysPercentage + silverBonus;

    const payoutRate = baseRate + bonusRate * bonusPercentage;
    const aerationCommission = aerEquivalent * payoutRate;
    const totalCommission = aerationCommission - (machineRental ? 10 : 0);

    // Navigate to summary with all calculated data
    navigate('/payout/summary', {
      state: {
        payoutData: {
          grossSales,
          payableSales,
          aerEquivalent,
          payoutRate,
          bonusRate,
          bonusPercentage,
          daysPercentage,
          silverBonus,
          aerationCommission,
          machineRental,
          totalCommission,
          contractor,
          paymentTotals,
          actualAmounts,
          completedSteps: completedBookings.length,
          ratio,
          hasRatio,
        },
      },
    });
  };

  // Define payment sections in desired order
  const paymentSections = [
    { method: 'prepaid', title: 'AER Pre-Pay' },
    { method: 'billed', title: 'AER Billed' },
    { method: 'cash', title: 'AER Cash' },
    { method: 'cheque', title: 'AER Cheque' },
    { method: 'etransfer', title: 'AER ETF' },
    { method: 'credit', title: 'AER CCD' },
  ];

  const PaymentSection = ({
    title,
    amount,
    bookings = [],
    method,
  }: {
    title: string;
    amount: number;
    bookings: any[];
    method: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2 border-b border-gray-700">
        <span className="text-gray-400">{title}</span>
        <span className="font-medium text-gray-200">${amount.toFixed(2)}</span>
      </div>
      {bookings.map((booking, index) => (
        <div
          key={index}
          className={`p-2 rounded-md ${
            booking.isPrebooked
              ? 'border-l-4 border-cps-blue bg-gray-700/30'
              : 'border-l-4 border-cps-yellow bg-gray-700/30'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                {booking['Route Number'] && (
                  <span className="text-sm text-cps-blue">
                    {booking['Route Number']}
                  </span>
                )}
                <span className="text-sm text-gray-300">
                  {booking['Full Address']}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {booking['FO/BO/FP']}
              </span>
              <span className="text-sm font-medium text-gray-200">
                ${booking['Price']}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-100">
              Aeration Invoice for {contractor.firstName} {contractor.lastName}
            </h2>
            <p className="text-sm text-gray-400">
              {format(new Date(), 'MMMM d')} • Days: {contractor.daysPercentage}
              % Silvers: {calculateSilverBonus(contractor.silvers)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-100 mb-1">
              Steps: {completedBookings.length}
            </p>
            {hasRatio && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  Math.abs(ratio - 1) < 0.1
                    ? 'bg-cps-light-green text-green-200'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {Math.abs(ratio - 1) < 0.1 ? 'Ratio' : 'No Ratio'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Display payment sections in order, only if they have values */}
          {paymentSections.map((section) => {
            const amount = paymentTotals[section.method] || 0;
            const bookings = bookingsByPayment[section.method] || [];

            if (amount > 0 || bookings.length > 0) {
              return (
                <PaymentSection
                  key={section.method}
                  title={section.title}
                  amount={amount}
                  bookings={bookings}
                  method={section.method}
                />
              );
            }
            return null;
          })}

          <div className="space-y-3 bg-gray-700/30 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Actual Cash
              </label>
              <div className="currency-input">
                <span>$</span>
                <input
                  type="text"
                  value={actualAmounts.cash}
                  onChange={(e) =>
                    setActualAmounts((prev) => ({
                      ...prev,
                      cash: e.target.value,
                    }))
                  }
                  className="input"
                  placeholder="0.00"
                />
              </div>
              {cashDifference !== 0 && (
                <div
                  className={`text-sm mt-1 ${
                    cashDifference > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <AlertCircle size={12} className="inline mr-1" />
                  {cashDifference > 0 ? 'Over' : 'Under'} by $
                  {Math.abs(cashDifference).toFixed(2)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Change
              </label>
              <div className="currency-input">
                <span>$</span>
                <input
                  type="text"
                  value={actualAmounts.change}
                  onChange={(e) =>
                    setActualAmounts((prev) => ({
                      ...prev,
                      change: e.target.value,
                    }))
                  }
                  className="input"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Actual Cheque
              </label>
              <div className="currency-input">
                <span>$</span>
                <input
                  type="text"
                  value={actualAmounts.cheque}
                  onChange={(e) =>
                    setActualAmounts((prev) => ({
                      ...prev,
                      cheque: e.target.value,
                    }))
                  }
                  className="input"
                  placeholder="0.00"
                />
              </div>
              {chequeDifference !== 0 && (
                <div
                  className={`text-sm mt-1 ${
                    chequeDifference > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <AlertCircle size={12} className="inline mr-1" />
                  {chequeDifference > 0 ? 'Over' : 'Under'} by $
                  {Math.abs(chequeDifference).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="machineRental"
              checked={machineRental}
              onChange={(e) => setMachineRental(e.target.checked)}
              className="h-4 w-4 text-cps-red rounded"
            />
            <label htmlFor="machineRental" className="text-sm text-gray-300">
              Machine Rental ($10)
            </label>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-cps-green text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            Complete Payout <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payout;
