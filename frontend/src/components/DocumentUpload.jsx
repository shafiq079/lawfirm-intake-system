
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Tooltip from './Tooltip';

const DocumentUpload = ({ onOcrComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileChangeHandler = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setExtractedText('');
      setError(null);
    } else {
      setSelectedFile(null);
      toast.error('Please select an image file (e.g., JPG, PNG).');
    }
  };

  const fileUploadHandler = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : ''}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setExtractedText(data.text);
      if (onOcrComplete) {
        onOcrComplete({ text: data.text });
      }
    } catch (err) {
      setError(err.response && err.response.data.message
        ? err.response.data.message
        : err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Upload & OCR</h2>
      <p className="text-gray-600 mb-6 text-center">Upload documents for OCR processing.</p>

      <div className="w-full max-w-md">
        <Tooltip text="Select a document to upload for OCR processing.">
          <label
            htmlFor="document-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-300 ease-in-out"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, DOCX, JPG, PNG, etc.</p>
            </div>
            <input id="document-upload" type="file" className="hidden" onChange={fileChangeHandler} />
          </label>
        </Tooltip>

        {selectedFile && (
          <p className="mt-2 text-sm text-gray-700">Selected file: <span className="font-medium">{selectedFile.name}</span></p>
        )}

        <Tooltip text="Click to upload the selected document and initiate OCR.">
          <button
            onClick={fileUploadHandler}
            disabled={!selectedFile || loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out"
          >
            {loading ? 'Processing...' : 'Upload & Process'}
          </button>
        </Tooltip>
      </div>

      {error && <div className="text-red-500 mt-4 text-center">Error: {error}</div>}

      {extractedText && (
        <div className="mt-6 w-full max-w-md p-4 bg-gray-100 rounded-lg shadow-inner">
          <h3 className="font-semibold text-gray-700 mb-2">Extracted Text:</h3>
          <p className="whitespace-pre-wrap text-sm text-gray-800 max-h-60 overflow-y-auto border border-gray-300 p-3 rounded">{extractedText}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
