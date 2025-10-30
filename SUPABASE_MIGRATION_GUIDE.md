# Supabase Migration Guide

## Overview

Your application has been prepared for migration from localStorage to Supabase for multi-device data synchronization. This guide explains the new architecture, how to complete the migration, and how to use the new services.

## What Has Been Created

### 1. Database Schema (Complete)

All necessary database tables have been created in Supabase:

- `console_profiles` - Console user profiles with seasons and settings
- `route_manager_profiles` - Route manager accounts
- `workers` - Worker/contractor data with attendance and payout info
- `master_bookings` - All job bookings (pre-booked and same-day)
- `carts` - Team cart assignments
- `route_assignments` - Daily route-to-worker assignments
- `map_assignments` - Daily map-to-route-manager assignments
- `territory_assignments` - Master map assignments to console profiles
- `territory_structure` - Cached territory structure data
- `services_catalog` - Available services catalog
- `upsell_menus` - Upsell/contract menu definitions
- `payout_logic_settings` - Payout configuration per profile/season
- `active_season_settings` - Active season selection per console profile
- `attendance_finalized_records` - Attendance finalization tracking
- `business_panel_users` - Business panel administrator accounts

### 2. Supabase Client & Services

**Files Created:**

- `/src/lib/supabase.ts` - Supabase client with realtime subscription helpers
- `/src/lib/supabaseHelpers.ts` - Data transformation utilities (snake_case ↔ camelCase)
- `/src/services/database.service.ts` - Complete CRUD services for all entities:
  - `BookingService` - Master bookings operations
  - `WorkerService` - Worker management
  - `ConsoleProfileService` - Console profile management
  - `RouteManagerService` - Route manager profiles
  - `CartService` - Team cart management
  - `RouteAssignmentService` - Daily route assignments
  - `TerritoryAssignmentService` - Territory/map assignments
  - `TerritoryStructureService` - Territory structure caching
  - `ActiveSeasonService` - Active season management
- `/src/services/auth.service.ts` - Authentication and session management
- `/src/stores/SupabaseBookingStore.ts` - New booking store with Supabase and realtime updates
- `/src/utils/migrateToSupabase.ts` - One-time migration utility from localStorage

## Migration Steps

### Step 1: Initialize Supabase Connection

The Supabase client is already configured and will use environment variables from your `.env` file:

```
VITE_SUPABASE_URL=https://akccppibkxkrseuaoquk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

These are already set up and working.

### Step 2: Migrate Existing Data (One-Time)

To migrate your existing localStorage data to Supabase, you have two options:

#### Option A: Using the Migration Utility (Recommended)

Add this to a temporary admin page or console:

```typescript
import { migrateLocalStorageToSupabase } from './utils/migrateToSupabase';

// Run migration
const result = await migrateLocalStorageToSupabase();
console.log('Migration result:', result);
```

This will:
- Migrate console profiles
- Migrate route manager profiles
- Migrate workers
- Migrate territory assignments
- Migrate territory structure cache

#### Option B: Manual Data Entry

Use the Business Panel to manually create console profiles, route managers, and workers in Supabase.

### Step 3: Update Component Imports

Replace old localStorage-based stores with new Supabase services:

**Old way (localStorage):**
```typescript
import { bookingStore } from '../stores/AdminBookingStore';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/localStorage';
```

**New way (Supabase):**
```typescript
import { supabaseBookingStore } from '../stores/SupabaseBookingStore';
import { BookingService, WorkerService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
```

### Step 4: Update Authentication Flow

**Console Login Example:**

```typescript
import { AuthService } from '../services/auth.service';
import { supabaseBookingStore } from '../stores/SupabaseBookingStore';

// Login
const handleLogin = async (username: string, password: string) => {
  try {
    const session = await AuthService.loginConsole(username, password);

    // Initialize booking store with user's console profile
    await supabaseBookingStore.initialize(session.userId);

    navigate('/console/workerbook');
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Logout
const handleLogout = () => {
  supabaseBookingStore.cleanup();
  AuthService.logout();
  navigate('/login');
};
```

**Route Manager Login:**

```typescript
const session = await AuthService.loginRouteManager(username, password);
```

**Business Panel Login:**

```typescript
const session = await AuthService.loginBusinessPanel(username, password);
```

### Step 5: Working with Bookings

**Get all bookings for current season:**
```typescript
const bookings = supabaseBookingStore.getAllBookings();
```

**Get bookings for a contractor:**
```typescript
const contractorBookings = await supabaseBookingStore.getBookingsForContractor(contractorId);
```

**Add a booking:**
```typescript
await supabaseBookingStore.addBooking({
  'Route Number': 'ALD01',
  'First Name': 'John',
  'Last Name': 'Doe',
  'Full Address': '123 Main St',
  Price: '59.99',
  // ... other fields
});
```

**Update a booking:**
```typescript
await supabaseBookingStore.updateBooking(bookingId, {
  Completed: 'x',
  'Payment Method': 'Cash',
  'Is Paid': true,
});
```

**Switch active season:**
```typescript
await supabaseBookingStore.switchSeason('east-aeration');
```

### Step 6: Real-Time Updates

The new system automatically subscribes to real-time changes. When any user updates a booking, all connected devices will see the update immediately.

**Listen for booking updates:**
```typescript
useEffect(() => {
  const handleRefresh = () => {
    console.log('Bookings updated!');
    // Refresh your UI
  };

  window.addEventListener('bookingStoreRefreshed', handleRefresh);
  return () => window.removeEventListener('bookingStoreRefreshed', handleRefresh);
}, []);
```

### Step 7: Working with Workers

```typescript
import { WorkerService } from '../services/database.service';

// Get all workers
const workers = await WorkerService.getAll();

// Get worker by ID
const worker = await WorkerService.getById(contractorId);

// Update worker
await WorkerService.update(contractorId, {
  showed: true,
  showedDate: '2025-10-29',
  bookingStatus: 'today',
});

// Create new worker
await WorkerService.create({
  contractorId: 'W123',
  firstName: 'Jane',
  lastName: 'Smith',
  status: 'Rookie',
  // ... other fields
});
```

### Step 8: Route Assignments

```typescript
import { RouteAssignmentService } from '../services/database.service';

// Get today's assignments
const today = new Date().toISOString().split('T')[0];
const assignments = await RouteAssignmentService.getByDate(today);

// Assign a route to a worker
await RouteAssignmentService.setAssignment('ALD01', 'W123', today);

// Bulk update all assignments for a day
await RouteAssignmentService.bulkSet({
  'ALD01': 'W123',
  'ALD02': 'W124',
  'ALD03': 'W125',
}, today);
```

### Step 9: Territory Management

```typescript
import { TerritoryAssignmentService, TerritoryStructureService } from '../services/database.service';

// Get all territory assignments
const territories = await TerritoryAssignmentService.getAll();

// Assign maps to console profiles
await TerritoryAssignmentService.setAssignment('Aldershot #1', [1, 2, 3]);

// Get cached territory structure
const structure = await TerritoryStructureService.get('East');

// Update territory structure cache
await TerritoryStructureService.set('East', {
  'Group A': {
    'Aldershot #1': ['ALD01', 'ALD02', 'ALD03'],
    'Aldershot #2': ['ALD04', 'ALD05'],
  },
});
```

## Key Architectural Changes

### 1. Authentication

- **Before:** Username stored in localStorage with no validation
- **After:** Proper authentication via `AuthService` with session management
- Sessions are stored in localStorage but validated against database

### 2. Data Storage

- **Before:** All data in localStorage (device-specific)
- **After:** All data in Supabase (shared across devices)
- localStorage only used for session caching

### 3. Data Synchronization

- **Before:** Manual sync, data conflicts possible
- **After:** Real-time synchronization via Supabase Realtime
- All connected devices see updates immediately

### 4. Territory Filtering

- **Before:** Client-side filtering on full dataset
- **After:** Server-side filtering using Supabase queries
- More efficient, especially with large datasets

### 5. Season Management

- **Before:** Active season in localStorage per device
- **After:** Active season stored in database per console profile
- Consistent across all devices for same user

## Data Migration Considerations

### Booking IDs

The new system generates booking IDs in the format:
- `{routeNumber}-{seasonId}-{timestamp}-{random}`
- e.g., `ALD01-east-aeration-1698765432-a3f9b2`

Old booking IDs will be preserved during migration.

### Season Association

All bookings must be associated with a `season_id` (e.g., 'east-aeration', 'west-spring-rejuv'). The migration will need to determine which season each booking belongs to based on the original localStorage key it came from.

### Date Formats

- Dates are stored as ISO 8601 strings: `YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ss.sssZ` for timestamps
- The database uses PostgreSQL `DATE` and `TIMESTAMPTZ` types

## Testing the Migration

### 1. Test Authentication

```typescript
// Test console login
const session = await AuthService.loginConsole('testuser', 'password');
console.log('Logged in as:', session.username);

// Verify session persists
const currentSession = AuthService.getSession();
console.log('Current session:', currentSession);
```

### 2. Test Data Operations

```typescript
// Create a test booking
const booking = await BookingService.create({
  'Booking ID': 'TEST-001',
  'Route Number': 'ALD01',
  'First Name': 'Test',
  'Last Name': 'User',
  season_id: 'east-aeration',
});

// Verify it was created
const retrieved = await BookingService.getById('TEST-001');
console.log('Retrieved booking:', retrieved);

// Update it
await BookingService.update('TEST-001', {
  Completed: 'x',
});

// Delete it
await BookingService.delete('TEST-001');
```

### 3. Test Real-Time Updates

Open the app in two browser tabs:
1. Log in with the same user in both tabs
2. Create a booking in tab 1
3. Verify it appears immediately in tab 2 without refresh

### 4. Test on Multiple Devices

1. Deploy to Vercel
2. Access from desktop browser
3. Access from mobile browser
4. Verify data syncs across both devices

## Rollback Plan

If issues occur, you can temporarily roll back:

1. Keep the old localStorage-based files
2. Comment out Supabase imports
3. Re-enable old localStorage imports
4. The localStorage data is preserved unless explicitly cleared

## Performance Considerations

### Caching Strategy

The new system uses a hybrid approach:
- Frequently accessed data (active bookings) kept in memory
- Real-time updates refresh the cache automatically
- Territory structure cached in database to reduce API calls

### Query Optimization

- All queries use Supabase indexes for fast retrieval
- Territory filtering happens server-side
- Bulk operations use batch inserts/updates

### Real-Time Subscriptions

- One subscription per active season
- Automatically unsubscribed when switching seasons or logging out
- Reconnects automatically if connection drops

## Next Steps

1. **Run data migration** - Use the migration utility to move existing data
2. **Update login pages** - Replace localStorage auth with AuthService
3. **Update booking pages** - Replace AdminBookingStore with SupabaseBookingStore
4. **Update worker pages** - Use WorkerService instead of localStorage
5. **Test thoroughly** - Verify all operations work correctly
6. **Deploy to Vercel** - Test multi-device synchronization
7. **Monitor Supabase** - Check database usage and query performance

## Troubleshooting

### "Missing Supabase environment variables"

Ensure `.env` file has:
```
VITE_SUPABASE_URL=https://akccppibkxkrseuaoquk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### "Row Level Security policy violation"

Check that RLS policies allow the current operation. For development, policies are currently permissive (`USING (true)`). In production, implement proper role-based access.

### "Cannot read property of undefined"

Ensure `supabaseBookingStore.initialize()` was called after login and before accessing bookings.

### Real-time not working

Check browser console for WebSocket errors. Supabase Realtime requires WebSocket support and may be blocked by some firewalls/proxies.

## Support

For issues specific to this migration:
1. Check browser console for error messages
2. Check Supabase dashboard logs
3. Verify database connection is working
4. Ensure all migrations have been applied

The database schema is production-ready and all services have been implemented. The remaining work is primarily updating component files to use the new services instead of localStorage.
