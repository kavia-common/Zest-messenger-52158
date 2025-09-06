import type { User, Chat, Message, UserStory, FriendRequest, SignUpData, LoginData } from '../types';

// --- MOCK DATABASE ---
// In a real app, this data would live in a MongoDB Atlas database.
// We are cloning the data to prevent direct mutation from services.
const initialData = {
  users: [
    {
      id: 'user-me',
      name: 'Rohan Shrestha',
      email: 'rohan@example.com',
      password: 'password123', // Passwords would be hashed in a real DB
      avatarUrl: 'https://picsum.photos/seed/rohan/200',
      bio: 'Frontend Developer | React & TypeScript',
      online: true,
      friends: ['user-1'],
      friendRequestsSent: ['user-2'],
      friendRequestsReceived: ['user-3'],
    },
    {
      id: 'user-1',
      name: 'Sunita Rai',
      email: 'sunita@example.com',
      password: 'password123',
      avatarUrl: 'https://picsum.photos/seed/sunita/200',
      bio: 'Loves trekking in the Himalayas.',
      online: true,
      friends: ['user-me'],
      friendRequestsSent: [],
      friendRequestsReceived: [],
    },
    {
      id: 'user-2',
      name: 'Bikram Thapa',
      email: 'bikram@example.com',
      password: 'password123',
      avatarUrl: 'https://picsum.photos/seed/bikram/200',
      bio: 'Photographer and artist.',
      online: false,
      friends: [],
      friendRequestsSent: [],
      friendRequestsReceived: [],
    },
    {
      id: 'user-3',
      name: 'Anjali Gurung',
      email: 'anjali@example.com',
      password: 'password123',
      avatarUrl: 'https://picsum.photos/seed/anjali/200',
      bio: 'Exploring new cafes in Kathmandu.',
      online: true,
      friends: [],
      friendRequestsSent: [],
      friendRequestsReceived: [],
    },
    {
      id: 'user-google',
      name: 'Google User',
      email: 'google@example.com',
      password: 'password123',
      avatarUrl: 'https://picsum.photos/seed/guser/200',
      bio: 'Signed in with Google!',
      online: true,
      friends: [], friendRequestsSent: [], friendRequestsReceived: [],
    }
  ],
  messages: [
      { id: 'msg-1', senderId: 'user-1', text: 'Hey Rohan! How are you?', timestamp: Date.now() - 1000 * 60 * 5, reactions: [] },
      { id: 'msg-2', senderId: 'user-me', text: 'I am good, Sunita! Just working on this cool messenger app. How about you?', timestamp: Date.now() - 1000 * 60 * 4, reactions: [] },
      { id: 'msg-3', senderId: 'user-1', text: 'That sounds awesome! I am planning a trip to Pokhara this weekend.', timestamp: Date.now() - 1000 * 60 * 3, reactions: [{ userId: 'user-me', emoji: 'like' }] },
      { id: 'msg-4', senderId: 'user-me', imageUrl: 'https://picsum.photos/seed/pokhara/400/300', text: 'Wow, have fun! It is beautiful there.', timestamp: Date.now() - 1000 * 60 * 2, reactions: [] },
  ],
  chats: [
    {
      id: 'chat-1',
      userIds: ['user-me', 'user-1'],
      messages: ['msg-1', 'msg-2', 'msg-3', 'msg-4'], // Using message IDs
      unreadCount: 1,
    },
  ],
  stories: [
    { 
      userId: 'user-1',
      stories: [
        { id: 'story-1-1', type: 'image', url: 'https://picsum.photos/seed/story1/1080/1920', duration: 5 },
        { id: 'story-1-2', type: 'image', url: 'https://picsum.photos/seed/story2/1080/1920', duration: 5 },
      ],
      viewedBy: [] 
    },
    { 
      userId: 'user-3',
      stories: [
        { id: 'story-3-1', type: 'image', url: 'https://picsum.photos/seed/story3/1080/1920', duration: 5 },
      ],
      viewedBy: ['user-me'] 
    },
  ]
};

// Deep copy to simulate a fresh database on each load
let mockDB = JSON.parse(JSON.stringify(initialData));

// --- HELPER FUNCTIONS ---
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- AUTHENTICATION SERVICES ---

export const handleSignUp = async ({ name, email, password }: SignUpData): Promise<User> => {
  await simulateDelay(500);
  if (mockDB.users.find(u => u.email === email)) {
    throw new Error("User with this email already exists.");
  }
  // FIX: The original code had a type error because the 'User' type does not have a 'password' property.
  // We now create an object with the password for the mock DB, but return a sanitized User object without the password.
  const newUserWithPassword = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // Not hashed for mock purposes
    avatarUrl: `https://picsum.photos/seed/${name}/200`,
    bio: `Hi, I'm ${name}!`,
    online: true,
    friends: [],
    friendRequestsSent: [],
    friendRequestsReceived: [],
  };
  mockDB.users.push(newUserWithPassword);
  localStorage.setItem('currentUserId', newUserWithPassword.id);
  const { password: _, ...userToReturn } = newUserWithPassword;
  return userToReturn;
};

export const handleLogin = async ({ email, password }: LoginData): Promise<User> => {
  await simulateDelay(500);
  const user = mockDB.users.find(u => u.email === email);
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }
  localStorage.setItem('currentUserId', user.id);
  // FIX: Return a User object without the password to match the `User` type.
  const { password: _, ...userToReturn } = user;
  return userToReturn;
};

export const handleGoogleSignIn = async (): Promise<User> => {
  await simulateDelay(500);
  // Simulate signing in a specific mock Google user
  const googleUser = mockDB.users.find(u => u.id === 'user-google');
  if (!googleUser) {
    throw new Error("Mock Google user not found.");
  }
  localStorage.setItem('currentUserId', googleUser.id);
  // FIX: Return a User object without the password to match the `User` type.
  const { password: _, ...userToReturn } = googleUser;
  return userToReturn;
};

export const handleLogout = async (): Promise<void> => {
  await simulateDelay(100);
  localStorage.removeItem('currentUserId');
};


// --- FIRESTORE USER & SOCIAL SERVICES ---

export const getUserById = async (userId: string): Promise<User | null> => {
    await simulateDelay(50);
    const user = mockDB.users.find(u => u.id === userId);
    // FIX: Return a User object without the password to match the `User` type.
    if (!user) return null;
    const { password: _, ...userToReturn } = user;
    return userToReturn;
};

export const searchUsersByName = async (name: string, currentUserId: string): Promise<User[]> => {
    await simulateDelay(300);
    if (!name.trim()) return [];
    const lowerCaseName = name.toLowerCase();
    const users = mockDB.users.filter(user => 
        user.id !== currentUserId && user.name.toLowerCase().includes(lowerCaseName)
    );
    // FIX: Return User objects without the password to match the `User` type.
    return users.map(user => {
      const { password: _, ...userToReturn } = user;
      return userToReturn;
    });
}

export const handleSendFriendRequest = async (fromId: string, toId: string) => {
    await simulateDelay(400);
    const fromUser = mockDB.users.find(u => u.id === fromId);
    const toUser = mockDB.users.find(u => u.id === toId);

    if (fromUser && toUser) {
        fromUser.friendRequestsSent = [...(fromUser.friendRequestsSent || []), toId];
        toUser.friendRequestsReceived = [...(toUser.friendRequestsReceived || []), fromId];
    } else {
        throw new Error("User not found.");
    }
}

export const getFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
    await simulateDelay(200);
    const user = await getUserById(userId);
    if (!user || !user.friendRequestsReceived) return [];
    
    const requests = await Promise.all(
        user.friendRequestsReceived.map(async (fromId) => {
            const fromUser = await getUserById(fromId);
            return {
                id: fromId,
                fromId,
                toId: userId,
                status: 'pending',
                fromUser: fromUser || undefined,
            } as FriendRequest;
        })
    );
    return requests.filter(req => req.fromUser);
}


export const handleAcceptFriendRequest = async (currentUserId: string, requesterId: string) => {
    await simulateDelay(400);
    const currentUser = mockDB.users.find(u => u.id === currentUserId);
    const requesterUser = mockDB.users.find(u => u.id === requesterId);

    if (!currentUser || !requesterUser) throw new Error("User not found");

    // Add to friends lists
    currentUser.friends = [...(currentUser.friends || []), requesterId];
    requesterUser.friends = [...(requesterUser.friends || []), currentUserId];

    // Remove from requests lists
    currentUser.friendRequestsReceived = (currentUser.friendRequestsReceived || []).filter(id => id !== requesterId);
    requesterUser.friendRequestsSent = (requesterUser.friendRequestsSent || []).filter(id => id !== currentUserId);

    // Create a new chat for them
    mockDB.chats.push({
      id: `chat-${Date.now()}`,
      userIds: [currentUserId, requesterId],
      messages: [],
      unreadCount: 0,
    });
}

export const handleDeclineFriendRequest = async (currentUserId: string, requesterId: string) => {
    await simulateDelay(400);
    const currentUser = mockDB.users.find(u => u.id === currentUserId);
    const requesterUser = mockDB.users.find(u => u.id === requesterId);

    if (!currentUser || !requesterUser) throw new Error("User not found");
    
    // Remove from requests lists
    currentUser.friendRequestsReceived = (currentUser.friendRequestsReceived || []).filter(id => id !== requesterId);
    requesterUser.friendRequestsSent = (requesterUser.friendRequestsSent || []).filter(id => id !== currentUserId);
}

// --- CHAT SERVICES ---

const populateChat = (chat: any, currentUserId: string): Chat => {
    const messages = chat.messages
      .map(msgId => mockDB.messages.find(m => m.id === msgId))
      .filter(Boolean)
      .sort((a,b) => a.timestamp - b.timestamp);
      
    const usersWithPassword = chat.userIds
        .map(uid => mockDB.users.find(u => u.id === uid))
        .filter(Boolean);
        
    // FIX: The `users` array in a Chat object should contain `User` objects, which don't have passwords.
    // We map over the users from the DB and strip the password before returning.
    const users = usersWithPassword.map(u => {
      const { password: _, ...user } = u;
      return user;
    });
        
    return {
        ...chat,
        messages,
        users,
    };
};

export const getChatsForUser = async (userId: string): Promise<Chat[]> => {
    await simulateDelay(600);
    const userChats = mockDB.chats.filter(c => c.userIds.includes(userId));
    return userChats.map(c => populateChat(c, userId));
}

export const getChatById = async (chatId: string, currentUserId: string): Promise<Chat | null> => {
    await simulateDelay(300);
    const chat = mockDB.chats.find(c => c.id === chatId);
    return chat ? populateChat(chat, currentUserId) : null;
}

export const handleSendMessage = async (chatId: string, senderId: string, text: string): Promise<Message> => {
    await simulateDelay(200);
    const chat = mockDB.chats.find(c => c.id === chatId);
    if (!chat) throw new Error("Chat not found");

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId,
        text,
        timestamp: Date.now(),
        reactions: [],
    };
    mockDB.messages.push(newMessage);
    chat.messages.push(newMessage.id);
    return newMessage;
};

// --- STORY SERVICES ---
export const getStories = async (): Promise<{stories: UserStory[], users: User[]}> => {
    await simulateDelay(400);
    const userIdsWithStories = mockDB.stories.map(s => s.userId);
    const usersWithPasswords = mockDB.users.filter(u => userIdsWithStories.includes(u.id));
    // FIX: Return User objects without the password to match the `User` type.
    const users = usersWithPasswords.map(user => {
      const { password: _, ...userToReturn } = user;
      return userToReturn;
    });
    return { stories: mockDB.stories, users };
}

export const getStoryForUser = async (userId: string): Promise<{story: UserStory, user: User} | null> => {
    await simulateDelay(150);
    const story = mockDB.stories.find(s => s.userId === userId);
    const userWithPassword = mockDB.users.find(u => u.id === userId);
    if (story && userWithPassword) {
        // FIX: Return a User object without the password to match the `User` type.
        const { password: _, ...user } = userWithPassword;
        return { story, user };
    }
    return null;
}