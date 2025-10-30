import { AuthService } from '../services/auth.service';
import { RouteManagerService } from '../services/database.service';

export interface RouteManager {
  name: string;
  initials: string;
}

export const getAssignableRouteManagers = async (): Promise<RouteManager[]> => {
  try {
    const session = await AuthService.getSession();

    if (!session || session.userType !== 'console') {
      return [{ name: 'Unassigned', initials: '' }];
    }

    const currentConsoleProfileId = session.userId as number;
    const assignedManagers = await RouteManagerService.getByConsoleProfile(currentConsoleProfileId);

    const formattedManagers: RouteManager[] = assignedManagers.map((rm) => ({
      name: `${rm.firstName} ${rm.lastName}`,
      initials: `${rm.firstName[0] || ''}${rm.lastName[0] || ''}`.toUpperCase(),
    }));

    return [{ name: 'Unassigned', initials: '' }, ...formattedManagers];
  } catch (error) {
    console.error('Error fetching route managers:', error);
    return [{ name: 'Unassigned', initials: '' }];
  }
};
