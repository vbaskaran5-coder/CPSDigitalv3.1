// DEPRECATED: This file is being phased out in favor of Supabase real-time subscriptions
// Keeping minimal stubs for backward compatibility during migration

import { TerritoryStructureService } from '../services/database.service';

export const ensureEastTerritoryStructureFetched = async (): Promise<void> => {
  console.warn('DEPRECATED: ensureEastTerritoryStructureFetched called. Data is now fetched via Supabase services.');
  // Territory structure is now loaded directly from Supabase when needed
  // No need to cache in localStorage
  try {
    await TerritoryStructureService.get('East');
  } catch (error) {
    console.error('Failed to fetch territory structure:', error);
  }
};

export const syncFromGoogleSheets = async (): Promise<void> => {
  console.warn('DEPRECATED: syncFromGoogleSheets called. Use Supabase edge functions instead.');
  throw new Error('Google Sheets sync is deprecated. Use Supabase edge functions.');
};
