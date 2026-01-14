import type { Chat, FriendRequest, Message, UserStory } from '../types';

/**
 * Typed realtime events used by the mock WebSocket layer.
 * These payloads are designed to be serializable so they can travel over BroadcastChannel/WebSocket.
 */

export type RealtimeEventName =
  | 'MessageCreated'
  | 'FriendRequestCreated'
  | 'FriendRequestUpdated'
  | 'ChatUpdated'
  | 'NotificationCountUpdated'
  | 'StoryUpdated';

export interface RealtimeEnvelope<TName extends RealtimeEventName, TPayload> {
  event: TName;
  payload: TPayload;
  /** Unique ID to help avoid self-processing / duplication. */
  id: string;
  /** Epoch ms */
  ts: number;
  /** Optional sender identifier (tab/client). */
  senderId?: string;
}

export type MessageCreatedPayload = {
  chatId: string;
  message: Message;
  /** The user who created the message. */
  senderUserId: string;
};

export type FriendRequestCreatedPayload = {
  fromId: string;
  toId: string;
};

export type FriendRequestUpdatedPayload = {
  fromId: string;
  toId: string;
  status: 'accepted' | 'declined';
  /** If accepted, the new chat id may be included. */
  chatId?: string;
};

export type ChatUpdatedPayload = {
  chatId: string;
  /** Optional hints so listeners can decide whether to refetch. */
  reason: 'message' | 'friendship' | 'metadata';
};

export type NotificationCountUpdatedPayload = {
  userId: string;
  notificationCount: number;
};

export type StoryUpdatedPayload = {
  userId: string;
  story: UserStory;
};

export type RealtimeEventMap = {
  MessageCreated: MessageCreatedPayload;
  FriendRequestCreated: FriendRequestCreatedPayload;
  FriendRequestUpdated: FriendRequestUpdatedPayload;
  ChatUpdated: ChatUpdatedPayload;
  NotificationCountUpdated: NotificationCountUpdatedPayload;
  StoryUpdated: StoryUpdatedPayload;
};

// Convenience helpers for other modules
export type AnyRealtimeEnvelope = RealtimeEnvelope<RealtimeEventName, any>;
export type Handler<TName extends RealtimeEventName> = (payload: RealtimeEventMap[TName]) => void;

// Light “types” that match the user request naming
export type MessageCreated = MessageCreatedPayload;
export type FriendRequestCreated = FriendRequestCreatedPayload;
export type FriendRequestUpdated = FriendRequestUpdatedPayload;
export type ChatUpdated = ChatUpdatedPayload;
export type NotificationCountUpdated = NotificationCountUpdatedPayload;
export type StoryUpdated = StoryUpdatedPayload;

/**
 * Optional helper types that could be used by future work.
 * Included to match the requested list, though the app currently uses ChatUpdated.
 */
export type ChatUpdatedOrSnapshot = {
  chatId: string;
  chat?: Chat;
  reason: ChatUpdatedPayload['reason'];
};
