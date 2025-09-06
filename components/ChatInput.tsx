
import React, { useState } from 'react';
import Icon from './Icon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-2 sm:p-4 pb-safe">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button type="button" className="p-2 text-gray-500 hover:text-brand-600 transition-colors">
          <Icon name="add-image" />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors disabled:bg-gray-400"
          disabled={!text.trim()}
        >
          <Icon name="send" className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
