import React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AchievementWatermarks from '../components/AchievementWatermarks';
import { ArrowLeft } from 'lucide-react';

const PayoutSummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const payoutData = location.state?.payoutData;

  if (!payoutData) {
    return <Navigate to="/payout" />;
  }

  const {
    grossSales = 0,
    payableSales = 0,
    aerEquivalent = 0,
    payoutRate = 8.00,
    bonusRate = 0.25,
    bonusPercentage = 0,
    daysPercentage = 0,
    silverBonus = 0,
    aerationCommission = 0,
    machineRental = false,
    totalCommission = 0,
    contractor = {},
    completedSteps = 0,
    ratio = 0,
    hasRatio = false
  } = payoutData;
  
  // Show silver hat for 50+ EQ, gold jersey for 40-49 EQ, green jacket for 30-39 EQ
  const showSilverHat = aerEquivalent >= 50;
  const showGoldJersey = aerEquivalent >= 40 && aerEquivalent < 50;
  const showGreenJacket = aerEquivalent >= 30 && aerEquivalent < 40;

  const handleSubmit = () => {
    try {
      localStorage.clear();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error during payout submission:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md relative z-10 border border-gray-700/50">
        <h1 className="text-2xl font-bold text-center text-gray-100 mb-6">Payout Summary</h1>
        
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400">
            <p>{format(new Date(), 'MMMM d, yyyy')}</p>
            <p>{contractor.firstName} {contractor.lastName} • #{contractor.number}</p>
            <p className="text-xs">Days: {daysPercentage}% • Silvers: {silverBonus}%</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Total Steps */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Total Steps</p>
              <div className="text-base font-medium text-gray-200">
                {completedSteps}
              </div>
            </div>
          </div>

          {/* Gross Sales */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Gross Sales</p>
              <div className="text-base font-medium text-gray-200">
                ${grossSales.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payable Sales */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Payable Sales</p>
              <div className="text-base font-medium text-gray-200">
                ${payableSales.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Aeration Equivalent - Highlighted */}
          <div className="bg-gray-700/70 rounded-lg p-6 border border-gray-600/70 relative overflow-hidden">
            {/* Achievement Watermark */}
            <AchievementWatermarks
              achievements={{
                silverHat: showSilverHat,
                goldJersey: showGoldJersey,
                greenJacket: showGreenJacket,
              }}
            />

            <div className="text-center relative z-10">
              <p className="text-gray-400 mb-2">Aeration Equivalent</p>
              <div className="text-5xl font-bold text-gray-100">
                {aerEquivalent.toFixed(2)}EQ
              </div>
              {(showSilverHat || showGoldJersey || showGreenJacket) && (
                <div className="mt-2 text-sm font-semibold text-white bg-gray-600/50 py-1 px-3 rounded-full inline-block">
                  {showSilverHat && "Silver Hat Achievement!"}
                  {showGoldJersey && "Gold Jersey Achievement!"}
                  {showGreenJacket && "Green Jacket Achievement!"}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Payout Rate</p>
              <div className="text-sm font-medium text-gray-200">
                ${payoutRate.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Aeration Commission</p>
              <div className="text-sm font-medium text-gray-200">
                ${aerationCommission.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Machine Rental</p>
              <div className="text-sm font-medium text-gray-200">
                -${machineRental ? '10.00' : '0.00'}
              </div>
            </div>
          </div>

          {/* Total Commission - Highlighted */}
          <div className="bg-gray-700/70 rounded-lg p-6 border border-gray-600/70">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Total Commission</p>
              <div className="text-5xl font-bold text-gray-100">
                ${totalCommission.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-cps-green text-white py-4 rounded-md hover:bg-green-700 transition-colors font-medium text-lg mt-4"
          >
            Submit Payout
          </button>

          <button
            onClick={() => navigate('/payout')}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-200 py-3 rounded-md hover:bg-gray-600 transition-colors mt-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Payout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutSummary;