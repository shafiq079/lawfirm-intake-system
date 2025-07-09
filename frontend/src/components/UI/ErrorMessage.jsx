import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-color-error text-white p-3 rounded-md shadow-md mb-4 transition-colors duration-300 ease-in-out">
      <strong className="font-bold">Error:</strong> {message}
    </div>
  );
};

export default ErrorMessage;