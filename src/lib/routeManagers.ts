import { getStorageItem, STORAGE_KEYS } from './localStorage';

export interface RouteManager {
  name: string;
  initials: string;
}

export const getAssignableRouteManagers = (): RouteManager[] => {
  // 1. Get the title of the currently logged-in admin console user
  const adminTitle = getStorageItem(STORAGE_KEYS.ADMIN, '');
  if (!adminTitle) {
    return [{ name: 'Unassigned', initials: '' }];
  }

  // 2. Find the ID of that console profile
  const consoleProfiles = getStorageItem(STORAGE_KEYS.CONSOLE_PROFILES, []);
  const currentConsoleProfile = consoleProfiles.find(
    (p: any) => p.title === adminTitle
  );
  if (!currentConsoleProfile) {
    return [{ name: 'Unassigned', initials: '' }];
  }
  const currentConsoleProfileId = currentConsoleProfile.id;

  // 3. Get all route manager profiles
  const allRouteManagerProfiles = getStorageItem(
    STORAGE_KEYS.ROUTE_MANAGER_PROFILES,
    []
  );

  // 4. Filter for route managers assigned to the current console profile
  const assignedManagers = allRouteManagerProfiles.filter(
    (rm: any) => rm.consoleProfileId === currentConsoleProfileId
  );

  // 5. Format the data for the UI and add an 'Unassigned' option
  const formattedManagers: RouteManager[] = assignedManagers.map((rm: any) => ({
    name: `${rm.firstName} ${rm.lastName}`,
    initials: `${rm.firstName[0] || ''}${rm.lastName[0] || ''}`.toUpperCase(),
  }));

  return [{ name: 'Unassigned', initials: '' }, ...formattedManagers];
};
