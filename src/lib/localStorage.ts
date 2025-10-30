// DEPRECATED: This file is being phased out in favor of Supabase
// Only keeping minimal functionality for backward compatibility during migration

export const STORAGE_KEYS = {
  // Legacy keys - DO NOT USE for new code
  ACTIVE_SEASON_ID: 'active_season_id',
  ADMIN: 'admin',
  CONTRACTOR: 'contractor',
  BUSINESS_USER: 'business_user',
  ROUTE_MANAGER: 'routeManager',
  CONSOLE_PROFILES: 'console_profiles',
  ROUTE_MANAGER_PROFILES: 'route_manager_profiles',
  TERRITORY_ASSIGNMENTS: 'territory_assignments',
  UPSELL_MENUS: 'upsell_menus',
  SERVICES: 'services',
  EAST_TERRITORY_STRUCTURE: 'east_territory_structure',
  BOOKINGS: 'bookings',
  CONSOLE_WORKERS: 'console_workers',
  CONSOLE_CARTS: 'console_carts',
  ROUTE_ASSIGNMENTS: 'routeAssignments',
  MAP_ASSIGNMENTS: 'mapAssignments',
  ATTENDANCE_FINALIZED: 'attendanceFinalized',
  LAST_APP_DATE: 'lastAppDate',
  ACTIVE_CART: 'active_cart',
  BOOKINGS_WEST_AERATION: 'bookings_west_aeration',
  BOOKINGS_WEST_SPRING_REJUV: 'bookings_west_spring_rejuv',
  BOOKINGS_WEST_FALL_REJUV: 'bookings_west_fall_rejuv',
  BOOKINGS_WEST_SERVICE: 'bookings_west_service',
  BOOKINGS_CENTRAL_AERATION: 'bookings_central_aeration',
  BOOKINGS_CENTRAL_CLEANING: 'bookings_central_cleaning',
  BOOKINGS_EAST_AERATION: 'bookings_east_aeration',
  BOOKINGS_EAST_SEALING: 'bookings_east_sealing',
} as const;

// Deprecated helper functions
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  console.warn(`DEPRECATED: getStorageItem called for key "${key}". Use Supabase services instead.`);

  if (typeof localStorage === 'undefined') {
    return defaultValue;
  }

  const savedItem = localStorage.getItem(key);
  try {
    if (savedItem === 'undefined' || savedItem === 'null' || savedItem === null) {
      return defaultValue;
    }
    return JSON.parse(savedItem);
  } catch (e) {
    console.error(`Error parsing localStorage item "${key}":`, e);
    return defaultValue;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  console.warn(`DEPRECATED: setStorageItem called for key "${key}". Use Supabase services instead.`);

  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    if (value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('storageUpdated', { detail: { key, value } }));
  } catch (e) {
    console.error(`Error saving localStorage item "${key}":`, e);
  }
};

export const removeStorageItem = (key: string): void => {
  console.warn(`DEPRECATED: removeStorageItem called for key "${key}". Use Supabase services instead.`);

  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('storageUpdated', { detail: { key, value: null } }));
  } catch (e) {
    console.error(`Error removing localStorage item "${key}":`, e);
  }
};

// Helper to get season config - DEPRECATED
export const getSeasonConfigById = (seasonId: string | null | undefined) => {
  console.warn('DEPRECATED: getSeasonConfigById called. Import from hardcodedData instead.');
  const { getSeasonConfigById: getConfig } = require('./hardcodedData');
  return getConfig(seasonId);
};
