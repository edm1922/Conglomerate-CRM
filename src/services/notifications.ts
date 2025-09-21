import { supabase } from "./supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Notification {
    id: string;
    message: string;
    created_at: string;
    user_id: string;
    read: boolean;
}

export interface NotificationPayload {
  new: Notification;
  eventType: 'INSERT';
  schema: 'public';
  table: 'notifications';
}

type NotificationCallback = (payload: NotificationPayload) => void;

let channel: RealtimeChannel | null = null;

export function subscribeToNotifications(callback: NotificationCallback): RealtimeChannel {
  if (channel) {
    channel.off('postgres_changes').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      callback
    );
    return channel;
  }
  
  channel = supabase
    .channel('realtime-notifications')
    .on<NotificationPayload>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      callback
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromNotifications() {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
}

export async function createNotification(message: string, userId: string): Promise<void> {
    const { error } = await supabase.from('notifications').insert({ message, user_id: userId });
    if (error) {
        throw new Error(`Error creating notification: ${error.message}`);
    }
}
