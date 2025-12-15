import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../services/api';

const UploadDocument = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('INVOICE');
  const [docNumber, setDocNumber] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    
    setError('');
    setLoading(true);

    // 1. Prepare Form Data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('doc_number', docNumber);

    // 2. FIX: STRICT DATE FORMATTING
    // We explicitly convert the date to an ISO String to prevent 422 Errors
    try {
      const dateObj = issuedAt ? new Date(issuedAt) : new Date();
      formData.append('issued_at', dateObj.toISOString());
    } catch (e) {
      // Fallback if date is invalid
      formData.append('issued_at', new Date().toISOString());
    }

    try {
      await uploadDocument(formData);
      alert('Document uploaded successfully!');
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      // Try to read specific server error if available
      const serverMsg = err.response?.data?.detail || 'Upload failed. Please check your inputs.';
      setError(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">Upload Trade Document</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Document Type</label>
            <select 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="INVOICE">Invoice</option>
              <option value="LOC">Letter of Credit (LOC)</option>
              <option value="BILL_OF_LADING">Bill of Lading</option>
              <option value="PO">Purchase Order</option>
              <option value="COO">Certificate of Origin</option>
              <option value="INSURANCE_CERT">Insurance Certificate</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Document Number</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., INV-2023-001"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Issued Date</label>
            <input 
              type="datetime-local" 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Select File</label>
            <input 
              type="file" 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-2 px-4 rounded transition duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;