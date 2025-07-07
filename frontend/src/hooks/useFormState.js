import { useState } from 'react';

const useFormState = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const updateFormField = (section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      }
    }));
  };

  return { formData, updateFormField, setFormData };
};

export default useFormState;