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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Intake</h1>
        {loading && <div className="text-center text-gray-600 mb-4">Creating intake...</div>}
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label htmlFor="intakeType" className="block text-sm font-medium text-gray-700">Intake Type</label>
            <input
              type="text"
              id="intakeType"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Family Visa, Spouse Visa"
              value={intakeType}
              onChange={(e) => setIntakeType(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Intake
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIntakeScreen;
