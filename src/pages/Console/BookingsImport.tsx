import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { supabaseBookingStore } from '../../stores/SupabaseBookingStore';

const BookingsImport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      const territoryResponse = await fetch(
        'https://docs.google.com/spreadsheets/d/1KPRTH3bESAi-0-2K9v1b-hOUGdCqzLD0D4mdKCSMs-0/gviz/tq?tqx=out:csv&sheet=Territory'
      );

      if (!territoryResponse.ok) {
        throw new Error('Failed to fetch territory data');
      }

      const territoryText = await territoryResponse.text();
      const territoryResult = Papa.parse(territoryText, { 
        header: false,
        skipEmptyLines: true
      });

      const routeToMap: Record<string, { group: string; map: string }> = {};
      territoryResult.data.slice(1).forEach((row: any) => {
        const group = row[0];
        const map = row[2];
        const routes = row[3]?.split(',') || [];

        routes.forEach(route => {
          const trimmedRoute = route.trim();
          if (trimmedRoute) {
            routeToMap[trimmedRoute] = { group, map };
          }
        });
      });

      const bookingsResponse = await fetch(
        'https://docs.google.com/spreadsheets/d/1KPRTH3bESAi-0-2K9v1b-hOUGdCqzLD0D4mdKCSMs-0/gviz/tq?tqx=out:csv&sheet=Bookings'
      );

      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch bookings data');
      }

      const bookingsText = await bookingsResponse.text();
      const bookingsResult = Papa.parse(bookingsText, { 
        header: false,
        skipEmptyLines: true
      });

      const bookings = bookingsResult.data.slice(1).map((row: any) => {
        const routeNumber = row[0]?.trim() || '';
        const bookedBy = row[1]?.trim() || '';
        const dateBooked = row[2]?.trim() || '';
        const firstName = row[3]?.trim() || '';
        const lastName = row[4]?.trim() || '';
        const houseNumber = row[5]?.trim() || '';
        const streetName = row[6]?.trim() || '';
        const phoneNumber = row[7]?.trim() || '';
        const phoneType = row[8]?.trim() || '';
        const email = row[9]?.trim() || '';
        const price = row[10]?.trim() || '59.99';
        const propertyType = row[11]?.trim() || 'FP';
        const prepaid = row[12]?.toLowerCase() === 'x' ? 'x' : '';
        const sprinkler = row[13]?.toLowerCase() === 'x' ? 'x' : '';
        const gate = row[14]?.toLowerCase() === 'x' ? 'x' : '';
        const mustBeHome = row[15]?.toLowerCase() === 'x' ? 'x' : '';
        const callFirst = row[16]?.toLowerCase() === 'x' ? 'x' : '';
        const secondRun = row[17]?.toLowerCase() === 'x' ? 'x' : '';

        const mapInfo = routeToMap[routeNumber] || { group: '', map: '' };

        supabaseBookingStore.addBooking({
          "Booked By": bookedBy,
          "Date/Time Booked": dateBooked,
          "Master Map": mapInfo.map,
          "Group": mapInfo.group,
          "Route Number": routeNumber,
          "First Name": firstName,
          "Last Name": lastName,
          "Full Address": `${houseNumber} ${streetName}`,
          "Home Phone": phoneNumber,
          "Phone Type": phoneType,
          "Email Address": email,
          "Price": price,
          "Prepaid": prepaid,
          "FO/BO/FP": propertyType,
          "Sprinkler": sprinkler,
          "Gate": gate,
          "Must be home": mustBeHome,
          "Call First": callFirst,
          "Second Run": secondRun,
          "Log Sheet Notes": [
            sprinkler && 'SS',
            gate && 'Gate',
            mustBeHome && 'MBH',
            callFirst && 'CF',
            secondRun && '2nd RUN'
          ].filter(Boolean).join(' - '),
          "Completed": '',
          "Status": '',
          isPrebooked: true
        });
      });

      navigate('/console/bookings/maps');
    } catch (error) {
      console.error('Error importing bookings:', error);
      setError(error instanceof Error ? error.message : 'Failed to import bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Import Master Bookings</h2>
          
          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-900/20 px-3 py-2 rounded">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <p className="text-gray-400 mb-6">
            Import all bookings from the master spreadsheet. This will replace any existing bookings with the latest data.
          </p>

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-cps-blue text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Import Bookings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingsImport;