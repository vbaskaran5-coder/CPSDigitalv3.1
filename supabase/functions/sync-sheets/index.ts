import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { routeCode } = await req.json();

    // Get required environment variables
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    const spreadsheetId = Deno.env.get('SPREADSHEET_ID');
    const sheetName = Deno.env.get('SHEET_NAME');

    if (!apiKey) {
      throw new Error('Google API key is not configured');
    }

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is not configured');
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch spreadsheet data: ${response.status} ${response.statusText}` +
        (errorData.error?.message ? ` - ${errorData.error.message}` : '')
      );
    }

    const data = await response.json();
    
    if (!data.values || !data.values.length) {
      throw new Error('No data found in spreadsheet');
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    const mappedBookings = rows
      .filter((row: any[]) => row[4]?.includes(routeCode)) // Filter by Route Number (column E)
      .map((row: any[]) => {
        const booking: Record<string, string> = {};
        headers.forEach((header: string, index: number) => {
          booking[header] = row[index] || '';
        });
        return booking;
      });

    return new Response(
      JSON.stringify({ data: mappedBookings }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Sync sheets error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        status: 'error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});