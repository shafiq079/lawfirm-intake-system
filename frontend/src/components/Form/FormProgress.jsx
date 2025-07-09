import React from 'react';

const FormProgress = ({ current, total }) => {
  const progressPercentage = (current / total) * 100;

  return (
    <div className="w-full bg-color-primary rounded-full h-2.5 mb-4 shadow-inner">
      <div
        className="bg-color-accent h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${progressPercentage}%` }}
      ></div>
      <p className="text-center text-sm text-color-text-secondary mt-2">
        Step {current} of {total}
      </p>
    </div>
  );
};

export default FormProgress;