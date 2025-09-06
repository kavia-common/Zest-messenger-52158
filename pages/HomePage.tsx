import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getStories, getChatsForUser } from '../backend/services';
import StoryBubble from '../components/StoryBubble';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import type { Chat, User, UserStory } from '../types';

const ChatListItem: React.FC<{ chat: Chat; currentUserId: string }> = ({ chat, currentUserId }) => {
  const { navigateToChat } = useAppContext();
  
  const otherUser = chat.users.find(u => u.id !== currentUserId);
  if (!otherUser) return null;

  const lastMessage = chat.messages[chat.messages.length - 1];

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div
      onClick={() => navigateToChat(chat.id)}
      className="flex items-center p-4 space-x-4 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
    >
      <Avatar src={otherUser.avatarUrl} alt={otherUser.name} online={otherUser.online} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{otherUser.name}</p>
          {lastMessage && (
            <p className={`text-xs ${chat.unreadCount > 0 ? 'text-brand-600' : 'text-gray-500'}`}>{formatTimestamp(lastMessage.timestamp)}</p>
          )}
        </div>
        <div className="flex justify-between items-start">
          <p className={`text-sm text-gray-500 dark:text-gray-400 truncate ${chat.unreadCount > 0 ? 'font-bold text-gray-800 dark:text-gray-200' : ''}`}>
            {lastMessage?.text || (lastMessage?.imageUrl ? 'Photo' : 'No messages yet')}
          </p>
          {chat.unreadCount > 0 && (
            <span className="bg-brand-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { navigateToStory } = useAppContext();
  const { currentUser } = useAuth();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [storyUsers, setStoryUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedStories, fetchedChats] = await Promise.all([
          getStories(),
          getChatsForUser(currentUser.id)
        ]);
        
        // In a real app, you might fetch only the users you need.
        // For the mock service, we can get all users associated with stories easily.
        setStories(fetchedStories.stories);
        setStoryUsers(fetchedStories.users);
        setChats(fetchedChats);

      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id]);

  // Sort chats by the timestamp of their last message
  const sortedChats = [...chats].sort((a, b) => {
    const lastMsgA = a.messages[a.messages.length - 1];
    const lastMsgB = b.messages[b.messages.length - 1];
    if (!lastMsgA) return 1;
    if (!lastMsgB) return -1;
    return lastMsgB.timestamp - lastMsgA.timestamp;
  });

  if (!currentUser) return null;

  return (
    <div className="h-full">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 pt-safe">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zest</h1>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <Icon name="camera" className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Stories Reel */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
           {stories.map(userStory => {
             const user = storyUsers.find(u => u.id === userStory.userId);
             if (!user) return null;
             const hasUnseen = !userStory.viewedBy.includes(currentUser.id);
             return <StoryBubble key={user.id} user={user} hasUnseenStories={hasUnseen} onClick={() => navigateToStory(user.id)} />;
           })}
        </div>
      </div>
      
      {/* Chat List */}
      <div>
        {loading ? (
            <p className="text-center text-gray-500 p-4">Loading chats...</p>
        ) : (
            sortedChats.map(chat => (
              <ChatListItem key={chat.id} chat={chat} currentUserId={currentUser.id}/>
            ))
        )}
      </div>
    </div>
  );
};

export default HomePage;