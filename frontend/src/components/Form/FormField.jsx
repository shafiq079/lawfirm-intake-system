import React from 'react';

const FormField = ({ label, value, onChange, type = 'text', placeholder = '' }) => {
  return (
    <div className="mb-4">
      <label className="block text-color-text text-sm font-bold mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow appearance-none border rounded w-full py-2.5 px-4 text-color-text leading-tight focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent bg-color-primary border-color-border transition-colors duration-300 ease-in-out"
      />
    </div>
  );
};

export default FormField;