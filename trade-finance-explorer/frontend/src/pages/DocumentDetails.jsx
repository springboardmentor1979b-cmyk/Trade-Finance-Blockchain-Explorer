import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, getLedger, addLedgerEntry } from '../services/api';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for data
  const [document, setDocument] = useState(null);
  const [ledger, setLedger] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState('SHIPPED');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Document Metadata
      const docData = await getDocumentById(id);
      setDocument(docData);
      
      // 2. Fetch Blockchain Ledger History
      const ledgerData = await getLedger(id);
      setLedger(ledgerData);
    } catch (err) {
      console.error("Error fetching document:", err);
      // Set error state instead of redirecting immediately to avoid loops
      setError(err.message || "Could not load document details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    setSubmitting(true);
    try {
      // Add entry to blockchain ledger
      await addLedgerEntry(id, action, { updated_by: 'User Dashboard', note: 'Status update' });
      // Refresh data to show new entry immediately
      await fetchData(); 
      alert('Ledger updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update ledger. You might not have permission.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Loading State ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-500 font-medium">Loading blockchain data...</div>
    </div>
  );

  // --- Error State ---
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md border border-red-100 text-center max-w-md">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Document</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-blue-600 mb-6 hover:underline flex items-center gap-1 font-medium"
        >
          &larr; Back to Dashboard
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COL: Document Details & Actions */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Metadata Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Document Details</h2>
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Document Type</p>
                  <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-100">
                    {document.doc_type}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Reference No.</p>
                  <p className="font-medium text-slate-900 text-lg">{document.doc_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Blockchain Hash (SHA-256)</p>
                  <div className="font-mono text-xs text-slate-600 break-all bg-slate-100 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {document.hash}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Issued Date</p>
                  <p className="font-medium text-slate-900">
                    {new Date(document.issued_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                   <a 
                     href={`${document.file_url}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center justify-center gap-2 w-full border border-slate-300 text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-50 transition"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Download File
                   </a>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Update Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Select New Status</label>
                  <select 
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  >
                    <option value="SHIPPED">Mark as SHIPPED</option>
                    <option value="RECEIVED">Mark as RECEIVED</option>
                    <option value="VERIFIED">Mark as VERIFIED</option>
                    <option value="PAID">Mark as PAID</option>
                    <option value="AMENDED">Mark as AMENDED</option>
                    <option value="CANCELLED">Mark as CANCELLED</option>
                  </select>
                </div>
                <button 
                  onClick={handleAddEntry}
                  disabled={submitting}
                  className={`w-full text-white font-bold py-3 rounded-lg transition shadow-sm flex justify-center items-center ${
                    submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Ledger...
                    </>
                  ) : (
                    'Record on Ledger'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COL: Ledger Timeline */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Immutable Ledger History
              </h2>
              
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-10 pl-8 pb-4">
                {ledger.length === 0 && (
                  <div className="text-slate-400 italic text-sm bg-slate-50 p-4 rounded border border-dashed border-slate-300">
                    No history recorded yet. The document has been initialized.
                  </div>
                )}
                
                {ledger.map((entry, index) => (
                  <div key={entry.id} className="relative group">
                    {/* Timeline Connector & Dot */}
                    <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-blue-600 shadow-sm z-10 group-hover:scale-110 transition-transform"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-md text-sm font-bold shadow-sm ${
                          entry.action === 'ISSUED' ? 'bg-slate-100 text-slate-700' :
                          entry.action === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                          entry.action === 'PAID' ? 'bg-green-100 text-green-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {entry.action}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-1 sm:mt-0">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>Action recorded by User ID: <span className="font-mono font-semibold text-slate-800">{entry.actor_id}</span></span>
                      </div>
                      
                      {entry.metadata_info && Object.keys(entry.metadata_info).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Metadata Block</p>
                          <pre className="text-xs font-mono bg-white p-2 rounded border border-slate-200 overflow-x-auto text-slate-600">
                            {JSON.stringify(entry.metadata_info, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;