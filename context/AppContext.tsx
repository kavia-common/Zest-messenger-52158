import React, { createContext, useState, useContext, ReactNode } from 'react';

type Page = 'home' | 'chat' | 'story' | 'profile' | 'search' | 'notifications';

interface AppContextType {
  currentPage: Page;
  activeChatId: string | null;
  activeStoryUserId: string | null;
  activeProfileUserId: string | null;
  navigateToHome: () => void;
  navigateToChat: (chatId: string) => void;
  navigateToStory: (userId: string) => void;
  navigateToProfile: (userId: string) => void;
  navigateToSearch: () => void;
  navigateToNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeStoryUserId, setActiveStoryUserId] = useState<string | null>(null);
  const [activeProfileUserId, setActiveProfileUserId] = useState<string | null>(null);

  const resetState = () => {
    setActiveChatId(null);
    setActiveStoryUserId(null);
    setActiveProfileUserId(null);
  }

  const navigateToHome = () => {
    resetState();
    setCurrentPage('home');
  };

  const navigateToChat = (chatId: string) => {
    resetState();
    setActiveChatId(chatId);
    setCurrentPage('chat');
  };
  
  const navigateToStory = (userId: string) => {
    resetState();
    setActiveStoryUserId(userId);
    setCurrentPage('story');
  };

  const navigateToProfile = (userId: string) => {
    resetState();
    setActiveProfileUserId(userId);
    setCurrentPage('profile');
  };

  const navigateToSearch = () => {
    resetState();
    setCurrentPage('search');
  };

  const navigateToNotifications = () => {
    resetState();
    setCurrentPage('notifications');
  }

  const value = {
    currentPage,
    activeChatId,
    activeStoryUserId,
    activeProfileUserId,
    navigateToHome,
    navigateToChat,
    navigateToStory,
    navigateToProfile,
    navigateToSearch,
    navigateToNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};