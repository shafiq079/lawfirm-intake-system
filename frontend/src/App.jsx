import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import CreateIntakeScreen from './screens/CreateIntakeScreen';
import ClientIntakeScreen from './screens/ClientIntakeScreen';
import IntakeDetailScreen from './screens/IntakeDetailScreen';
import PrivateRoute from './components/PrivateRoute';
import VoiceIntakeScreen from './screens/VoiceIntakeScreen';
import ClientTextIntakeScreen from './screens/ClientTextIntakeScreen';
import DocumentUploadScreen from './screens/DocumentUploadScreen';
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
          <Route path="/intake/:intakeLink" element={<ClientIntakeScreen />} />
          <Route path="/text-intake" element={<ClientTextIntakeScreen />} /> {/* New Text Intake Route */}
          <Route path="/document-upload" element={<DocumentUploadScreen />} /> {/* New Document Upload Route */}
          <Route path="/voice-intake" element={<VoiceIntakeScreen />} /> {/* New Voice Intake Route */}
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