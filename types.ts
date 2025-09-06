
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  online: boolean;
  friends?: string[]; // Array of user IDs
  friendRequestsSent?: string[]; // Array of user IDs
  friendRequestsReceived?: string[]; // Array of user IDs
}

export type ReactionType = 'like' | 'love' | 'laugh';

export interface Reaction {
  userId: string;
  emoji: ReactionType;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
  reactions: Reaction[];
}

export interface Chat {
  id:string;
  users: User[];
  userIds: string[];
  messages: Message[];
  unreadCount: number;
}

export type StoryType = 'image';

export interface StoryItem {
  id: string;
  type: StoryType;
  url: string;
  duration: number; // in seconds
}

export interface UserStory {
  userId: string;
  stories: StoryItem[];
  viewedBy: string[]; // array of user IDs
}

export interface FriendRequest {
    id: string;
    fromId: string;
    toId: string;
    status: 'pending' | 'accepted' | 'declined';
    fromUser?: User; // Optional, to be populated for UI
}

// FIX: Add missing type definitions used in firebase/services.ts
export interface SignUpData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}
