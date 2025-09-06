import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchUsersByName, handleSendFriendRequest } from '../firebase/services';
import type { User } from '../types';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import { useAppContext } from '../context/AppContext';

const SearchPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { navigateToProfile } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    // Keep track of which users have had a request sent to them in this session for optimistic UI
    const [sentRequests, setSentRequests] = useState<string[]>([]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (searchTerm.trim() && currentUser) {
                setLoading(true);
                const users = await searchUsersByName(searchTerm, currentUser.id);
                setResults(users);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 500); // Debounce search input

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, currentUser]);
    
    const onAddFriend = async (userId: string) => {
        if (!currentUser) return;
        try {
            // Add to local state for instant optimistic UI update
            setSentRequests(prev => [...prev, userId]);
            await handleSendFriendRequest(currentUser.id, userId);
            // The global currentUser state will update via AuthContext,
            // which will permanently reflect the "Sent" status on subsequent renders.
        } catch (error) {
            console.error(error);
            // Revert local state on error
            setSentRequests(prev => prev.filter(id => id !== userId));
            alert("Failed to send friend request.");
        }
    }

    if (!currentUser) return null;

    return (
        <div>
            <header className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 p-4 border-b border-gray-200 dark:border-gray-800 pt-safe">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for people..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Icon name="search" className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </header>
            <div className="p-4">
                {loading && <p>Searching...</p>}
                {!loading && results.length === 0 && searchTerm && <p>No users found.</p>}
                <div className="space-y-4">
                    {results.map(user => {
                        const isRequestSent = currentUser.friendRequestsSent?.includes(user.id) || sentRequests.includes(user.id);
                        const isFriend = currentUser.friends?.includes(user.id);
                        
                        return (
                            <div key={user.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm">
                                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateToProfile(user.id)}>
                                    <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                {isRequestSent ? (
                                    <button disabled className="px-3 py-1 text-sm bg-gray-200 text-gray-500 rounded-full cursor-not-allowed">
                                        Sent
                                    </button>
                                ) : isFriend ? (
                                     <button disabled className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full cursor-not-allowed">
                                        Friend
                                    </button>
                                ) : (
                                    <button onClick={() => onAddFriend(user.id)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600">
                                        Add
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;