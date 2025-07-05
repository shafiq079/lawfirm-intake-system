import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DocumentUpload = ({ onAutoFill, nextStep, prevStep, intakeLink }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (selectedFiles.length > 0) {
      const file = selectedFiles[0]; // Assuming only one file for OCR processing
      const formData = new FormData();
      formData.append('document', file);

      try {
        const response = await axios.post('/api/uploads/ocr', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const { structuredData } = response.data;
        onAutoFill(structuredData);
        toast.success("Information extracted from document and auto-filled!");
      } catch (error) {
        console.error("Error uploading document for OCR:", error);
        toast.error("Failed to extract information from document. Please try manual input.");
      }
    } else {
      toast.info("No documents selected. Proceeding to next step.");
    }

    nextStep();
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 7: Document Upload (Optional)</h2>
      <p className="text-gray-600">Allow user to upload: Passport Copy, Visa Copy, Previous Immigration Documents, I-94, Marriage/Birth Certificates, Resume or CV, Financial Proof, Letter of Support or Recommendation.</p>
      <p className="text-gray-600">These documents should be automatically scanned for data and used to auto-fill available fields in previous steps (if not already filled).</p>

      <div>
        <label htmlFor="documentUpload" className="block text-sm font-medium text-gray-700">Upload Documents</label>
        <input
          type="file"
          name="documentUpload"
          id="documentUpload"
          multiple
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {selectedFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Selected files: {selectedFiles.map(file => file.name).join(', ')}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Previous
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload & Next
        </button>
      </div>
    </form>
  );
};

export default DocumentUpload;
