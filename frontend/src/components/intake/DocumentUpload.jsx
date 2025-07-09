import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DocumentUpload = ({ onAutoFill, nextStep, prevStep, intakeLink, formData, updateFormData }) => {
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState({}); // { "docType": { cloudinaryUrl: "url", fileName: "name", status: "uploaded" } }
  const [selectedFiles, setSelectedFiles] = useState({}); // { "docType": File }
  const [loading, setLoading] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState(null); // Tracks which docType is currently uploading

  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      setLoading(true);
      try {
        const response = await axios.post('/api/intakes/required-documents', { formData });
        setRequiredDocuments(response.data);
      } catch (error) {
        console.error("Error fetching required documents:", error);
        toast.error("Failed to load required documents.");
        setRequiredDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(formData).length > 0) {
      fetchRequiredDocuments();
    } else {
      setRequiredDocuments([]);
    }
  }, [formData]);

  const handleFileSelect = (docType, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [docType]: file
    }));
    // Optionally reset upload status if a new file is selected after an error or successful upload
    setUploadedDocuments(prev => {
      const newState = { ...prev };
      if (newState[docType] && newState[docType].status !== 'uploading') {
        delete newState[docType]; // Clear previous upload status/URL
      }
      return newState;
    });
  };

  const handleUploadDocument = async (docType) => {
    const file = selectedFiles[docType];
    if (!file) {
      toast.error(`Please select a file for ${docType} first.`);
      return;
    }

    setUploadingDocType(docType);
    setUploadedDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], status: 'uploading' } }));

    const uploadFormData = new FormData();
    uploadFormData.append('document', file);

    try {
      const response = await axios.post('/api/upload/required-document', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { cloudinaryUrl } = response.data;
      setUploadedDocuments(prev => ({
        ...prev,
        [docType]: { cloudinaryUrl, fileName: file.name, status: 'uploaded' }
      }));
      toast.success(`${docType} uploaded successfully!`);
    } catch (error) {
      console.error(`Error uploading ${docType}:`, error);
      setUploadedDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], status: 'error' } }));
      toast.error(`Failed to upload ${docType}. Please try again.`);
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleNext = () => {
    // Check if all required documents have been uploaded
    const allRequiredUploaded = requiredDocuments.every(docType => uploadedDocuments[docType]?.status === 'uploaded');

    if (!allRequiredUploaded) {
      toast.warn("Please upload all required documents before proceeding.");
      return;
    }

    // Transform uploadedDocuments object into an array for MongoDB storage
    const documentsToSave = Object.keys(uploadedDocuments).map(docType => ({
      documentType: docType,
      cloudinaryUrl: uploadedDocuments[docType].cloudinaryUrl,
    }));

    // Update the main form data with the uploaded documents
    updateFormData({ uploadedDocuments: documentsToSave });

    nextStep();
  };

  const getButtonClass = (docType) => {
    const status = uploadedDocuments[docType]?.status;
    if (status === 'uploaded') return 'bg-green-500 hover:bg-green-600';
    if (status === 'uploading') return 'bg-yellow-500 cursor-not-allowed';
    if (status === 'error') return 'bg-red-500 hover:bg-red-600';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const getButtonText = (docType) => {
    const status = uploadedDocuments[docType]?.status;
    if (status === 'uploaded') return 'Uploaded';
    if (status === 'uploading') return 'Uploading...';
    if (status === 'error') return 'Retry Upload';
    return 'Upload';
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 7: Document Upload</h2>
      <p className="text-gray-600">Based on your provided information, please upload the required documents:</p>

      {loading ? (
        <p>Loading required documents...</p>
      ) : requiredDocuments.length > 0 ? (
        <div className="space-y-4">
          {requiredDocuments.map((docType) => (
            <div key={docType} className="flex flex-col md:flex-row items-start md:items-center justify-between border p-3 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-0 md:w-1/3">{docType}</label>
              <div className="flex flex-col md:flex-row items-start md:items-center md:w-2/3 space-y-2 md:space-y-0 md:space-x-2">
                <input
                  type="file"
                  onChange={(e) => handleFileSelect(docType, e.target.files[0])}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <button
                  type="button"
                  onClick={() => handleUploadDocument(docType)}
                  disabled={!selectedFiles[docType] || uploadingDocType === docType || uploadedDocuments[docType]?.status === 'uploaded'}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${getButtonClass(docType)} transition duration-300 ease-in-out`}
                >
                  {getButtonText(docType)}
                </button>
                {uploadedDocuments[docType]?.status === 'uploaded' && (
                  <span className="text-xs text-green-600 ml-2"></span>
                )}
                {uploadedDocuments[docType]?.status === 'error' && (
                  <span className="text-xs text-red-600 ml-2">Upload failed.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No specific documents are currently required based on your selections, or more information is needed.</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={requiredDocuments.some(docType => uploadedDocuments[docType]?.status !== 'uploaded') || uploadingDocType !== null} // Disable if any required doc not uploaded or any doc is uploading
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${requiredDocuments.some(docType => uploadedDocuments[docType]?.status !== 'uploaded') || uploadingDocType !== null ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default DocumentUpload;