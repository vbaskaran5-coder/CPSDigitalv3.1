import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { Channel, Message } from './database.types';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  /**
   * Hardcoded user ID for this example.
   * In a real app, you would get this from your auth service (e.g., after login).
   */
  private readonly USER_ID = '1';

  constructor() {}

  /**
   * Fetches the hardcoded user ID.
   */
  getUserId(): string {
    return this.USER_ID;
  }

  /**
   * Fetches a list of all channels.
   * @returns A promise that resolves to an array of Channel objects.
   */
  async getChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching channels:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Fetches all messages for a specific channel.
   * @param channelId The ID of the channel to fetch messages for.
   * @returns A promise that resolves to an array of Message objects.
   */
  async getMessages(channelId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Creates a new message in the database.
   * @param content The text content of the message.
   * @param channelId The ID of the channel the message belongs to.
   * @param userId The ID of the user sending the message.
   * @returns A promise that resolves to the newly created Message object.
   */
  async createMessage(
    content: string,
    channelId: number,
    userId: string
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: content,
        channel_id: channelId,
        user_id: userId,
      })
      .select()
      .single(); // .single() selects and returns the newly created row

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return data;
  }

  /**
   * Creates a new channel in the database.
   * @param name The name of the new channel.
   * @param description A brief description of the new channel.
   * @param userId The ID of the user creating the channel.
   * @returns A promise that resolves to the newly created Channel object.
   */
  async createChannel(
    name: string,
    description: string,
    userId: string
  ): Promise<Channel | null> {
    const { data, error } = await supabase
      .from('channels')
      .insert({
        name: name,
        description: description,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating channel:', error);
      return null;
    }

    return data;
  }
}
