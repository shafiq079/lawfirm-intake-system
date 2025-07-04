import React from 'react';

const Tooltip = ({ children, text }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      {text && (
        <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center px-3 py-2 bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          {text}
          <svg className="absolute top-full left-1/2 -translate-x-1/2 text-gray-700 h-2 w-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
        </div>
      )}
    </div>
  );
};

export default Tooltip;