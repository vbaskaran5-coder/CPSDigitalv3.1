import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export function subscribeToTable<T = any>(
  table: string,
  callback: (payload: { eventType: string; new: T; old: T }) => void,
  filter?: string
): RealtimeSubscription {
  let channelName = `public:${table}`;
  if (filter) {
    channelName += `:${filter}`;
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new as T,
          old: payload.old as T,
        });
      }
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}