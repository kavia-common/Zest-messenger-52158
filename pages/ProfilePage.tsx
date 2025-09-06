import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getUserById, handleSendFriendRequest, handleLogout } from '../firebase/services';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';

interface ProfilePageProps {
  userId: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const { navigateToHome, navigateToChat } = useAppContext();
  const { currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  useEffect(() => {
    getUserById(userId).then(setProfileUser);
  }, [userId]);

  const onSendRequest = async () => {
      if(currentUser && profileUser) {
          setIsSendingRequest(true);
          try {
            await handleSendFriendRequest(currentUser.id, profileUser.id);
            // No need to alert. The UI will update automatically via AuthContext.
            // The button will change to "Request Sent" once currentUser is updated.
          } catch(error) {
              console.error(error);
              alert("Failed to send request.");
              setIsSendingRequest(false); // Re-enable button on error
          }
      }
  }

  const getRelationshipStatus = () => {
    if (!currentUser || !profileUser || currentUser.id === profileUser.id) return 'self';
    if (currentUser.friends?.includes(profileUser.id)) return 'friend';
    if (currentUser.friendRequestsSent?.includes(profileUser.id)) return 'request_sent';
    if (currentUser.friendRequestsReceived?.includes(profileUser.id)) return 'request_received';
    return 'none';
  }

  const relationship = getRelationshipStatus();

  const renderActionButtons = () => {
    switch (relationship) {
      case 'friend':
        return (
          <button onClick={() => alert("Navigate to chat!")} className="mt-4 w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors">
            Message
          </button>
        );
      case 'request_sent':
         return (
          <button disabled className="mt-4 w-full bg-gray-300 text-gray-500 font-semibold py-2 px-4 rounded-lg cursor-not-allowed">
            Request Sent
          </button>
        );
      case 'request_received':
        return (
            <button onClick={() => alert("Go to notifications to respond")} className="mt-4 w-full bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                Respond to Request
            </button>
        );
      case 'none':
        return (
          <button onClick={onSendRequest} disabled={isSendingRequest} className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300">
            {isSendingRequest ? 'Sending...' : 'Add Friend'}
          </button>
        );
      default: // self
        return null;
    }
  };
  
  if (!profileUser) {
      return <div>Loading profile...</div>
  }

  return (
    <div className="bg-gray-50 dark:bg-black h-full">
      <header className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 flex items-center p-3 border-b border-gray-200 dark:border-gray-800 pt-safe">
        <button onClick={navigateToHome} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
          <Icon name="back" className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h2 className="ml-4 font-semibold text-lg text-gray-800 dark:text-gray-100">Profile</h2>
      </header>

      <div className="p-6 flex flex-col items-center">
        <Avatar src={profileUser.avatarUrl} alt={profileUser.name} size="xl" online={profileUser.online} />
        <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">{profileUser.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{profileUser.email}</p>
        {profileUser.bio && <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">{profileUser.bio}</p>}
        <div className="w-full max-w-xs">
            {renderActionButtons()}
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            {relationship === 'self' && (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    <li onClick={handleLogout} className="p-4 flex justify-between items-center cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <span>Log Out</span>
                    <Icon name="logout" className="w-5 h-5" />
                    </li>
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;