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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-color-text mb-6">Document Upload & OCR</h1>
      <p className="text-lg text-color-text-secondary mb-8 text-center">
        Upload your documents for OCR processing. The extracted text will appear below.
      </p>
      <div className="w-full max-w-md bg-color-secondary p-8 rounded-lg shadow-lg flex flex-col items-center transition-colors duration-300 ease-in-out">
        <DocumentUpload onOcrComplete={handleOcrComplete} />
      </div>

      {ocrResult && (
        <div className="mt-6 w-full max-w-md p-4 bg-color-primary rounded-lg shadow-inner border border-color-border transition-colors duration-300 ease-in-out">
          <h3 className="font-semibold text-color-text mb-2">Extracted Text:</h3>
          <textarea
            className="w-full h-48 p-3 border border-color-border rounded-lg text-sm text-color-text resize-none bg-color-secondary transition-colors duration-300 ease-in-out"
            value={ocrResult}
            readOnly
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadScreen;
