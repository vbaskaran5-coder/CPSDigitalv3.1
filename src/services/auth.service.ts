import { ConsoleProfile, RouteManagerProfile } from '../types';
import { ConsoleProfileService, RouteManagerService } from './database.service';
import { supabase } from '../lib/supabase';

export type UserType = 'console' | 'route_manager' | 'business_panel' | 'worker';

export interface AuthSession {
  userType: UserType;
  userId: number | string;
  username: string;
  profile: ConsoleProfile | RouteManagerProfile | any;
}

export class AuthService {
  private static currentSession: AuthSession | null = null;
  private static sessionInitialized = false;

  private static async initializeSession(): Promise<void> {
    if (this.sessionInitialized) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const metadata = session.user.user_metadata;
      if (metadata?.authSession) {
        this.currentSession = metadata.authSession;
      }
    }
    this.sessionInitialized = true;
  }

  static async loginConsole(username: string, password: string): Promise<AuthSession> {
    try {
      const profile = await ConsoleProfileService.getByUsername(username);

      if (!profile) {
        throw new Error('Invalid username or password');
      }

      if (profile.password !== password) {
        throw new Error('Invalid username or password');
      }

      const session: AuthSession = {
        userType: 'console',
        userId: profile.id,
        username: profile.username,
        profile,
      };

      await this.saveSession(session);
      return session;
    } catch (error) {
      console.error('Console login failed:', error);
      throw error;
    }
  }

  static async loginRouteManager(username: string, password: string): Promise<AuthSession> {
    try {
      const profile = await RouteManagerService.getByUsername(username);

      if (!profile) {
        throw new Error('Invalid username or password');
      }

      if (profile.password !== password) {
        throw new Error('Invalid username or password');
      }

      const session: AuthSession = {
        userType: 'route_manager',
        userId: profile.id,
        username: profile.username,
        profile,
      };

      await this.saveSession(session);
      return session;
    } catch (error) {
      console.error('Route manager login failed:', error);
      throw error;
    }
  }

  static async loginBusinessPanel(username: string, password: string): Promise<AuthSession> {
    try {
      const { data, error } = await supabase
        .from('business_panel_users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error('Invalid username or password');
      }

      if (data.password !== password) {
        throw new Error('Invalid username or password');
      }

      const session: AuthSession = {
        userType: 'business_panel',
        userId: data.id,
        username: data.username,
        profile: data,
      };

      await this.saveSession(session);
      return session;
    } catch (error) {
      console.error('Business panel login failed:', error);
      throw error;
    }
  }

  static async loginWorker(workerId: string, workerData: any, sessionType: 'contractor' | 'cart_worker', cartId?: number): Promise<AuthSession> {
    try {
      const { WorkerSessionService } = await import('./database.service');

      const sessionId = await WorkerSessionService.create(workerId, sessionType, cartId, workerData);

      const session: AuthSession = {
        userType: 'worker',
        userId: workerId,
        username: workerId,
        profile: { ...workerData, sessionId, sessionType, cartId },
      };

      await this.saveSession(session);
      return session;
    } catch (error) {
      console.error('Worker login failed:', error);
      throw error;
    }
  }

  private static async saveSession(session: AuthSession): Promise<void> {
    this.currentSession = session;

    const { error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          authSession: session
        }
      }
    });

    if (error) {
      console.error('Failed to save session to Supabase:', error);
    }

    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: session }));
  }

  static async logout(): Promise<void> {
    if (this.currentSession?.userType === 'worker' && this.currentSession.profile?.sessionId) {
      try {
        const { WorkerSessionService } = await import('./database.service');
        await WorkerSessionService.delete(this.currentSession.profile.sessionId);
      } catch (error) {
        console.error('Failed to cleanup worker session:', error);
      }
    }

    this.currentSession = null;
    await supabase.auth.signOut();
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: null }));
  }

  static async getSession(): Promise<AuthSession | null> {
    if (this.currentSession) {
      return this.currentSession;
    }

    await this.initializeSession();
    return this.currentSession;
  }

  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  static async requireConsoleAuth(): Promise<ConsoleProfile> {
    const session = await this.getSession();
    if (!session || session.userType !== 'console') {
      throw new Error('Console authentication required');
    }
    return session.profile as ConsoleProfile;
  }

  static async requireRouteManagerAuth(): Promise<RouteManagerProfile> {
    const session = await this.getSession();
    if (!session || session.userType !== 'route_manager') {
      throw new Error('Route manager authentication required');
    }
    return session.profile as RouteManagerProfile;
  }

  static async requireBusinessPanelAuth(): Promise<any> {
    const session = await this.getSession();
    if (!session || session.userType !== 'business_panel') {
      throw new Error('Business panel authentication required');
    }
    return session.profile;
  }

  static async requireWorkerAuth(): Promise<any> {
    const session = await this.getSession();
    if (!session || session.userType !== 'worker') {
      throw new Error('Worker authentication required');
    }
    return session.profile;
  }

  static async refreshProfile(): Promise<void> {
    const session = await this.getSession();
    if (!session) return;

    try {
      if (session.userType === 'console') {
        const profile = await ConsoleProfileService.getById(session.userId as number);
        if (profile) {
          session.profile = profile;
          await this.saveSession(session);
        }
      } else if (session.userType === 'route_manager') {
        const profile = await RouteManagerService.getById(session.userId as number);
        if (profile) {
          session.profile = profile;
          await this.saveSession(session);
        }
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }

  static getSessionSync(): AuthSession | null {
    return this.currentSession;
  }
}
