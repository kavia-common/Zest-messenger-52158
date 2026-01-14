import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getChatById, handleSendMessage as sendMessageService } from '../backend/services';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import type { Reaction, Chat, User, Message } from '../types';
import { subscribe, unsubscribe } from '../src/realtime/wsClient';
import type { MessageCreatedPayload } from '../src/realtime/events';

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
    
    const fetchChatData = async () => {
      try {
        const fetchedChat = await getChatById(chatId, currentUser.id);
        if (fetchedChat) {
          setChat(fetchedChat);
          const other = fetchedChat.users.find(u => u.id !== currentUser.id);
          setOtherUser(other || null);
        } else {
           throw new Error("Chat not found");
        }
      } catch (error) {
        console.error("Failed to fetch chat:", error);
        setChat(null);
        setOtherUser(null);
      }
    };

    fetchChatData();

    const onMessageCreated = (payload: MessageCreatedPayload) => {
      if (payload.chatId !== chatId) return;

      // Append incoming messages (avoid duplicates by id).
      setChat((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === payload.message.id)) return prev;
        return { ...prev, messages: [...prev.messages, payload.message] };
      });
    };

    subscribe('MessageCreated', onMessageCreated);
    return () => {
      unsubscribe('MessageCreated', onMessageCreated);
    };
  }, [chatId, currentUser]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUser || !chat) return;

    // Optimistic UI update
    const tempId = `msg-temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      senderId: currentUser.id,
      text,
      reactions: [],
      timestamp: Date.now(),
    };
    
    setChat(prevChat => {
        if (!prevChat) return null;
        return {
            ...prevChat,
            messages: [...prevChat.messages, newMessage],
        }
    });

    try {
        // In a real app, the service would return the final message object with the real ID and timestamp
        await sendMessageService(chat.id, currentUser.id, text);
        // Here you could update the message with the real ID from the server if needed
    } catch(error) {
        console.error("Failed to send message:", error);
        // Revert optimistic update on error
        setChat(prevChat => {
            if (!prevChat) return null;
            return {
                ...prevChat,
                messages: prevChat.messages.filter(m => m.id !== tempId)
            }
        });
    }
  };

  const handleAddReaction = async (messageId: string, reaction: Reaction) => {
    if (!chat || !currentUser) return;
    
    // This is a local-only update for now. A real backend service would be needed.
    const updatedMessages = chat.messages.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(r => r.userId === currentUser.id);
        let newReactions = [...msg.reactions];

        if (existingReactionIndex > -1) {
          // If reacting with the same emoji, remove reaction. Otherwise, update it.
          if (msg.reactions[existingReactionIndex].emoji === reaction.emoji) {
            newReactions.splice(existingReactionIndex, 1);
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

    setChat({ ...chat, messages: updatedMessages });
    // In a real app: await updateReactionsOnServer(chatId, messageId, reaction);
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
              currentUserId={currentUser.id}
              onAddReaction={(reaction) => handleAddReaction(message.id, reaction)}
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