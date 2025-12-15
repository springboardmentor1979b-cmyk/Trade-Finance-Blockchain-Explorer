import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getAllDocumentsAdmin, deleteDocumentAdmin } from '../services/api';

// --- EXISTING ICONS ---
const GridIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const UsersIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const ActivityIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const SettingsIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const SearchIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const BellIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const DownloadIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const LogoutIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const FilterIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>);
const SortIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>);

// --- NEW ACTION MENU ICONS ---
const MoreVerticalIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>);
const EyeIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const FileTextIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const ShieldCheckIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- COMPONENT: ADVANCED ACTION MENU ---
const ActionMenu = ({ doc, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all duration-200 ${
          isOpen ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        }`}
      >
        <MoreVerticalIcon />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 origin-top-right transform transition-all animate-in fade-in zoom-in-95 duration-100">
          
          {/* Section 1: Details */}
          <div className="p-1.5 border-b border-slate-50">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-left group">
              <span className="text-slate-400 group-hover:text-indigo-500"><EyeIcon /></span>
              View Details
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-left group">
              <span className="text-slate-400 group-hover:text-indigo-500"><FileTextIcon /></span>
              View Contract
            </button>
          </div>

          {/* Section 2: Blockchain / Verification */}
          <div className="p-1.5 border-b border-slate-50">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors text-left group">
              <span className="text-emerald-500"><ShieldCheckIcon /></span>
              Verify Fingerprint
            </button>
          </div>

          {/* Section 3: Actions */}
          <div className="p-1.5">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-left group">
              <span className="text-slate-400 group-hover:text-indigo-500"><DownloadIcon /></span>
              Download
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete(doc.id);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left group"
            >
              <span className="text-red-400 group-hover:text-red-600"><TrashIcon /></span>
              Delete Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const user = await getCurrentUser();
      // Case-insensitive check for admin role
      if (!user.role || user.role.toLowerCase() !== 'admin') {
        alert("Access Denied. Admins only.");
        navigate('/dashboard');
        return;
      }
      const docs = await getAllDocumentsAdmin();
      setDocuments(docs);
    } catch (err) {
      setError("Failed to load system data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Document #${id}? This action is irreversible.`)) return;
    try {
      await deleteDocumentAdmin(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Advanced Filtering
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        doc.doc_number.toLowerCase().includes(lowerSearch) ||
        doc.hash.toLowerCase().includes(lowerSearch) ||
        (doc.owner_name && doc.owner_name.toLowerCase().includes(lowerSearch)) ||
        (doc.owner_email && doc.owner_email.toLowerCase().includes(lowerSearch));
      const matchesType = filterType === 'ALL' || doc.doc_type === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [documents, searchTerm, filterType, sortOrder]);

  const stats = {
    total: documents.length,
    users: new Set(documents.map(d => d.owner_id)).size,
    volume: documents.length * 15000, 
    growth: 12.5
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex font-sans text-slate-800 overflow-hidden">
      
      {/* --- ADMIN SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col h-full">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-wider">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">TF</div>
            ADMIN
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">System Control</p>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
          <button 
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-700">
            <GridIcon />Document Dashboard
          </button>
          
          <button 
            onClick={() => navigate('/admin/users')} 
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <UsersIcon /> User Management
          </button>
          
          <button 
            onClick={() => navigate('/admin/audit-logs')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            <ActivityIcon /> Audit Logs
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            <SettingsIcon /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
            Exit to User View
          </button>
          <button onClick={handleLogout} className="w-full py-2 px-4 border border-red-900/30 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <LogoutIcon /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">System Overview</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <BellIcon />
              </button>
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 text-slate-600 hover:text-red-600 transition-colors">
              <LogoutIcon />
            </button>
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white ring-2 ring-indigo-50 cursor-pointer hover:ring-indigo-100 transition-all">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 scroll-smooth">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><GridIcon /></div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Documents</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><UsersIcon /></div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+3 New</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Users</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.users}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><ActivityIcon /></div>
                <span className="text-xs font-bold text-slate-400">24h</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">System Volume</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">${(stats.volume / 1000).toFixed(1)}k</h3>
            </div>

            {/* Visual Analytics Bar (CSS only) */}
            <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ActivityIcon />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Traffic Load</p>
              <div className="flex items-end gap-1 h-12 mb-2">
                <div className="w-1/6 bg-indigo-500 h-6 rounded-t transition-all group-hover:h-8"></div>
                <div className="w-1/6 bg-indigo-500 h-8 rounded-t transition-all group-hover:h-10"></div>
                <div className="w-1/6 bg-indigo-400 h-5 rounded-t transition-all group-hover:h-7"></div>
                <div className="w-1/6 bg-white h-10 rounded-t shadow-glow transition-all group-hover:h-12"></div>
                <div className="w-1/6 bg-indigo-500 h-7 rounded-t transition-all group-hover:h-9"></div>
                <div className="w-1/6 bg-indigo-600 h-4 rounded-t transition-all group-hover:h-6"></div>
              </div>
              <p className="text-xs text-indigo-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> System load is optimal.
              </p>
            </div>
          </div>

          {/* ADVANCED TABLE SECTION */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible">
            
            {/* Table Toolbar */}
            <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm placeholder:text-slate-400"
                  placeholder="Search Ref ID & User..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 w-full md:w-auto items-center">
                {(searchTerm || filterType !== 'ALL' || sortOrder !== 'newest') && (
                  <button onClick={() => { setSearchTerm(''); setFilterType('ALL'); setSortOrder('newest'); }} className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-wider mr-2">
                    Clear Filters
                  </button>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500"><FilterIcon /></div>
                  <select 
                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-9 pr-8 py-2 shadow-sm outline-none cursor-pointer appearance-none font-medium transition-all hover:border-slate-400"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="ALL">All Types</option>
                    <option value="INVOICE">Invoices</option>
                    <option value="LOC">Letters of Credit</option>
                    <option value="BILL_OF_LADING">Bill of Lading</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500"><SortIcon /></div>
                  <select 
                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-9 pr-8 py-2 shadow-sm outline-none cursor-pointer appearance-none font-medium transition-all hover:border-slate-400"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => navigate('/upload')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
                >
                  + Add New
                </button>
              </div>
            </div>

            {/* Data Grid */}
            <div className="overflow-visible min-h-[400px]">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Uploaded By</th>
                    <th className="px-6 py-4">Document Info</th>
                    <th className="px-6 py-4">Digital Fingerprint</th>
                    <th className="px-6 py-4">Created at</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-indigo-50/30 transition-colors group">
                      
                      {/* User Column with Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
                            {doc.owner_name ? doc.owner_name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">{doc.owner_name || 'Unknown User'}</span>
                            <span className="text-xs text-slate-500">{doc.owner_email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Document Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 text-sm">{doc.doc_number}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1 border border-slate-200 tracking-wide">
                            {doc.doc_type}
                          </span>
                        </div>
                      </td>

                      {/* Hash */}
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 max-w-[140px] truncate select-all cursor-text group-hover:border-indigo-200 group-hover:bg-white transition-colors" title={doc.hash}>
                          {doc.hash}
                        </div>
                      </td>

                      {/* Status / Date */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-s text-slate-500 mt-2 font-medium">{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* ADVANCED ACTIONS COLUMN */}
                      <td className="px-6 py-4 text-right">
                         <ActionMenu doc={doc} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                  
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                            <GridIcon />
                          </div>
                          <p className="text-lg font-semibold text-slate-700">No documents found</p>
                          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                          <button onClick={() => {setSearchTerm(''); setFilterType('ALL'); setSortOrder('newest');}} className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-bold hover:underline">
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs font-medium text-slate-500">
              <span>Showing {filteredDocs.length} of {documents.length} entries</span>
              <div className="flex gap-1">
                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 shadow-sm" disabled>Previous</button>
                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 shadow-sm" disabled>Next</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;