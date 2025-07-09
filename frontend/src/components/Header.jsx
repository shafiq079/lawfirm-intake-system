
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout, logoutUser } from '../features/userSlice';
import ThemeSwitcher from './ThemeSwitcher'; // Import the ThemeSwitcher component

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.user);
  const { userInfo } = userLogin;

  const [isOpen, setIsOpen] = useState(false);

  const logoutHandler = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="bg-color-secondary text-color-text p-4 shadow-md transition-colors duration-300 ease-in-out">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="text-color-text hover:text-color-accent transition-colors duration-300 ease-in-out">AI Intake</Link>
        </h1>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeSwitcher />
          <button onClick={() => setIsOpen(!isOpen)} className="text-color-text focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>

        {/* Desktop and Mobile Menu */}
        <nav className={`${isOpen ? 'block' : 'hidden'} md:block absolute md:relative top-16 md:top-auto left-0 md:left-auto w-full md:w-auto bg-color-secondary md:bg-transparent z-20`}>
          <ul className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 p-4 md:p-0 items-center">
            {userInfo ? (
              <>
                <li>
                  <Link to="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-color-text hover:bg-color-accent hover:text-white transition-colors duration-300 ease-in-out" onClick={() => setIsOpen(false)}>Dashboard</Link>
                </li>
                <li>
                  <Link to="/voice-intake" className="block px-3 py-2 rounded-md text-base font-medium text-color-text hover:bg-color-accent hover:text-white transition-colors duration-300 ease-in-out" onClick={() => setIsOpen(false)}>Voice Intake</Link>
                </li>
                <li>
                  <Link to="/text-intake" className="block px-3 py-2 rounded-md text-base font-medium text-color-text hover:bg-color-accent hover:text-white transition-colors duration-300 ease-in-out" onClick={() => setIsOpen(false)}>Text Intake</Link>
                </li>
                <li>
                  <Link to="/document-upload" className="block px-3 py-2 rounded-md text-base font-medium text-color-text hover:bg-color-accent hover:text-white transition-colors duration-300 ease-in-out" onClick={() => setIsOpen(false)}>Document Upload</Link>
                </li>
                <li className="flex items-center px-3 py-2 text-base font-medium text-color-text">
                  Hello, {userInfo.name}
                </li>
                <li>
                  <button onClick={() => { logoutHandler(); setIsOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-color-text hover:bg-color-accent hover:text-white transition-colors duration-300 ease-in-out w-full text-left">
                    Logout
                  </button>
                </li>
                <li className="hidden md:block">
                  <ThemeSwitcher />
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-color-text hover:bg-color-accent hover:text-white transition-colors duration-300 ease-in-out" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </li>
                <li className="hidden md:block">
                  <ThemeSwitcher />
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
