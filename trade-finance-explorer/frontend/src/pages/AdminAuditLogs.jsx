import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getAuditLogs } from '../services/api';

// --- ICONS (Consistent with Admin Layout) ---
const GridIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const UsersIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const ActivityIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const SettingsIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const LogoutIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
const BellIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);

const AdminAuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = await getCurrentUser();
      // Ensure only admins can see this
      if (!user.role || user.role.toLowerCase() !== 'admin') {
        alert("Access Denied. Admins only.");
        navigate('/dashboard');
        return;
      }
      
      const logData = await getAuditLogs();
      setLogs(logData);
    } catch (err) {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

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
          <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            <GridIcon /> Dashboard
          </button>
          
          <button onClick={() => navigate('/admin/users')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            <UsersIcon /> User Management
          </button>
          
          {/* Active State for Audit Logs */}
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-700">
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 relative">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
          <h2 className="text-xl font-bold text-slate-800">System Logs</h2>
          <div className="flex items-center gap-4">
             <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-full">
               Total Events: {logs.length}
             </span>
             <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:ring-indigo-100 transition-all">
                A
             </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8 scroll-smooth">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">{error}</div>}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Recent Activity</h3>
              <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 border border-slate-200 rounded">Total Events: {logs.length}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Performed By</th>
                    <th className="px-6 py-4">Target Entity</th>
                    <th className="px-6 py-4">ID Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-inner">
                            {log.admin_name ? log.admin_name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <span className="text-slate-700 font-medium">{log.admin_name || `Admin #${log.admin_id}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          {log.target_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-indigo-600 bg-indigo-50/50 w-fit px-2 py-1 rounded text-xs">
                        #{log.target_id}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <ActivityIcon />
                          <p>No system events recorded yet.</p>
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

export default AdminAuditLogs;