
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
  }, [dispatch]);

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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        {/* Action Buttons and Phone Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-4">
            <Link
              to="/admin/intakes/create"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
            >
              Create New Intake
            </Link>
            <button
              onClick={handleConnectClio}
              className={`font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out ${clioConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Loading, Error, and No Intakes States */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading intakes...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : intakes && intakes.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Alerts
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intakes.map((intake) => (
                  <tr key={intake._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/admin/intakes/${intake._id}`} className="text-blue-600 hover:text-blue-900">
                        {intake._id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{intake.intakeType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{intake.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/intake/${intake.intakeLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View Intake
                      </a>
                      <button
                        onClick={() => handleInitiateCall(intake.intakeLink)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded-md mr-3"
                      >
                        Call
                      </button>
                      <button
                        onClick={() => handleSyncToClio(intake.intakeLink)}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs py-1 px-2 rounded-md"
                      >
                        Sync to Clio
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {intake.riskAlerts && intake.riskAlerts.length > 0 ? (
                        <ul className="list-disc list-inside text-red-600">
                          {intake.riskAlerts.map((alert, index) => (
                            <li key={index}>{alert}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-green-600">No immediate risks</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {intake.summary ? (
                        <p className="line-clamp-3">{intake.summary}</p>
                      ) : (
                        <span className="text-gray-500">No summary yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(intake.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-600">No intakes found. Create a new one!</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardScreen;
