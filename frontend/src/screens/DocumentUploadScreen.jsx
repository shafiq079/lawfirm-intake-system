import React, { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';

const DocumentUploadScreen = () => {
  const [ocrResult, setOcrResult] = useState(null);

  const handleOcrComplete = (data) => {
    setOcrResult(data.text);
    // Here you would typically parse the extracted text and populate form fields
    console.log('OCR Result:', data.text);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Document Upload & OCR</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Upload your documents for OCR processing. The extracted text will appear below.
      </p>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
        <DocumentUpload onOcrComplete={handleOcrComplete} />
      </div>

      {ocrResult && (
        <div className="mt-6 w-full max-w-md p-4 bg-gray-100 rounded-lg shadow-inner">
          <h3 className="font-semibold text-gray-700 mb-2">Extracted Text:</h3>
          <textarea
            className="w-full h-48 p-3 border border-gray-300 rounded-lg text-sm text-gray-800 resize-none"
            value={ocrResult}
            readOnly
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadScreen;
