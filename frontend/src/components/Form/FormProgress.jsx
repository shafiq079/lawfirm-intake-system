import React from 'react';

const FormProgress = ({ current, total }) => {
  return (
    <div className="form-progress">
      Progress: {current} of {total}
    </div>
  );
};

export default FormProgress;