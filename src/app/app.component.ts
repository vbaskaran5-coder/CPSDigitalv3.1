import { Injectable, computed, signal, effect } from '@angular/core';
import { Channel, Message } from './database.types';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // --- State Signals ---

  /**
   * The list of all available channels.
   */
  channels = signal<Channel[]>([]);

  /**
   * The list of messages for the currently selected channel.
   */
  messages = signal<Message[]>([]);

  /**
   * The ID of the currently selected channel.
   */
  currentChannelId = signal<number | null>(null);

  /**
   * The hardcoded user ID.
   */
  userId: string;

  // --- Computed Signals (Selectors) ---

  /**
   * Derives the currently selected Channel object from the channel list and the current ID.
   */
  currentChannel = computed(() => {
    const channels = this.channels();
    const channelId = this.currentChannelId();
    if (!channelId) {
      return null;
    }
    return channels.find((c) => c.id === channelId) ?? null;
  });

  constructor(private databaseService: DatabaseService) {
    // Get the hardcoded user ID from the database service
    this.userId = this.databaseService.getUserId();

    // Load initial channel data when the service is created
    this.loadInitialData();

    // Effect to log channel changes (optional, for debugging)
    effect(() => {
      console.log('Current Channel ID:', this.currentChannelId());
    });
  }

  /**
   * Fetches the initial list of channels from the database.
   */
  async loadInitialData() {
    const channels = await this.databaseService.getChannels();
    this.channels.set(channels);

    // Automatically select the first channel if one exists
    if (channels.length > 0) {
      this.selectChannel(channels[0].id);
    }
  }

  /**
   * Selects a channel and fetches its corresponding messages.
   * @param channelId The ID of the channel to select.
   */
  async selectChannel(channelId: number) {
    // Set the current channel ID
    this.currentChannelId.set(channelId);

    // Fetch messages for the newly selected channel
    const messages = await this.databaseService.getMessages(channelId);
    this.messages.set(messages);
  }

  /**
   * Sends a new message by creating it in the database.
   * @param content The text content of the message.
   */
  async sendMessage(content: string) {
    const channelId = this.currentChannelId();
    if (!content || !channelId) {
      return; // Do nothing if there's no message content or selected channel
    }

    // Create the message in the database
    const newMessage = await this.databaseService.createMessage(
      content,
      channelId,
      this.userId
    );

    if (newMessage) {
      // Add the new message to the local state
      this.messages.update((messages) => [...messages, newMessage]);
    }
  }

  /**
   * Creates a new channel in the database.
   * @param name The name for the new channel.
   * @param description A brief description for the new channel.
   */
  async addChannel(name: string, description: string) {
    if (!name || !description) {
      return; // Do nothing if fields are empty
    }

    // Create the channel in the database
    const newChannel = await this.databaseService.createChannel(
      name,
      description,
      this.userId
    );

    if (newChannel) {
      // Add the new channel to the local state and select it
      this.channels.update((channels) => [...channels, newChannel]);
      this.selectChannel(newChannel.id);
    }
  }
}
