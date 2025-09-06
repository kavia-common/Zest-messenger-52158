import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import StoryViewPage from './pages/StoryViewPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import BottomNav from './components/BottomNav';

const AppContent: React.FC = () => {
  const { currentPage, activeChatId, activeStoryUserId, activeProfileUserId } = useAppContext();
  const { currentUser } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return activeChatId ? <ChatPage chatId={activeChatId} /> : <HomePage />;
      case 'story':
        // This page still uses mock data and can be updated later.
        return activeStoryUserId ? <StoryViewPage userId={activeStoryUserId} /> : <HomePage />;
      case 'profile':
        // If no specific user is selected, show the current user's profile.
        return <ProfilePage userId={activeProfileUserId ?? currentUser!.id} />;
      case 'search':
        return <SearchPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-black font-sans w-full h-screen flex flex-col max-w-lg mx-auto shadow-2xl">
      <main className="flex-1 overflow-y-auto relative">
        {renderPage()}
      </main>
      {currentPage !== 'story' && <BottomNav />}
    </div>
  );
};

// AuthGate handles the logic of showing the app or the auth page.
const AuthGate: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <p>Loading...</p>
      </div>
    );
  }

  return currentUser ? <AppContent /> : <AuthPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthGate />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;