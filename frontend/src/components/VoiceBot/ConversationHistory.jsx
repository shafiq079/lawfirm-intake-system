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
    <div className="h-64 overflow-y-auto border border-color-border rounded-md p-4 mb-4 bg-color-primary shadow-inner transition-colors duration-300 ease-in-out">
      {conversation.map((entry, index) => (
        <div key={index} className={`mb-2 ${entry.sender === 'Bot' ? 'text-color-accent' : 'text-color-text text-right'}`}>
          <span className="font-semibold">{entry.sender}:</span>
          {entry.type === 'text' && entry.content}
          {entry.type === 'audio' && <span>[Audio Input]</span>}
          {entry.type === 'error' && <span className="text-color-error">Error: {entry.content}</span>}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationHistory;