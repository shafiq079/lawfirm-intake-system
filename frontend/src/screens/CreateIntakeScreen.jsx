import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createIntake } from '../features/intakeSlice';
import { toast } from 'react-toastify';

const CreateIntakeScreen = () => {
  const [intakeType, setIntakeType] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const intakeCreate = useSelector((state) => state.intake);
  const { loading, error, success, intake } = intakeCreate;

  const submitHandler = (e) => {
    e.preventDefault();
    if (intakeType) {
      dispatch(createIntake({ intakeType }));
    } else {
      toast.error('Please enter an intake type.');
    }
  };

  useEffect(() => {
    if (success && intake) {
      toast.success('Intake created successfully!');
      navigate(`/admin/intakes/${intake._id}`); // Redirect to the newly created intake's detail page
    }
    if (error) {
      toast.error(error);
    }
  }, [success, navigate, intake, error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-color-secondary p-8 rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
        <h1 className="text-3xl font-bold text-color-text mb-6 text-center">Create New Intake</h1>
        {loading && <div className="text-center text-color-text-secondary mb-4">Creating intake...</div>}
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label htmlFor="intakeType" className="block text-sm font-medium text-color-text">Intake Type</label>
            <input
              type="text"
              id="intakeType"
              className="mt-1 block w-full px-4 py-2.5 border border-color-border rounded-md shadow-sm focus:outline-none focus:ring-color-accent focus:border-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
              placeholder="e.g., Family Visa, Spouse Visa"
              value={intakeType}
              onChange={(e) => setIntakeType(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-color-accent hover:bg-color-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-accent transition-all duration-300 ease-in-out"
          >
            Create Intake
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIntakeScreen;
