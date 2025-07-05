import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import CreateIntakeScreen from './screens/CreateIntakeScreen';
import IntakeDetailScreen from './screens/IntakeDetailScreen';
import PrivateRoute from './components/PrivateRoute';

import SmartIntakeScreen from './screens/SmartIntakeScreen';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          
          <Route path="/smart-intake/:method" element={<SmartIntakeScreen />} />
          <Route path="/intake/:intakeLink" element={<SmartIntakeScreen />} />
          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
            <Route path="/admin/intakes/create" element={<CreateIntakeScreen />} />
            <Route path="/admin/intakes/:intakeId" element={<IntakeDetailScreen />} />
          </Route>
        </Routes>
      </main>
      <ToastContainer />
    </Router>
  );
}

export default App;