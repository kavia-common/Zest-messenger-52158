
import React from 'react';
import type { User } from '../types';

interface StoryBubbleProps {
  user: User;
  hasUnseenStories: boolean;
  onClick: () => void;
}

const StoryBubble: React.FC<StoryBubbleProps> = ({ user, hasUnseenStories, onClick }) => {
  const ringClass = hasUnseenStories
    ? 'ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-black ring-brand-500'
    : 'ring-2 ring-gray-300 dark:ring-gray-700 ring-offset-2 ring-offset-gray-50 dark:ring-offset-black';

  return (
    <button onClick={onClick} className="flex flex-col items-center space-y-2 flex-shrink-0">
      <div className={`relative w-16 h-16 rounded-full p-0.5 ${ringClass}`}>
        <img
          className="w-full h-full rounded-full object-cover"
          src={user.avatarUrl}
          alt={user.name}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-20 truncate">{user.name}</span>
    </button>
  );
};

export default StoryBubble;
