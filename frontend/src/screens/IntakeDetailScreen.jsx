
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getIntakeDetails, clearIntakeDetails } from '../features/intakeSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

const IntakeDetailScreen = () => {
  const { intakeId } = useParams();
  const dispatch = useDispatch();

  const intakeDetailsState = useSelector((state) => state.intake);
  const { loading, error, selectedIntake } = intakeDetailsState;

  useEffect(() => {
    if (intakeId) {
      dispatch(getIntakeDetails(intakeId));
    }

    return () => {
      dispatch(clearIntakeDetails());
    };
  }, [dispatch, intakeId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const [syncing, setSyncing] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-gray-600">Loading intake details...</p></div>;
  }

  if (!selectedIntake) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-gray-600">Intake not found.</p></div>;
  }

  const handleSyncToClio = async (resync = false) => {
    if (!selectedIntake.intakeLink) {
      toast.error("Intake link not available for syncing.");
      return;
    }

    if (selectedIntake.clioSyncStatus === 'Synced' && !resync) {
      if (!window.confirm("This client is already synced to Clio. Do you want to re-sync?")) {
        return;
      }
    }

    setSyncing(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      };
      const { data } = await axios.post(
        '/api/clio/sync',
        { intakeLink: selectedIntake.intakeLink, resync },
        config
      );
      toast.success(data.message || "Client data successfully synced to Clio.");
      dispatch(getIntakeDetails(intakeId)); // Refresh data after sync
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      toast.error(`Failed to sync: ${message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Intake Details: <span className="text-indigo-600">{selectedIntake.intakeType}</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <p className="text-gray-700"><strong className="font-semibold">Status:</strong> <span className="capitalize">{selectedIntake.status}</span></p>
          <p className="text-gray-700"><strong className="font-semibold">Clio Sync Status:</strong> <span className="capitalize">{selectedIntake.clioSyncStatus || 'Not Synced'}</span></p>
          <p className="text-gray-700"><strong className="font-semibold">Created At:</strong> {new Date(selectedIntake.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-700 col-span-2"><strong className="font-semibold">Intake Link:</strong> <a href={`/intake/${selectedIntake.intakeLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedIntake.intakeLink}</a></p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => handleSyncToClio()}
            className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync to Clio'}
          </button>
          {selectedIntake.clioSyncStatus === 'Synced' && (
            <button
              onClick={() => handleSyncToClio(true)}
              className={`ml-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={syncing}
            >
              {syncing ? 'Re-syncing...' : 'Re-sync to Clio'}
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">Risk Alerts</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative mb-6">
          {selectedIntake.riskAlerts && selectedIntake.riskAlerts.length > 0 ? (
            <ul className="list-disc list-inside">
              {selectedIntake.riskAlerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600">No immediate risks identified.</p>
          )}
          <p className="text-sm text-gray-600 mt-2"><em>(Requires backend logic for risk assessment.)</em></p>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">Full Intake Form Data</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          {selectedIntake.formData && Object.keys(selectedIntake.formData).length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(selectedIntake.formData).map(([key, value]) => {
                // Handle nested objects (e.g., children array)
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  return (
                    <li key={key}>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <ul className="list-disc list-inside ml-4">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <li key={subKey}><span className="font-medium capitalize">{subKey.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(subValue)}</li>
                        ))}
                      </ul>
                    </li>
                  );
                } else if (Array.isArray(value)) {
                  return (
                    <li key={key}>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <ul className="list-disc list-inside ml-4">
                        {value.map((item, index) => (
                          <li key={index}>
                            {typeof item === 'object' && item !== null ? (
                              <ul className="list-disc list-inside ml-4">
                                {Object.entries(item).map(([subKey, subValue]) => (
                                  <li key={subKey}><span className="font-medium capitalize">{subKey.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(subValue)}</li>
                                ))}
                              </ul>
                            ) : String(item)}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                } else {
                  return (
                    <li key={key}>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(value)}
                    </li>
                  );
                }
              })}
            </ul>
          ) : (
            <p className="text-gray-600">No form data available.</p>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">Full Intake Summary</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          {selectedIntake.summary ? (
            <p className="text-gray-800 whitespace-pre-wrap">{selectedIntake.summary}</p>
          ) : (
            <p className="text-gray-600">No comprehensive summary available yet.</p>
          )}
          <p className="text-sm text-gray-600 mt-2"><em>(Requires backend processing of intake responses.)</em></p>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">Audio Recordings and Transcripts</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <p className="text-gray-600">Placeholder for audio recordings and their transcripts.</p>
          <p className="text-sm text-gray-600 mt-2"><em>(Requires storage of audio files and transcription from voice intake.)</em></p>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">Downloadable Full Case Report</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out"
          disabled
        >
          Download Report (Placeholder)
        </button>
        <p className="text-sm text-gray-600 mt-2"><em>(Requires backend generation of report.)</em></p>
      </div>
    </div>
  );
};

export default IntakeDetailScreen;
