
import React, { useEffect, useRef, useState } from 'react';
// Use Firebase v8 imports.
// FIX: Corrected firebase import to use compat version.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../firebase/config';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import type { Reaction, Chat, User, Message } from '../types';

// Define Timestamp type for v8.
type Timestamp = firebase.firestore.Timestamp;

interface ChatPageProps {
  chatId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ chatId }) => {
  const { navigateToHome, navigateToProfile } = useAppContext();
  const { currentUser } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    
    // Use v8 syntax to get a document reference and listen for changes.
    const chatDocRef = db.collection("chats").doc(chatId);
    const unsub = chatDocRef.onSnapshot(async (docSnap) => {
      if (docSnap.exists) {
        const data = docSnap.data() as Omit<Chat, 'id' | 'users'> & { userIds: string[] };
        
        // Fetch full user objects for all participants in the chat.
        const userPromises = (data.userIds || []).map(id => db.collection("users").doc(id).get());
        const userDocs = await Promise.all(userPromises);
        const chatUsers = userDocs.filter(d => d.exists).map(userDoc => ({ id: userDoc.id, ...userDoc.data() } as User));

        const otherUserData = chatUsers.find(u => u.id !== currentUser.id);
        setOtherUser(otherUserData || null);

        // Convert Firestore Timestamps to milliseconds for each message.
        const messages = (data.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: (msg.timestamp as Timestamp)?.toMillis() || msg.timestamp || Date.now(),
        }));
        
        setChat({
            id: docSnap.id,
            messages,
            unreadCount: data.unreadCount,
            users: chatUsers,
            userIds: data.userIds,
        });

      } else {
        console.error("Chat document not found:", chatId);
        setChat(null);
        setOtherUser(null);
      }
    });

    return () => unsub(); // Cleanup the listener on component unmount.
  }, [chatId, currentUser]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUser) return;

    // Use `firebase.firestore.FieldValue.serverTimestamp()` for v8.
    const newMessage: Omit<Message, 'timestamp'> & { timestamp: any } = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      reactions: [],
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const chatDocRef = db.collection("chats").doc(chatId);
    // Use v8 `.update()` and `firebase.firestore.FieldValue.arrayUnion()`.
    await chatDocRef.update({
      messages: firebase.firestore.FieldValue.arrayUnion(newMessage)
    });
  };

  const handleAddReaction = async (messageId: string, reaction: Reaction) => {
    if (!chat || !currentUser) return;

    const updatedMessages = chat.messages.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(r => r.userId === currentUser.id);
        let newReactions = [...msg.reactions];

        if (existingReactionIndex > -1) {
          if (msg.reactions[existingReactionIndex].emoji === reaction.emoji) {
            newReactions = msg.reactions.filter(r => r.userId !== currentUser.id);
          } else {
            newReactions[existingReactionIndex] = reaction;
          }
        } else {
          newReactions.push(reaction);
        }
        return { ...msg, reactions: newReactions };
      }
      return msg;
    });

    const chatDocRef = db.collection("chats").doc(chatId);
    // Use v8 `.update()` method.
    await chatDocRef.update({ messages: updatedMessages });
  };
  
  if (!chat || !otherUser || !currentUser) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-gray-600">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Chat Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 flex items-center p-3 border-b border-gray-200 dark:border-gray-800 pt-safe">
        <button onClick={navigateToHome} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
          <Icon name="back" className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <div className="flex items-center ml-2 cursor-pointer" onClick={() => navigateToProfile(otherUser.id)}>
          <Avatar src={otherUser.avatarUrl} alt={otherUser.name} size="sm" online={otherUser.online} />
          <div className="ml-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">{otherUser.name}</h2>
            <p className="text-xs text-gray-500">{otherUser.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex-grow" />
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
          <Icon name="more" className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map(message => {
          const sender = chat.users.find(u => u.id === message.senderId);
          if (!sender) return null;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              sender={sender}
              isMe={message.senderId === currentUser.id}
              onAddReaction={(reaction) => handleAddReaction(message.id, { ...reaction, userId: currentUser.id })}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatPage;
