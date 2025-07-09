import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/userSlice';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRegister = useSelector((state) => state.user);
  const { loading, error, userInfo } = userRegister;

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
    if (error) {
      toast.error(error);
    }
  }, [navigate, userInfo, error]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      dispatch(register({ name, email, password }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-color-secondary p-8 rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
        <h1 className="text-3xl font-bold text-color-text mb-6 text-center">Sign Up</h1>
        {loading && <div className="text-center text-color-text-secondary mb-4">Loading...</div>}
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-color-text">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-color-border rounded-md shadow-sm focus:outline-none focus:ring-color-accent focus:border-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-color-text">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-color-border rounded-md shadow-sm focus:outline-none focus:ring-color-accent focus:border-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-color-text">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-color-border rounded-md shadow-sm focus:outline-none focus:ring-color-accent focus:border-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-color-text">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2.5 border border-color-border rounded-md shadow-sm focus:outline-none focus:ring-color-accent focus:border-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-color-accent hover:bg-color-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-accent transition-all duration-300 ease-in-out"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-color-text-secondary">
            Have an Account? <Link to="/login" className="font-medium text-color-accent hover:text-color-accent">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;