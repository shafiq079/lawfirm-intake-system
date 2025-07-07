import React from 'react';

const FormField = ({ label, value, onChange, type = 'text' }) => {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input type={type} value={value} onChange={onChange} />
    </div>
  );
};

export default FormField;