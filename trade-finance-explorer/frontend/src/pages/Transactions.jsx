import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTransaction, getTransactions, updateTransactionStatus } from '../services/api';

// --- ICONS ---
const RefreshIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>);
const DollarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ArrowRightIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>);
const CheckCircleIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ClockIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const PlusIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>);

const Transactions = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [formData, setFormData] = useState({ buyer_email: '', amount: '', currency: 'USD' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      // Sort by newest first
      setTrades(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error("Failed to load trades", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      await createTransaction(formData);
      await fetchTrades();
      setFormData({ buyer_email: '', amount: '', currency: 'USD' });
      setSuccessMsg("Trade Initiated Successfully!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateTransactionStatus(id, newStatus);
      await fetchTrades();
    } catch (error) {
      alert("Failed to update status. Ensure you are authorized.");
    }
  };

  // --- STATS ---
  const stats = useMemo(() => {
    return {
      totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
      activeCount: trades.filter(t => t.status !== 'completed').length,
      completedCount: trades.filter(t => t.status === 'completed').length
    };
  }, [trades]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-slate-500 hover:text-indigo-600 mb-2 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              &larr; Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trade Settlements</h1>
            <p className="text-slate-500 mt-1">Real-time financial transaction monitoring.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><DollarIcon /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Volume</p>
                <p className="text-lg font-bold text-slate-900">${(stats.totalVolume / 1000).toFixed(1)}k</p>
              </div>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><ActivityIcon /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Active</p>
                <p className="text-lg font-bold text-slate-900">{stats.activeCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: TRANSACTION FEED */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
              <button onClick={fetchTrades} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                <RefreshIcon />
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse h-24"></div>
                ))}
              </div>
            ) : trades.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <DollarIcon />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Transactions Yet</h3>
                <p className="text-slate-500 text-sm mt-1">Start a new trade using the form on the right.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trades.map((trade) => (
                  <div key={trade.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    {/* Status Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      trade.status === 'completed' ? 'bg-green-500' : 
                      trade.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-400'
                    }`}></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-4">
                      
                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-400">#{trade.id}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">{new Date(trade.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          {trade.currency} {parseFloat(trade.amount).toLocaleString()}
                          {trade.amount > 100000 && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">High Value</span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Counterparty: <span className="font-medium text-slate-700">User #{trade.buyer_id === trade.seller_id ? 'Self' : (trade.buyer_id === 1 ? trade.seller_id : trade.buyer_id)}</span>
                        </p>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                          trade.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          trade.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {trade.status === 'completed' ? <CheckCircleIcon /> : <ClockIcon />}
                          {trade.status.replace('_', ' ')}
                        </span>

                        <div className="flex gap-2">
                          {trade.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(trade.id, 'in_progress')}
                              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              Start Process
                            </button>
                          )}
                          {trade.status === 'in_progress' && (
                            <button 
                              onClick={() => handleStatusUpdate(trade.id, 'completed')}
                              className="text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: CREATE FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
                  <PlusIcon />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">New Trade</h3>
                  <p className="text-xs text-slate-500">Initiate a settlement</p>
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
              {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-100">{successMsg}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Counterparty Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="partner@trade.com"
                      value={formData.buyer_email}
                      onChange={(e) => setFormData({...formData, buyer_email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Currency</label>
                    <select 
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CNY">CNY (¥)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex justify-center items-center gap-2 ${
                    submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {submitting ? 'Processing...' : (
                    <>
                      Initiate Trade <ArrowRightIcon />
                    </>
                  )}
                </button>
                
                <p className="text-xs text-center text-slate-400 mt-4">
                  Trades over $100k trigger automatic risk assessment.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper Icon for stats
const ActivityIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);

export default Transactions;