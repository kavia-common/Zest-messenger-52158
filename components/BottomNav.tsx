import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const BottomNav: React.FC = () => {
  const { currentPage, navigateToHome, navigateToSearch, navigateToNotifications, navigateToProfile } = useAppContext();
  const { currentUser, notificationCount } = useAuth();

  const navItems = [
    { name: 'Home', icon: 'home', page: 'home', action: navigateToHome },
    { name: 'People', icon: 'search', page: 'search', action: navigateToSearch },
    { name: 'Alerts', icon: 'notifications', page: 'notifications', action: navigateToNotifications },
    { name: 'Profile', icon: 'user', page: 'profile', action: () => navigateToProfile(currentUser!.id) },
  ] as const;

  return (
    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="max-w-lg mx-auto h-16 flex justify-around items-center">
        {navItems.map((item) => {
          // Profile is active if the page is 'profile' AND the active user is the current user.
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.name}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                isActive ? 'text-brand-600' : 'text-gray-500 hover:text-brand-500'
              }`}
            >
              {item.name === 'Alerts' && notificationCount > 0 && (
                <span className="absolute top-0 right-1/2 translate-x-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  {notificationCount}
                </span>
              )}
              <Icon name={item.icon} className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;