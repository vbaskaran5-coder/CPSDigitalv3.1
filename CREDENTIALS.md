# Application Login Credentials

This document lists all default login credentials for the application's authentication system.

## Authentication Hierarchy

The application has a three-tiered authentication system:

1. **Business Panel** (Bootstrap/Root Level)
   - Creates and manages Console profiles
   - Creates and manages Route Manager profiles
   - Manages territories, seasons, and system settings
   - Hardcoded credentials for initial access

2. **Console** (Administrative Level)
   - Created by Business Panel users
   - Manages workers, bookings, and daily operations
   - Creates worker accounts for Digital Logsheet access

3. **Route Manager** (Operational Level)
   - Created by Business Panel users
   - Manages assigned territories and teams
   - Views and updates bookings for their routes

4. **Digital Logsheet** (Worker Level)
   - Created by Console users
   - Workers log into their assigned cart/route
   - Password is their first name (case-insensitive)

---

## Business Panel Login

**Access URL:** `/business-panel/login`

### Master Admin Account (Production Credential)

- **Username:** `MasterAdmin`
- **Password:** `CPS26@sympatico`
- **Role:** System Administrator
- **Permissions:** Full access to all features

**Note:** This is the sole bootstrap credential for the Business Panel in production. MasterAdmin creates all Console profiles, which in turn create Route Manager profiles and Worker accounts. No other Business Panel accounts exist at the root level.

---

## Console Login

**Access URL:** `/console/login`

Console accounts are **created through the Business Panel**. There are no hardcoded Console credentials.

### How to Create Console Accounts

1. Log into the Business Panel (see credentials above)
2. Navigate to "Console Profiles"
3. Click "Add Console Profile"
4. Enter profile details:
   - Title (e.g., "Main Office", "East Branch")
   - Username (for login)
   - Password (for login)
   - Region (East, West, or Central)
   - Enable/configure seasons
5. Save the profile

Once created, Console users can log in at `/console/login` with their assigned credentials.

---

## Route Manager Login

**Access URL:** `/route-manager/login`

Route Manager accounts are **created through the Business Panel**. There are no hardcoded Route Manager credentials.

### How to Create Route Manager Accounts

1. Log into the Business Panel
2. Navigate to "Route Manager Profiles"
3. Click "Add Route Manager"
4. Enter profile details:
   - First Name
   - Last Name
   - Username (for login)
   - Password (for login)
   - Optional: Link to Console Profile
5. Save the profile

Once created, Route Managers can log in at `/route-manager/login` with their assigned credentials.

---

## Digital Logsheet (Worker/Contractor Login)

**Access URL:** `/signin` (root login page)

Worker accounts are **created by Console users** through the Workerbook interface.

### Authentication Method

- **Contractor Number:** The worker's unique ID (e.g., "W123")
- **Password:** Worker's first name (case-insensitive)
  - Example: If worker's first name is "John", password is "john" (or "John", "JOHN", etc.)

### Requirements for Login

Workers can only log in if they meet these conditions:
1. They have been created in the system
2. They have been marked as "showed" (present) for today
3. Their `showedDate` matches the current date

This ensures only workers who are physically present and checked in can access the Digital Logsheet.

---

## Security Notes

### Development vs Production

**IMPORTANT:** All passwords in this document are stored in **plain text** in the database for development purposes only.

**Before deploying to production:**

1. Implement password hashing (bcrypt, argon2, etc.)
2. Update the `auth.service.ts` to compare hashed passwords
3. Change all default passwords to strong, unique values
4. Remove or secure this CREDENTIALS.md file
5. Implement password reset functionality
6. Add password complexity requirements
7. Consider implementing multi-factor authentication (MFA)

### Password Change Best Practices

For production systems:

- **Business Panel Admins:** Change immediately after first login
- **Console Users:** Use strong, unique passwords (minimum 12 characters)
- **Route Managers:** Use strong, unique passwords
- **Workers:** Consider a more secure authentication method (PIN, biometric, etc.)

### Row Level Security (RLS)

All authentication tables have Row Level Security enabled with policies that:
- Allow authenticated users to read and manage their relevant records
- Prevent unauthorized access to sensitive data
- Use Supabase's `authenticated` role for access control

---

## Troubleshooting Login Issues

### Business Panel Login Fails

1. Verify you're using the correct credentials:
   - Username: `MasterAdmin` / Password: `CPS26@sympatico`
2. Check browser console for error messages
3. Verify Supabase connection in `.env` file
4. Ensure `business_panel_users` table exists in database
5. Verify Row Level Security (RLS) policies allow anonymous SELECT for login

### Console Login Fails

1. Verify Console profile was created in Business Panel
2. Check username/password are correct (case-sensitive)
3. Verify the profile is active and not disabled
4. Check browser console for authentication errors

### Route Manager Login Fails

1. Verify Route Manager profile was created in Business Panel
2. Check username/password are correct (case-sensitive)
3. Ensure profile is properly linked to a Console profile (if required)

### Digital Logsheet Login Fails

Common issues:
- **"Invalid contractor number or not available for today"**
  - Worker hasn't been marked as "showed" in Console
  - Worker's `showedDate` doesn't match today
  - Contractor number is incorrect

- **"Invalid password"**
  - Password must be the worker's first name (case-insensitive)
  - Check for typos or extra spaces

---

## Database Tables

Authentication data is stored in these Supabase tables:

- `business_panel_users` - Business Panel admin accounts
- `console_profiles` - Console user profiles and settings
- `route_manager_profiles` - Route Manager accounts
- `workers` - Worker/contractor accounts and attendance

All tables have proper Row Level Security (RLS) policies configured.

---

## Quick Reference

| System | URL | Default Username | Default Password |
|--------|-----|------------------|------------------|
| Business Panel | `/business-panel/login` | `MasterAdmin` | `CPS26@sympatico` |
| Console | `/console/login` | *Created by Business Panel* | *Set during creation* |
| Route Manager | `/route-manager/login` | *Created by Business Panel* | *Set during creation* |
| Digital Logsheet | `/signin` | Contractor Number | Worker's First Name |

---

**Last Updated:** 2025-10-29

**For support or additional access, contact your system administrator.**
