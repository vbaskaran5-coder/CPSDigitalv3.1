import { AuthService } from '../services/auth.service';
import { ActiveSeasonService, ConsoleProfileService } from '../services/database.service';

export class SessionState {
  static async getActiveSeasonId(): Promise<string | null> {
    const session = await AuthService.getSession();
    if (!session || session.userType !== 'console') {
      return null;
    }

    try {
      const data = await ActiveSeasonService.get(session.userId as number);
      return data?.activeSeasonId || null;
    } catch (error) {
      console.error('Error getting active season:', error);
      return null;
    }
  }

  static async setActiveSeasonId(seasonId: string): Promise<void> {
    const session = await AuthService.getSession();
    if (!session || session.userType !== 'console') {
      throw new Error('Console authentication required');
    }

    await ActiveSeasonService.set(session.userId as number, seasonId);
    window.dispatchEvent(new CustomEvent('activeSeasonChanged', { detail: { seasonId } }));
  }

  static async getCurrentConsoleProfile() {
    const session = await AuthService.getSession();
    if (!session || session.userType !== 'console') {
      return null;
    }

    try {
      return await ConsoleProfileService.getById(session.userId as number);
    } catch (error) {
      console.error('Error getting console profile:', error);
      return null;
    }
  }
}
