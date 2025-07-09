import React from 'react';

const FormSection = ({ title, children }) => {
  return (
    <div className="bg-color-secondary p-6 rounded-lg shadow-md mb-6 transition-colors duration-300 ease-in-out">
      <h3 className="text-xl font-bold text-color-text mb-4 border-b pb-2 border-color-border">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default FormSection;