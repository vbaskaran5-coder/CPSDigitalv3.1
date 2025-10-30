# Application Architecture - Supabase Migration

## Current State

Your application now has **dual architecture**:

1. **Legacy System** (localStorage-based) - Still functional
2. **New System** (Supabase-based) - Ready for integration

## New File Structure

```
src/
├── lib/
│   ├── supabase.ts                    # Supabase client & realtime helpers
│   ├── supabaseHelpers.ts             # Data transformation utilities
│   ├── localStorage.ts                # (Legacy) Keep for session storage
│   ├── hardcodedData.ts               # (Keep) Season/service definitions
│   └── dataSyncService.ts             # (Legacy) Can be deprecated
│
├── services/
│   ├── database.service.ts            # NEW: All database CRUD operations
│   └── auth.service.ts                # NEW: Authentication & session mgmt
│
├── stores/
│   ├── AdminBookingStore.ts           # (Legacy) localStorage-based
│   └── SupabaseBookingStore.ts        # NEW: Supabase-based
│
└── utils/
    └── migrateToSupabase.ts           # One-time migration utility
```

## Service Architecture

### 1. Database Services (`/src/services/database.service.ts`)

**BookingService** - Master bookings
- `getAll(seasonId?)` - Get all bookings, optionally filtered by season
- `getByContractor(contractorNumber, seasonId?)` - Get bookings for contractor
- `getByRoute(routeNumber, seasonId?)` - Get bookings for route
- `getByMap(masterMap, seasonId?)` - Get bookings for map
- `getByMaps(masterMaps[], seasonId?)` - Get bookings for multiple maps
- `getById(bookingId)` - Get single booking
- `create(booking)` - Create new booking
- `update(bookingId, updates)` - Update booking
- `delete(bookingId)` - Delete booking
- `bulkInsert(bookings[])` - Insert multiple bookings
- `deleteBySeasonId(seasonId)` - Delete all bookings for season
- `subscribe(callback, seasonId?)` - Real-time updates

**WorkerService** - Workers/contractors
- `getAll()` - Get all workers
- `getById(contractorId)` - Get single worker
- `getByBookingStatus(status)` - Get workers by booking status
- `getByCartId(cartId)` - Get workers assigned to cart
- `create(worker)` - Create new worker
- `update(contractorId, updates)` - Update worker
- `delete(contractorId)` - Delete worker
- `bulkInsert(workers[])` - Insert multiple workers
- `subscribe(callback)` - Real-time updates

**ConsoleProfileService** - Console user profiles
- `getAll()` - Get all profiles
- `getById(id)` - Get profile by ID
- `getByUsername(username)` - Get profile by username
- `getByTitle(title)` - Get profile by title
- `create(profile)` - Create new profile
- `update(id, updates)` - Update profile
- `delete(id)` - Delete profile
- `subscribe(callback)` - Real-time updates

**RouteManagerService** - Route manager profiles
- `getAll()` - Get all route managers
- `getById(id)` - Get route manager by ID
- `getByUsername(username)` - Get by username
- `getByConsoleProfileId(id)` - Get RMs for console profile
- `create(profile)` - Create new route manager
- `update(id, updates)` - Update route manager
- `delete(id)` - Delete route manager

**CartService** - Team carts
- `getAll()` - Get all carts
- `getById(id)` - Get cart by ID
- `create(cart)` - Create new cart
- `update(id, updates)` - Update cart
- `delete(id)` - Delete cart

**RouteAssignmentService** - Daily route assignments
- `getByDate(date)` - Get all assignments for date
- `setAssignment(routeCode, workerId, date)` - Assign route to worker
- `deleteAssignment(routeCode, date)` - Remove assignment
- `bulkSet(assignments, date)` - Set all assignments for date

**TerritoryAssignmentService** - Map territory assignments
- `getAll()` - Get all territory assignments
- `setAssignment(mapName, profileIds[])` - Assign map to profiles
- `deleteAssignment(mapName)` - Remove assignment
- `bulkSet(assignments)` - Set all assignments

**TerritoryStructureService** - Territory structure cache
- `get(region)` - Get structure for region (East/West/Central)
- `set(region, structure)` - Cache structure for region

**ActiveSeasonService** - Active season per console profile
- `get(consoleProfileId)` - Get active season ID
- `set(consoleProfileId, seasonId)` - Set active season

### 2. Authentication Service (`/src/services/auth.service.ts`)

**AuthService** - User authentication
- `loginConsole(username, password)` - Console user login
- `loginRouteManager(username, password)` - Route manager login
- `loginBusinessPanel(username, password)` - Business panel login
- `logout()` - Clear session
- `getSession()` - Get current session
- `isAuthenticated()` - Check if user is logged in
- `requireConsoleAuth()` - Ensure console user (throws if not)
- `requireRouteManagerAuth()` - Ensure route manager (throws if not)
- `requireBusinessPanelAuth()` - Ensure business panel user (throws if not)
- `refreshProfile()` - Reload current user's profile from database

### 3. Booking Store (`/src/stores/SupabaseBookingStore.ts`)

**SupabaseBookingStore** - Centralized booking management
- `initialize(consoleProfileId)` - Initialize for logged-in console user
- `switchSeason(seasonId)` - Change active season
- `refreshTerritoryAssignments()` - Reload territory data
- `getAllBookings()` - Get filtered bookings for current user
- `getBookingsForContractor(contractorNumber)` - Get contractor's bookings
- `getBookingById(bookingId)` - Get single booking
- `updateBooking(bookingId, updates)` - Update booking
- `addBooking(bookingData)` - Create new booking
- `completeBooking(bookingId, paymentMethod, isPaid)` - Mark booking complete
- `cancelBooking(bookingId)` - Cancel booking
- `replaceAllBookingsForSeason(bookings[], seasonId)` - Bulk replace
- `cleanup()` - Unsubscribe from realtime

## Data Flow

### Login Flow

```
User enters credentials
    ↓
AuthService.loginConsole(username, password)
    ↓
Query console_profiles table
    ↓
Validate password
    ↓
Create session object
    ↓
Save to localStorage
    ↓
supabaseBookingStore.initialize(consoleProfileId)
    ↓
Load territory assignments from database
    ↓
Load active season from database
    ↓
Load bookings for active season
    ↓
Subscribe to realtime updates
    ↓
User is logged in and ready
```

### Adding a Booking

```
User fills out booking form
    ↓
supabaseBookingStore.addBooking(bookingData)
    ↓
Generate unique booking ID
    ↓
Add season_id to booking
    ↓
BookingService.create(booking)
    ↓
Supabase INSERT operation
    ↓
Database triggers realtime event
    ↓
All subscribed clients receive update
    ↓
Local cache refreshed automatically
    ↓
UI updates on all devices
```

### Real-Time Synchronization

```
Device A: User updates booking
    ↓
BookingService.update(bookingId, changes)
    ↓
Supabase UPDATE operation
    ↓
Database row updated
    ↓
Realtime event broadcast to all subscribers
    ↓
Device B: Receives realtime event
    ↓
Callback triggered in subscription
    ↓
SupabaseBookingStore syncs from database
    ↓
'bookingStoreRefreshed' event fired
    ↓
UI components refresh
    ↓
Device B shows updated data
```

## Database Schema Overview

### Core Tables

**console_profiles**
- Stores console user accounts
- Links to seasons via JSONB
- Links to territory assignments
- Links to active season settings

**workers**
- Contractor/worker profiles
- Attendance tracking
- Payout calculations
- Assignment tracking (route_manager, cart_id)

**master_bookings**
- All job bookings (pre-booked & same-day)
- Customer information
- Job details and status
- Payment tracking
- Associated with season_id

### Assignment Tables

**route_assignments**
- Daily route → worker assignments
- Primary key: (route_code, assignment_date)
- Foreign key to workers table

**map_assignments**
- Daily map → route manager assignments
- Primary key: (assignment_key, assignment_date)
- Stores route manager info as JSONB

**territory_assignments**
- Master map → console profile assignments
- Primary key: map_name
- Stores array of console profile IDs

### Configuration Tables

**territory_structure**
- Cached territory data (Group → Map → Routes)
- One row per region (East, West, Central)
- Stores structure as JSONB

**services_catalog**
- Available services (aeration, dethatching, etc.)
- Service options and pricing
- Used for building contracts/upsells

**upsell_menus**
- Contract/upsell menu definitions
- Questions stored as JSONB array

**payout_logic_settings**
- Payout calculation rules
- Per console profile and season
- Settings stored as JSONB

**active_season_settings**
- Current active season per console profile
- Enables multi-device consistency
- One row per console profile

## Migration Strategy

### Phase 1: Foundation (COMPLETED)

- ✅ Database schema created
- ✅ Supabase client configured
- ✅ Service layer built
- ✅ Authentication service created
- ✅ New booking store created
- ✅ Migration utility created

### Phase 2: Data Migration (TODO)

1. Run migration utility to copy data
2. Verify data integrity in Supabase
3. Test all CRUD operations
4. Test realtime subscriptions

### Phase 3: Component Updates (TODO)

1. Update login pages (Console, RM, Business Panel)
2. Update booking pages
3. Update worker management pages
4. Update assignment pages
5. Update territory management

### Phase 4: Testing (TODO)

1. Single-user testing
2. Multi-device testing
3. Real-time sync testing
4. Performance testing

### Phase 5: Deployment (TODO)

1. Deploy to Vercel
2. Monitor database usage
3. Optimize queries if needed
4. Remove localStorage fallbacks

## Key Differences from localStorage

| Aspect | localStorage | Supabase |
|--------|-------------|----------|
| Data Location | Browser only | Cloud database |
| Multi-Device | No sync | Automatic sync |
| Real-Time | Manual refresh | Automatic updates |
| Data Persistence | Per device | Centralized |
| Querying | Client-side filter | Server-side SQL |
| Performance | Fast (local) | Fast (indexed) |
| Data Limits | ~10MB | Unlimited |
| Backup | Manual export | Automatic |
| Collaboration | Single user | Multi-user |

## Important Notes

1. **Session Management**: Sessions are still cached in localStorage for performance, but validated against database.

2. **Backward Compatibility**: The old localStorage system remains functional. You can switch back if needed.

3. **Real-Time Costs**: Supabase Realtime has usage limits. Monitor your Realtime connections in the Supabase dashboard.

4. **RLS Policies**: Currently permissive for development. Implement proper role-based access control before production.

5. **Data Transformation**: All database operations automatically transform between snake_case (database) and camelCase/Title Case (application).

6. **Error Handling**: All service methods throw errors. Always use try-catch blocks.

## Performance Optimization

### Caching Strategy

- Active bookings cached in `SupabaseBookingStore`
- Territory structure cached in database
- User session cached in localStorage
- Real-time updates refresh caches automatically

### Query Optimization

- Use `getByMaps()` instead of multiple `getByMap()` calls
- Use `bulkInsert()` for multiple bookings
- Use `bulkSet()` for assignment updates
- All queries use database indexes

### Connection Management

- Single Supabase client instance
- Real-time subscription per active season
- Automatic reconnection on disconnect
- Cleanup on logout/season switch

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all tables
2. Current policies are permissive for development
3. Implement proper policies before production:
   - Console users see only their assigned territories
   - Route managers see only their teams
   - Workers see only their own bookings
4. Passwords are stored in plain text (for development)
   - Implement bcrypt hashing before production
5. Session tokens stored in localStorage
   - Consider using Supabase Auth for production

## Next Steps

See `SUPABASE_MIGRATION_GUIDE.md` for detailed migration instructions.
