import { useEffect, useState, useMemo } from 'react';
import { getCurrentUser, getDocuments, getDashboardStats } from '../services/api';
import { useNavigate } from 'react-router-dom';

// --- ICONS ---
const DashboardIcon = () => (<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const DocumentIcon = () => (<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const UploadIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const LogoutIcon = () => (<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const UserIcon = () => (<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const ChartIcon = () => (<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
const ShieldCheckIcon = () => (<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TrendingUpIcon = () => (<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        const docsData = await getDocuments();
        setDocuments(docsData);

        try {
          const statsData = await getDashboardStats();
          setStats(statsData);
        } catch (e) {
          console.warn("Analytics endpoint not ready yet");
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getPercent = (val) => {
    if (!stats || stats.total_trades === 0) return '0%';
    return `${(val / stats.total_trades) * 100}%`;
  };

  const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    // FIXED: Changed min-h-screen to h-screen and added overflow-hidden
    <div className="h-screen bg-slate-50 flex font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR - Fixed Left Panel */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:flex flex-col h-full">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">TF</div>
            EXPLORER
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">User Dashboard</p>
        </div>

        {/* Navigation - Scrolls internally if list is long */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <DashboardIcon /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'documents' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <DocumentIcon /> My Documents
          </button>
          <button 
            onClick={() => navigate('/transactions')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <ChartIcon /> Transactions
          </button>
        </nav>

        {/* Footer - Pinned to bottom */}
        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogoutIcon /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT - Scrolls independently */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Top Mobile Header */}
        <header className="bg-white border-b border-slate-200 md:hidden p-4 flex items-center justify-between sticky top-0 z-20">
          <span className="font-bold text-slate-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs">TF</div>
            Trade Finance
          </span>
          <button onClick={handleLogout} className="p-2 text-slate-600"><LogoutIcon /></button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}!</h2>
              <p className="text-slate-500 text-sm mt-1">Here's what's happening with your trade documents today.</p>
            </div>
            
            <div className="flex gap-3">
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95"
                >
                  Admin Panel
                </button>
              )}

              <button 
                onClick={() => navigate('/upload')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <UploadIcon /> Upload New
              </button>
            </div>
          </div>

          {activeTab === 'overview' && stats && (
            <>
              {/* ANALYTICS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Risk Distribution Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      Risk Exposure Analysis
                    </h3>
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Live Data</span>
                  </div>
                  
                  <div className="space-y-5">
                    {/* High Risk */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> High Risk ({'>'} $1M)
                        </span>
                        <span className="font-bold text-slate-900">{getPercent(stats.risk_distribution.high)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: getPercent(stats.risk_distribution.high) }}></div>
                      </div>
                    </div>

                    {/* Medium Risk */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Medium Risk ({'>'} $100k)
                        </span>
                        <span className="font-bold text-slate-900">{getPercent(stats.risk_distribution.medium)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: getPercent(stats.risk_distribution.medium) }}></div>
                      </div>
                    </div>

                    {/* Low Risk */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Low Risk (Standard)
                        </span>
                        <span className="font-bold text-slate-900">{getPercent(stats.risk_distribution.low)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: getPercent(stats.risk_distribution.low) }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl text-xs text-indigo-700 border border-indigo-100 flex items-start gap-3">
                    <div className="p-1 bg-indigo-100 rounded-full text-indigo-600 mt-0.5"><TrendingUpIcon /></div>
                    <div>
                      <p className="font-bold mb-0.5">AI Insight</p>
                      <p>You have processed <span className="font-bold">{stats.total_trades}</span> transactions with a total volume of <span className="font-bold">${stats.total_volume.toLocaleString()}</span>. Your risk profile appears stable.</p>
                    </div>
                  </div>
                </div>

                {/* KPI Cards Column */}
                <div className="grid grid-rows-3 gap-4">
                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                      <div>
                        <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Total Documents</p>
                        <p className="text-3xl font-bold text-slate-900">{documents.length}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <DocumentIcon />
                      </div>
                   </div>
                   
                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-green-200 transition-colors">
                      <div>
                        <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Trade Volume</p>
                        <p className="text-3xl font-bold text-slate-900">${(stats.total_volume / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <TrendingUpIcon />
                      </div>
                   </div>

                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-purple-200 transition-colors">
                      <div>
                        <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Account Status</p>
                        <p className="text-xl font-bold text-slate-900 capitalize flex items-center gap-2">
                          {user.role} 
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <ShieldCheckIcon />
                      </div>
                   </div>
                </div>

              </div>
            </>
          )}

          {/* TABLE SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {activeTab === 'overview' ? 'Recent Documents' : 'My Documents Repository'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Manage and track your uploaded trade artifacts.</p>
              </div>
              {activeTab === 'overview' && (
                <button 
                  onClick={() => setActiveTab('documents')} 
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  View All
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-slate-500 uppercase font-bold text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Doc Type</th>
                    <th className="px-6 py-4">Ref Number</th>
                    {activeTab === 'documents' && <th className="px-6 py-4">Hash (Preview)</th>}
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeTab === 'overview' ? documents.slice(0, 5) : documents).map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          doc.doc_type === 'INVOICE' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          doc.doc_type === 'LOC' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {doc.doc_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{doc.doc_number}</td>
                      
                      {activeTab === 'documents' && (
                        <td className="px-6 py-4 font-mono text-xs text-slate-400 group-hover:text-slate-600 transition-colors" title={doc.hash}>
                          {doc.hash.substring(0, 12)}...
                        </td>
                      )}
                      
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(activeTab === 'overview' ? doc.issued_at : doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/documents/${doc.id}`)} 
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs px-3 py-1.5 bg-white border border-indigo-100 hover:border-indigo-200 rounded-lg shadow-sm transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={activeTab === 'overview' ? 4 : 5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <DocumentIcon />
                          </div>
                          <p className="font-medium text-slate-600">No documents found</p>
                          <p className="text-xs mt-1">Get started by uploading your first trade document.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;