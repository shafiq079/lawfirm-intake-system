const validateField = (field, value) => {
  let isValid = true;
  let errors = [];

  switch (field) {
    case 'firstName':
    case 'lastName':
      if (!value || value.trim() === '') {
        isValid = false;
        errors.push(`${field} cannot be empty.`);
      }
      break;
    case 'email':
      if (!value || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        isValid = false;
        errors.push('Invalid email format.');
      }
      break;
    // Add more validation rules for other fields as needed
    default:
      break;
  }

  return { isValid, errors };
};

export { validateField };