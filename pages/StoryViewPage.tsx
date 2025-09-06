import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getStoryForUser } from '../backend/services';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import type { UserStory, User } from '../types';

const StoryViewPage: React.FC<{ userId: string }> = ({ userId }) => {
  const { navigateToHome } = useAppContext();
  const [userStory, setUserStory] = useState<UserStory | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchStory = async () => {
      const data = await getStoryForUser(userId);
      if (data) {
        setUserStory(data.story);
        setUser(data.user);
      }
    };
    fetchStory();
  }, [userId]);

  useEffect(() => {
    if (!userStory) return;
    const currentStory = userStory.stories[currentStoryIndex];
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        const newProgress = p + 100 / (currentStory.duration * 10);
        if (newProgress >= 100) {
          clearInterval(interval);
          handleNextStory();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoryIndex, userStory]);

  const handleNextStory = () => {
    if (userStory && currentStoryIndex < userStory.stories.length - 1) {
      setCurrentStoryIndex(i => i + 1);
    } else {
      navigateToHome();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(i => i - 1);
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const tapPosition = (clientX - left) / width;

    if (tapPosition < 0.3) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  if (!userStory || !user) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <p className="text-white">Story not found.</p>
        <button onClick={navigateToHome} className="absolute top-5 right-5 text-white z-20">
          <Icon name="close" />
        </button>
      </div>
    );
  }

  const currentStory = userStory.stories[currentStoryIndex];

  return (
    <div className="relative w-full h-full bg-black" onClick={handleTap}>
      <div className="absolute top-0 left-0 right-0 p-4 z-10 pt-safe">
        <div className="flex items-center gap-1">
          {userStory.stories.map((story, index) => (
            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full">
              <div 
                className="h-1 bg-white rounded-full"
                style={{ width: `${index < currentStoryIndex ? 100 : (index === currentStoryIndex ? progress : 0)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center mt-3">
          <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
          <p className="ml-3 text-white font-semibold">{user.name}</p>
        </div>
      </div>
      
      <button onClick={navigateToHome} className="absolute top-5 right-5 text-white z-20 pt-safe">
        <Icon name="close" className="w-8 h-8" />
      </button>

      <div className="w-full h-full flex items-center justify-center">
        <img src={currentStory.url} alt="Story" className="max-h-full max-w-full object-contain" />
      </div>
    </div>
  );
};

export default StoryViewPage;