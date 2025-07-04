import React from 'react';

const DocumentUploadScreen = () => {
  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      console.log('Files selected:', files);
      // Placeholder for OCR processing (Tesseract.js or Google Vision API ready)
      alert('Document(s) selected for upload. OCR processing will be handled here.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Document Upload</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Please upload your documents here. OCR will be performed automatically.
      </p>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
        <label
          htmlFor="document-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
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
          <input id="document-upload" type="file" className="hidden" multiple onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
};

export default DocumentUploadScreen;
