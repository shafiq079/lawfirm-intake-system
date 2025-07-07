import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const ConversationHistory = () => {
  const messagesEndRef = useRef(null);
  const conversation = useSelector((state) => state.voiceBot.conversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  return (
    <div className="h-64 overflow-y-auto border border-gray-300 rounded-md p-4 mb-4 bg-gray-50">
      {conversation.map((entry, index) => (
        <div key={index} className={`mb-2 ${entry.sender === 'Bot' ? 'text-blue-800' : 'text-gray-800 text-right'}`}>
          <span className="font-semibold">{entry.sender}:</span>
          {entry.type === 'text' && entry.content}
          {entry.type === 'audio' && <span>[Audio Input]</span>}
          {entry.type === 'error' && <span className="text-red-500">Error: {entry.content}</span>}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationHistory;