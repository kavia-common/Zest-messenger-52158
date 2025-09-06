import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFriendRequests, handleAcceptFriendRequest, handleDeclineFriendRequest } from '../backend/services';
import type { FriendRequest } from '../types';
import Avatar from '../components/Avatar';
import { useAppContext } from '../context/AppContext';

const NotificationsPage: React.FC = () => {
    const { currentUser, refreshCurrentUser } = useAuth();
    const { navigateToProfile } = useAppContext();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            getFriendRequests(currentUser.id).then(data => {
                setRequests(data);
                setLoading(false);
            });
        }
    }, [currentUser]);

    const onAccept = async (requesterId: string) => {
        if (!currentUser) return;
        await handleAcceptFriendRequest(currentUser.id, requesterId);
        setRequests(prev => prev.filter(req => req.fromId !== requesterId));
        await refreshCurrentUser(); // Refresh global state
        alert("Friend request accepted!");
    };
    
    const onDecline = async (requesterId: string) => {
        if (!currentUser) return;
        await handleDeclineFriendRequest(currentUser.id, requesterId);
        setRequests(prev => prev.filter(req => req.fromId !== requesterId));
        await refreshCurrentUser(); // Refresh global state
    };

    return (
        <div>
            <header className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 p-4 border-b border-gray-200 dark:border-gray-800 pt-safe">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-sm text-gray-500">You have {requests.length} new friend requests.</p>
            </header>
            <div className="p-4 space-y-3">
                {loading && <p>Loading requests...</p>}
                {!loading && requests.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">No new notifications.</p>
                )}
                {requests.map(req => {
                    if (!req.fromUser) return null;
                    return (
                        <div key={req.id} className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-3 cursor-pointer mb-3 sm:mb-0" onClick={() => navigateToProfile(req.fromId)}>
                                <Avatar src={req.fromUser.avatarUrl} alt={req.fromUser.name} size="sm" />
                                <div>
                                    <p><span className="font-semibold">{req.fromUser.name}</span> wants to be your friend.</p>
                                </div>
                            </div>
                            <div className="flex space-x-2 self-end sm:self-center">
                                <button onClick={() => onAccept(req.fromId)} className="px-4 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">Accept</button>
                                <button onClick={() => onDecline(req.fromId)} className="px-4 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Decline</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NotificationsPage;