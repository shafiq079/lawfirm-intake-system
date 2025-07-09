
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
    return <div className="flex items-center justify-center min-h-screen"><p className="text-color-text-secondary">Loading intake details...</p></div>;
  }

  if (!selectedIntake) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-color-text-secondary">Intake not found.</p></div>;
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ease-in-out">
      <div className="max-w-4xl mx-auto bg-color-secondary p-6 rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
        <h1 className="text-3xl font-bold text-color-text mb-6 border-b pb-4 border-color-border">Intake Details: <span className="text-color-accent">{selectedIntake.intakeType}</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <p className="text-color-text"><strong className="font-semibold">Status:</strong> <span className="capitalize">{selectedIntake.status}</span></p>
          <p className="text-color-text"><strong className="font-semibold">Clio Sync Status:</strong> <span className="capitalize">{selectedIntake.clioSyncStatus || 'Not Synced'}</span></p>
          <p className="text-color-text"><strong className="font-semibold">Created At:</strong> {new Date(selectedIntake.createdAt).toLocaleDateString()}</p>
          <p className="text-color-text col-span-2"><strong className="font-semibold">Intake Link:</strong> <a href={`/intake/${selectedIntake.intakeLink}`} target="_blank" rel="noopener noreferrer" className="text-color-accent hover:underline">{selectedIntake.intakeLink}</a></p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => handleSyncToClio()}
            className={`bg-color-success hover:bg-color-success text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync to Clio'}
          </button>
          {selectedIntake.clioSyncStatus === 'Synced' && (
            <button
              onClick={() => handleSyncToClio(true)}
              className={`ml-4 bg-color-warning hover:bg-color-warning text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={syncing}
            >
              {syncing ? 'Re-syncing...' : 'Re-sync to Clio'}
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold text-color-text mt-6 mb-3">Risk Alerts</h2>
        <div className="bg-color-primary border border-color-border text-color-text px-4 py-3 rounded-lg relative mb-6 shadow-sm">
          {selectedIntake.riskAlerts && selectedIntake.riskAlerts.length > 0 ? (
            <ul className="list-disc list-inside text-color-error">
              {selectedIntake.riskAlerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          ) : (
            <p className="text-color-success">No immediate risks identified.</p>
          )}
          <p className="text-sm text-color-text-secondary mt-2"><em>(Requires backend logic for risk assessment.)</em></p>
        </div>

        <h2 className="text-xl font-bold text-color-text mt-6 mb-3">Full Intake Form Data</h2>
        <div className="bg-color-primary p-4 rounded-lg mb-6 border border-color-border shadow-sm">
          {selectedIntake.formData && Object.keys(selectedIntake.formData).length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-color-text">
              {Object.entries(selectedIntake.formData).map(([key, value]) => {
                // Handle nested objects (e.g., children array)
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  return (
                    <li key={key}>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <ul className="list-disc list-inside ml-4 text-color-text-secondary">
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
                      <ul className="list-disc list-inside ml-4 text-color-text-secondary">
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
            <p className="text-color-text-secondary">No form data available.</p>
          )}
        </div>

        <h2 className="text-xl font-bold text-color-text mt-6 mb-3">Full Intake Summary</h2>
        <div className="bg-color-primary p-4 rounded-lg mb-6 border border-color-border shadow-sm">
          {selectedIntake.summary ? (
            <p className="text-color-text whitespace-pre-wrap">{selectedIntake.summary}</p>
          ) : (
            <p className="text-color-text-secondary">No comprehensive summary available yet.</p>
          )}
          <p className="text-sm text-color-text-secondary mt-2"><em>(Requires backend processing of intake responses.)</em></p>
        </div>

        <h2 className="text-xl font-bold text-color-text mt-6 mb-3">Audio Recordings and Transcripts</h2>
        <div className="bg-color-primary p-4 rounded-lg mb-6 border border-color-border shadow-sm">
          <p className="text-color-text-secondary">Placeholder for audio recordings and their transcripts.</p>
          <p className="text-sm text-color-text-secondary mt-2"><em>(Requires storage of audio files and transcription from voice intake.)</em></p>
        </div>

        <h2 className="text-xl font-bold text-color-text mt-6 mb-3">Downloadable Full Case Report</h2>
        <button
          className="bg-color-accent hover:bg-color-accent text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out"
          disabled
        >
          Download Report (Placeholder)
        </button>
        <p className="text-sm text-color-text-secondary mt-2"><em>(Requires backend generation of report.)</em></p>
      </div>
    </div>
  );
};

export default IntakeDetailScreen;
