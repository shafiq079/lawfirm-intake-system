
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listIntakes } from '../features/intakeSlice';
import { checkClioConnection } from '../features/userSlice';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboardScreen = () => {
  const dispatch = useDispatch();

  const intakeList = useSelector((state) => state.intake);
  const { loading, error, intakes } = intakeList;

  const userLogin = useSelector((state) => state.user);
  const { userInfo, clioConnected } = userLogin;

  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    dispatch(listIntakes());
    dispatch(checkClioConnection());

    const handleFocus = () => {
      dispatch(listIntakes());
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch, userInfo]);

  const handleInitiateCall = async (intakeLink) => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post('/api/voice/initiate', { phoneNumber, intakeLink }, config);
      toast.success('Call initiated successfully!');
    } catch (err) {
      toast.error(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };



  const handleSyncToClio = async (intakeLink) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post('/api/clio/sync', { intakeLink }, config);
      toast.success('Intake synced to Clio successfully!');
    } catch (err) {
      toast.error(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };

  const handleConnectClio = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/api/clio/auth-url', config);
      window.location.href = data.authUrl;
    } catch (err) {
      toast.error(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto bg-color-secondary p-6 rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
        <h1 className="text-3xl font-bold text-color-text mb-6">Admin Dashboard</h1>

        {/* Action Buttons and Phone Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-4">
            <Link
              to="/admin/intakes/create"
              className="bg-color-success hover:bg-color-success font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md"
            >
              Create New Intake
            </Link>
            <button
              onClick={handleConnectClio}
              className={`font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md ${clioConnected ? 'bg-color-border text-color-text-secondary cursor-not-allowed' : 'bg-color-accent hover:bg-color-accent text-white'}`}
              disabled={clioConnected}
            >
              {clioConnected ? 'Connected to Clio' : 'Connect to Clio'}
            </button>
          </div>
          <input
            type="text"
            placeholder="Client Phone Number (e.g., +1234567890)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-color-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          />
        </div>

        {/* Loading, Error, and No Intakes States */}
        {loading ? (
          <div className="text-center py-8 text-color-text-secondary">Loading intakes...</div>
        ) : error ? (
          <div className="bg-color-error border border-color-error text-white px-4 py-3 rounded relative mb-4 shadow-md" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : intakes && intakes.length > 0 ? (
          <div className="overflow-x-auto bg-color-secondary rounded-lg transition-colors duration-300 ease-in-out">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-color-primary">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-color-text-secondary uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-color-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-color-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-color-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-color-text-secondary uppercase tracking-wider">
                    Risk Alerts
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-color-text-secondary uppercase tracking-wider">
                    Summary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-color-text-secondary uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-color-border">
                {intakes.map((intake) => (
                  <tr key={intake._id} className="bg-color-secondary hover:bg-color-primary transition-colors duration-300 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-color-text">
                      <Link to={`/admin/intakes/${intake._id}`} className="text-color-accent hover:text-color-accent">
                        {intake._id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-color-text-secondary">{intake.intakeType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-color-text-secondary">{intake.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/intake/${intake.intakeLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-color-accent hover:text-color-accent mr-3"
                      >
                        View Intake
                      </a>
                      <button
                        onClick={() => handleInitiateCall(intake.intakeLink)}
                        className="bg-color-accent hover:bg-color-accent text-xs py-1 px-2 rounded-md mr-3 shadow-sm"
                      >
                        Call
                      </button>
                      <button
                        onClick={() => handleSyncToClio(intake.intakeLink)}
                        className="bg-color-success hover:bg-color-success text-xs py-1 px-2 rounded-md shadow-sm"
                      >
                        Sync to Clio
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-color-text-secondary">
                      {intake.riskAlerts && intake.riskAlerts.length > 0 ? (
                        <ul className="list-disc list-inside text-color-error">
                          {intake.riskAlerts.map((alert, index) => (
                            <li key={index}>{alert}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-color-success">No immediate risks</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-color-text-secondary">
                      {intake.summary ? (
                        <p className="line-clamp-3">{intake.summary}</p>
                      ) : (
                        <span className="text-color-text-secondary">No summary yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-color-text-secondary">
                      {new Date(intake.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-color-text-secondary">No intakes found. Create a new one!</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardScreen;
