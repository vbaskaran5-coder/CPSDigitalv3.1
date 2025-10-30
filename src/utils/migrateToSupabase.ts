import {
  ConsoleProfileService,
  RouteManagerService,
  WorkerService,
  TerritoryAssignmentService,
  TerritoryStructureService,
  ActiveSeasonService,
} from '../services/database.service';
import { STORAGE_KEYS, getStorageItem } from '../lib/localStorage';
import { ConsoleProfile, RouteManagerProfile, Worker } from '../types';

export async function migrateLocalStorageToSupabase(): Promise<{
  success: boolean;
  errors: string[];
  migrated: {
    consoleProfiles: number;
    routeManagers: number;
    workers: number;
    territoryAssignments: number;
  };
}> {
  const errors: string[] = [];
  const migrated = {
    consoleProfiles: 0,
    routeManagers: 0,
    workers: 0,
    territoryAssignments: 0,
  };

  console.log('Starting migration from localStorage to Supabase...');

  try {
    const consoleProfiles: ConsoleProfile[] = getStorageItem(STORAGE_KEYS.CONSOLE_PROFILES, []);
    console.log(`Found ${consoleProfiles.length} console profiles in localStorage`);

    for (const profile of consoleProfiles) {
      try {
        const existing = await ConsoleProfileService.getByUsername(profile.username);
        if (!existing) {
          await ConsoleProfileService.create(profile);
          migrated.consoleProfiles++;
          console.log(`Migrated console profile: ${profile.username}`);
        } else {
          console.log(`Console profile already exists: ${profile.username}`);
        }
      } catch (error) {
        const msg = `Failed to migrate console profile ${profile.username}: ${error}`;
        console.error(msg);
        errors.push(msg);
      }
    }
  } catch (error) {
    errors.push(`Failed to migrate console profiles: ${error}`);
  }

  try {
    const routeManagers: RouteManagerProfile[] = getStorageItem(STORAGE_KEYS.ROUTE_MANAGER_PROFILES, []);
    console.log(`Found ${routeManagers.length} route managers in localStorage`);

    for (const manager of routeManagers) {
      try {
        const existing = await RouteManagerService.getByUsername(manager.username);
        if (!existing) {
          await RouteManagerService.create(manager);
          migrated.routeManagers++;
          console.log(`Migrated route manager: ${manager.username}`);
        } else {
          console.log(`Route manager already exists: ${manager.username}`);
        }
      } catch (error) {
        const msg = `Failed to migrate route manager ${manager.username}: ${error}`;
        console.error(msg);
        errors.push(msg);
      }
    }
  } catch (error) {
    errors.push(`Failed to migrate route managers: ${error}`);
  }

  try {
    const workers: Worker[] = getStorageItem(STORAGE_KEYS.CONSOLE_WORKERS, []);
    console.log(`Found ${workers.length} workers in localStorage`);

    for (const worker of workers) {
      try {
        const existing = await WorkerService.getById(worker.contractorId);
        if (!existing) {
          await WorkerService.create(worker);
          migrated.workers++;
          console.log(`Migrated worker: ${worker.contractorId}`);
        } else {
          console.log(`Worker already exists: ${worker.contractorId}`);
        }
      } catch (error) {
        const msg = `Failed to migrate worker ${worker.contractorId}: ${error}`;
        console.error(msg);
        errors.push(msg);
      }
    }
  } catch (error) {
    errors.push(`Failed to migrate workers: ${error}`);
  }

  try {
    const territoryAssignments: Record<string, number[]> = getStorageItem(
      STORAGE_KEYS.TERRITORY_ASSIGNMENTS,
      {}
    );
    console.log(`Found ${Object.keys(territoryAssignments).length} territory assignments in localStorage`);

    await TerritoryAssignmentService.bulkSet(territoryAssignments);
    migrated.territoryAssignments = Object.keys(territoryAssignments).length;
    console.log('Migrated territory assignments');
  } catch (error) {
    errors.push(`Failed to migrate territory assignments: ${error}`);
  }

  try {
    const eastTerritory = getStorageItem(STORAGE_KEYS.EAST_TERRITORY_STRUCTURE, null);
    if (eastTerritory && Object.keys(eastTerritory).length > 0) {
      await TerritoryStructureService.set('East', eastTerritory);
      console.log('Migrated East territory structure');
    }
  } catch (error) {
    errors.push(`Failed to migrate territory structure: ${error}`);
  }

  const success = errors.length === 0;
  console.log('Migration complete:', { success, errors, migrated });

  return { success, errors, migrated };
}

export async function clearLocalStorageData(confirm: boolean = false): Promise<void> {
  if (!confirm) {
    throw new Error('Must explicitly confirm clearing localStorage data');
  }

  console.log('Clearing localStorage data...');

  const keysToKeep = ['auth_session'];

  Object.values(STORAGE_KEYS).forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  console.log('localStorage data cleared (except session)');
}
