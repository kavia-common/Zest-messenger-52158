
import React, { useState } from 'react';
import type { Message, User, ReactionType, Reaction } from '../types';
import Icon from './Icon';

interface MessageBubbleProps {
  message: Message;
  sender: User;
  isMe: boolean;
  onAddReaction: (reaction: Reaction) => void;
}

const ReactionPill: React.FC<{ emoji: ReactionType; count: number, reacted: boolean }> = ({ emoji, count, reacted }) => {
  const emojiMap = { like: '👍', love: '❤️', laugh: '😂' };
  const baseClasses = "text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 transition-colors"
  const reactedClasses = reacted ? "bg-brand-100 text-brand-700 border border-brand-300" : "bg-gray-200 text-gray-600 border border-transparent";
  
  return (
    <div className={`${baseClasses} ${reactedClasses}`}>
      <span>{emojiMap[emoji]}</span>
      <span>{count}</span>
    </div>
  )
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, isMe, onAddReaction }) => {
  const [showReactions, setShowReactions] = useState(false);
  const myUserId = 'user-me';

  const aggregatedReactions = message.reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  const hasReacted = (emoji: ReactionType): boolean => {
    return message.reactions.some(r => r.userId === myUserId && r.emoji === emoji);
  };

  const handleReactionClick = (emoji: ReactionType) => {
    onAddReaction({ userId: myUserId, emoji });
    setShowReactions(false);
  }

  const alignment = isMe ? 'justify-end' : 'justify-start';
  const bubbleColor = isMe ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100';
  const bubbleRadius = isMe ? 'rounded-l-xl rounded-t-xl' : 'rounded-r-xl rounded-t-xl';

  return (
    <div className={`flex items-end gap-2 ${alignment}`}>
      {!isMe && <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />}
      <div className="group relative max-w-xs md:max-w-md">
        <div 
          className={`px-4 py-2 ${bubbleColor} ${bubbleRadius} shadow-sm`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {message.text && <p className="text-sm">{message.text}</p>}
          {message.imageUrl && <img src={message.imageUrl} alt="sent" className="mt-2 rounded-lg max-w-full h-auto" />}
        </div>
        {showReactions && (
          <div className="absolute -top-6 flex bg-white dark:bg-gray-700 shadow-md rounded-full p-1 space-x-1 transition-opacity opacity-0 group-hover:opacity-100">
            <button onClick={() => handleReactionClick('like')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><Icon name="like" className="w-4 h-4 text-blue-500" /></button>
            <button onClick={() => handleReactionClick('love')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><Icon name="love" className="w-4 h-4 text-red-500" /></button>
            <button onClick={() => handleReactionClick('laugh')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><Icon name="laugh" className="w-4 h-4 text-yellow-500" /></button>
          </div>
        )}
        {message.reactions.length > 0 && (
          <div className="flex space-x-1 mt-1">
            {Object.entries(aggregatedReactions).map(([emoji, count]) => (
               <ReactionPill key={emoji} emoji={emoji as ReactionType} count={count} reacted={hasReacted(emoji as ReactionType)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
