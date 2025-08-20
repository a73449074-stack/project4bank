// Feedback popup component
function FeedbackPopup({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-72 text-center animate-fade-in">
        <div className="text-green-600 font-bold text-lg mb-2">Success</div>
        <div className="text-gray-800 mb-4">{message}</div>
        <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";


// Show admin main account balance as sum of all user balances
function AdminMainBalance() {
  const [total, setTotal] = React.useState(0);
  React.useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(users => {
        const sum = users.reduce((acc, u) => acc + (typeof u.balance === 'number' ? u.balance : 0), 0);
        setTotal(sum);
      });
  }, []);
  return (
    <div className="text-3xl font-bold text-white tracking-wide text-center">{total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} $</div>
  );
}

export default function AdminDashboard() {
  const [feedback, setFeedback] = useState(null);

  // Sidebar open/close state (default: closed, never auto-opens)
  const [sidebarOpen, setSidebarOpen] = useState(() => false);
  // State for approved users modal
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addFunds, setAddFunds] = useState({ amount: '', name: '', bank: '' });
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userActionError, setUserActionError] = useState('');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState('');
  const [popupData, setPopupData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const receiptRef = React.useRef();
  async function downloadReceipt() {
    if (!popupData) return;
    setReceiptData(popupData);
    setTimeout(async () => {
      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${popupData.title.replace(/\s+/g, '_')}_receipt.png`;
        link.click();
        setReceiptData(null);
      }
    }, 100);
  }

  function downloadReceipt(title, date, amount) {
    const content = `Receipt\nTitle: ${title}\nDate: ${date}\nAmount: ${amount}`.replace(/\\n/g, '\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_receipt.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  function downloadReceipt(title, date, amount) {
    const content = `Receipt\nTitle: ${title}\nDate: ${date}\nAmount: ${amount}`.replace(/\\n/g, '\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_receipt.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  function downloadReceipt(title, date, amount) {
    const content = `Receipt\nTitle: ${title}\nDate: ${date}\nAmount: ${amount}`;
    const fixedContent = content.replace(/\\n/g, '\n');
    const blob = new Blob([fixedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_receipt.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  // Helper for downloading receipts
  function downloadReceipt(title, date, amount) {
    const content = `Receipt\nTitle: ${title}\nDate: ${date}\nAmount: ${amount}`;
    const fixedContent = content.replace(/\\n/g, '\n');
    const blob = new Blob([fixedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_receipt.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  // Only keep new transactions (approved/declined after mount)
  // FIX: Always show all pending transactions for admin approval
  const fetchAll = () => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        setPendingUsers(data.filter(u => !u.approved));
        setApprovedUsers(data.filter(u => u.approved));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
    fetch('http://localhost:5000/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data); // Always show all transactions
        setTxLoading(false);
      })
      .catch(() => {
        setTxError('Failed to load transactions');
        setTxLoading(false);
      });
  };
  useEffect(() => { fetchAll(); }, [approving]);

  const approveUser = async (id) => {
    setApproving(id);
    await fetch(`http://localhost:5000/api/users/${id}/approve`, { method: 'PATCH' });
    setApproving('');
  };

  // Tab state
  const [activeTab, setActiveTab] = useState('statistics');

  // Calculate pending transactions count
  const pendingTransactionsCount = transactions.filter(tx => tx.status === 'pending').length;

  return (
    <>
      {/* Sidebar toggle button */}
      <button
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Toggle sidebar"
      >
        {/* Hamburger icon */}
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>

      {/* Sidebar (hidden by default, slides in when open) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#232b2b] shadow-2xl z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ willChange: 'transform' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-bold text-lg">Admin Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="text-white text-2xl leading-none">×</button>
        </div>
        {/* Add sidebar content here if needed */}
        <div className="p-4 text-white/80 text-sm">Sidebar content here</div>
        <button
          className="w-full mt-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={() => {
            localStorage.removeItem('user');
            window.location.reload();
          }}
        >Log Out</button>
      </div>

      {/* Main content overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#232b2b] to-[#3a506b] px-2 py-4">
        <div className="glassy rounded-3xl p-4 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in border border-blue-200/40 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="admin" className="w-8 h-8 rounded-full border-2 border-white" />
              <span className="text-white font-semibold text-sm">My Wallet</span>
            </div>
            {/* Removed bell and gear icons */}
          </div>
          {/* Balance */}
          <div className="mt-2 mb-4">
            <div className="text-white text-lg font-semibold">TODAY</div>
            <AdminMainBalance />
          </div>
          {/* Tabs */}
          <div className="flex items-center justify-between mt-4 mb-2 border-b border-white/10">
            <button
              className={`flex-1 text-xs py-2 border-b-2 ${activeTab === 'activities' ? 'text-white font-bold border-white' : 'text-white/60 border-transparent'}`}
              onClick={() => setActiveTab('activities')}
            >ACTIVITIES</button>
            <button
              className={`flex-1 text-xs py-2 border-b-2 ${activeTab === 'statistics' ? 'text-white font-bold border-white' : 'text-white/60 border-transparent'}`}
              onClick={() => setActiveTab('statistics')}
            >STATISTICS</button>
            <button
              className={`flex-1 text-xs py-2 border-b-2 ${activeTab === 'summary' ? 'text-white font-bold border-white' : 'text-white/60 border-transparent'}`}
              onClick={() => setActiveTab('summary')}
            >SUMMARY</button>
          </div>
          {/* Tab Content */}
          {activeTab === 'statistics' && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  className="stat-card bg-blue-500/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={() => setShowUsersModal(true)}
                >
                  <div className="text-xs">TOTAL USERS</div>
                  <div className="text-lg font-bold">{approvedUsers.length}</div>
                  <div className="text-xs mt-1">+12 this week</div>
                </button>
                <button
                  className="stat-card bg-yellow-400/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={() => setActiveTab('activities')}
                >
                  <div className="text-xs">PENDING REQUESTS</div>
                  <div className="text-lg font-bold">{pendingUsers.length}</div>
                  <div className="text-xs mt-1">{pendingUsers.length === 0 ? 'No pending users' : `+${pendingUsers.length} pending`}</div>
                </button>
                <button
                  className="stat-card bg-green-500/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={() => setActiveTab('summary')}
                >
                  <div className="text-xs">TOTAL ASSET</div>
                  <div className="text-lg font-bold">€ 1,200,000</div>
                  <div className="text-xs mt-1">+€ 50,000 this month</div>
                </button>
                <button
                  className="stat-card bg-pink-500/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={() => setActiveTab('activities')}
                >
                  <div className="text-xs">PENDING TRANSACTIONS</div>
                  <div className="text-lg font-bold">{pendingTransactionsCount}</div>
                  <div className="text-xs mt-1">{pendingTransactionsCount === 0 ? 'No pending tx' : `+${pendingTransactionsCount} pending`}</div>
                </button>
              </div>
            </>
          )}
          {activeTab === 'activities' && (
            <div className="mb-4">
              <div className="text-white/80 font-semibold text-sm mb-2">Recent Activities</div>
              <div className="bg-white/10 rounded-xl p-3">
                {transactions.length === 0 ? (
                  <div className="text-green-400 text-xs">No activities yet</div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {transactions.slice(0, 5).map((tx) => (
                      <li key={tx._id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <span className="text-white font-medium text-xs">{tx.type.toUpperCase()} ({tx.status})</span>
                          <div className="text-white/50 text-[10px]">{new Date(tx.createdAt).toLocaleString()}</div>
                          <div className="text-white/50 text-[10px]">User: {tx.user?.name || tx.user}</div>
                        </div>
                        <span className={tx.type === 'deposit' ? 'text-green-400 font-bold text-xs' : 'text-red-400 font-bold text-xs'}>{tx.amount} $</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          {activeTab === 'summary' && (
            <div className="mb-4">
              <div className="text-white/80 font-semibold text-sm mb-2">Summary</div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-white/70 text-xs mb-2">Total Users: {approvedUsers.length}</div>
                <div className="text-white/70 text-xs mb-2">Pending Users: {pendingUsers.length}</div>
                <div className="text-white/70 text-xs mb-2">Total Transactions: {transactions.length}</div>
                <div className="text-white/70 text-xs mb-2">Pending Transactions: {pendingTransactionsCount}</div>
                <div className="text-white/70 text-xs">Total Asset: € 1,200,000</div>
              </div>
            </div>
          )}
          <style>{`
            .stat-card:active {
              transform: scale(0.98);
            }
          `}</style>
          <div className="mt-6">
            <div className="text-white/80 font-semibold text-sm mb-2">All Transactions</div>
            <div className="bg-white/10 rounded-xl p-3">
              {txLoading ? (
                <div className="text-white/70 text-xs">Loading...</div>
              ) : txError ? (
                <div className="text-red-400 text-xs">{txError}</div>
              ) : (
                <>
                  <button
                    className="mb-2 px-3 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => setTransactions([])}
                  >Clear All Receipts</button>
                  <ul className="divide-y divide-white/10">
                    {transactions.length === 0 && <li className="text-green-400 text-xs">No transactions</li>}
                    {[...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((tx) => (
                      <li key={tx._id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <span className="text-white font-medium text-xs">{tx.type.toUpperCase()} ({tx.status})</span>
                          <div className="text-white/50 text-[10px]">{new Date(tx.createdAt).toLocaleString()}</div>
                          <div className="text-white/50 text-[10px]">User: {tx.user?.name || tx.user}</div>
                        </div>
                        <span className={tx.type === 'deposit' ? 'text-green-400 font-bold text-xs' : 'text-red-400 font-bold text-xs'}>{tx.amount} $</span>
                        {tx.status === 'pending' && (
                          <div className="flex flex-col gap-1 ml-2">
                            <button className="px-2 py-0.5 bg-green-500 text-white rounded text-xs mb-1" onClick={async () => {
                              await fetch(`/api/transactions/${tx._id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
                              fetchAll();
                            }}>Approve</button>
                            <button className="px-2 py-0.5 bg-red-500 text-white rounded text-xs" onClick={async () => {
                              await fetch(`/api/transactions/${tx._id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'declined' }) });
                              fetchAll();
                            }}>Decline</button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          {/* Hidden Receipt for Image Download */}
          {receiptData && (
            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
              <div ref={receiptRef} className="bg-white text-gray-900 rounded-lg shadow-lg p-6 w-72 text-center border border-gray-200">
                <div className="font-bold text-lg mb-2">Receipt</div>
                <div className="mb-1">Transaction ID: {receiptData.id || 'TXN123456'}</div>
                <div className="mb-1">Title: {receiptData.title}</div>
                <div className="mb-1">Date: {receiptData.date}</div>
                <div className="mb-1">Time: {receiptData.time || '14:32'}</div>
                <div className="mb-1">Type: {receiptData.type || 'Debit'}</div>
                <div className="mb-1">Amount: {receiptData.amount}</div>
                <div className="text-xs text-gray-400 mt-2">Thank you for using My Wallet</div>
              </div>
            </div>
          )}
          {/* Popup for viewing receipt details */}
          {popupData && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
                <div className="font-bold text-lg mb-2 text-center">Transaction Receipt</div>
                <div className="mb-1"><span className="font-semibold">Transaction ID:</span> {popupData.id || 'TXN123456'}</div>
                <div className="mb-1"><span className="font-semibold">Section ID:</span> {popupData.sectionId || 'SEC-001'}</div>
                <div className="mb-1"><span className="font-semibold">Recipient Name:</span> {popupData.recipient || 'John Doe'}</div>
                <div className="mb-1"><span className="font-semibold">Sender Details:</span> {popupData.sender || 'Jane Smith, 0123456789'}</div>
                <div className="mb-1"><span className="font-semibold">Title:</span> {popupData.title}</div>
                <div className="mb-1"><span className="font-semibold">Date:</span> {popupData.date}</div>
                <div className="mb-1"><span className="font-semibold">Time:</span> {popupData.time || '14:32'}</div>
                <div className="mb-1"><span className="font-semibold">Type:</span> {popupData.type || 'Debit'}</div>
                <div className="mb-1"><span className="font-semibold">Amount:</span> {popupData.amount}</div>
                <div className="mb-1"><span className="font-semibold">Remark:</span> {popupData.remark || 'Payment for services'}</div>
                <div className="flex gap-4 mt-4 justify-center">
                  <button onClick={() => setPopupData(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
                  <button onClick={downloadReceipt} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Download</button>
                </div>
              </div>
            </div>
          )}
          {/* Pending Users Section */}
          <div className="mt-4">
            <div className="text-white/80 font-semibold text-sm mb-2">Pending User Approvals</div>
            <div className="bg-white/10 rounded-xl p-3">
              {loading ? (
                <div className="text-white/70 text-xs">Loading...</div>
              ) : error ? (
                <div className="text-red-400 text-xs">{error}</div>
              ) : (
                <ul>
                  {pendingUsers.length === 0 && <li className="text-green-400 text-xs">No pending users</li>}
                  {pendingUsers.map((u) => (
                    <li key={u._id} className="flex items-center justify-between py-1">
                      <span className="text-white/90 text-xs">{u.name}</span>
                      <button
                        className="ml-2 px-2 py-0.5 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
                        onClick={() => approveUser(u._id)}
                        disabled={approving === u._id}
                      >
                        {approving === u._id ? "Approving..." : "Approve"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <style>{`
            .glassy {
              background: rgba(40, 50, 80, 0.85);
              box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
              backdrop-filter: blur(18px);
              -webkit-backdrop-filter: blur(18px);
              border-radius: 28px;
              border: 1.5px solid rgba(100,180,255,0.18);
            }
            .glassy-popup {
              background: rgba(40, 50, 80, 0.65);
              box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
              backdrop-filter: blur(18px);
              -webkit-backdrop-filter: blur(18px);
              border-radius: 18px;
              border: 1.5px solid rgba(100,180,255,0.18);
            }
            @keyframes animate-fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: animate-fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
            }
          `}</style>
        </div>
        {/* Approved Users Modal */}
        {showUsersModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" onClick={() => { setShowUsersModal(false); setSelectedUser(null); }}>×</button>
              <div className="font-bold text-lg mb-4 text-center">All Approved Users</div>
              {!selectedUser ? (
                <ul className="divide-y divide-gray-200">
                  {approvedUsers.length === 0 && <li className="text-green-600 text-xs">No approved users</li>}
                  {approvedUsers.map(u => (
                    <li key={u._id} className="py-2 flex items-center justify-between hover:bg-gray-100 px-2 rounded cursor-pointer" onClick={() => setSelectedUser(u)}>
                      <span className="font-semibold text-gray-800">{u.name}</span>
                      <span className="text-xs text-gray-500">{u.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <button className="mb-2 text-blue-500 text-xs underline" onClick={() => setSelectedUser(null)}>&larr; Back to users</button>
                  {/* User Details Section */}
                  <div className="mb-2"><span className="font-semibold text-black">Name:</span> <span className="text-black">{selectedUser?.name || <span className='text-gray-400'>N/A</span>}</span></div>
                  <div className="mb-2"><span className="font-semibold text-black">Email:</span> <span className="text-black">{selectedUser?.email || <span className='text-gray-400'>N/A</span>}</span></div>
                  <div className="mb-2"><span className="font-semibold text-black">Password:</span> <span className="text-black">{selectedUser?.password || <span className='text-gray-400'>N/A</span>}</span></div>
                  <div className="mb-2"><span className="font-semibold text-black">Transaction Pin:</span> <span className="text-black">{selectedUser?.transactionPin || <span className='text-gray-400'>N/A</span>}</span></div>
                  {/* Blocked/Frozen/Locked Indicator */}
                  {(selectedUser?.blocked || selectedUser?.locked || selectedUser?.frozen) && (
                    <div className="mb-2">
                      <span className="font-semibold text-black">Status:</span> {' '}
                      {selectedUser?.blocked && <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mr-1">Blocked</span>}
                      {selectedUser?.frozen && <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mr-1">Frozen</span>}
                      {selectedUser?.locked && <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded">Locked</span>}
                    </div>
                  )}
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 mb-2">
                    {/* Block/Unblock */}
                    {selectedUser?.blocked ? (
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs transition duration-150 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer"
                        disabled={userActionLoading}
                        onClick={async () => {
                          setUserActionLoading(true); setUserActionError('');
                          try {
                            await fetch(`/api/users/${selectedUser._id}/unblock`, { method: 'PATCH' });
                            const res = await fetch(`/api/users/${selectedUser._id}`);
                            const updated = await res.json();
                            setSelectedUser(updated);
                            fetchAll();
                            setFeedback('User has been unblocked successfully.');
                          } catch { setUserActionError('Failed to unblock user'); }
                          setUserActionLoading(false);
                        }}
                      >Unblock User</button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-xs transition duration-150 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                        disabled={userActionLoading}
                        onClick={async () => {
                          setUserActionLoading(true); setUserActionError('');
                          try {
                            await fetch(`/api/users/${selectedUser._id}/block`, { method: 'PATCH' });
                            const res = await fetch(`/api/users/${selectedUser._id}`);
                            const updated = await res.json();
                            setSelectedUser(updated);
                            fetchAll();
                            setFeedback('User has been blocked successfully.');
                          } catch { setUserActionError('Failed to block user'); }
                          setUserActionLoading(false);
                        }}
                      >Block from Transaction</button>
                    )}
                    {/* Freeze/Unfreeze */}
                    {selectedUser?.frozen ? (
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs transition duration-150 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer"
                        disabled={userActionLoading}
                        onClick={async () => {
                          setUserActionLoading(true); setUserActionError('');
                          try {
                            await fetch(`/api/users/${selectedUser._id}/unfreeze`, { method: 'PATCH' });
                            const res = await fetch(`/api/users/${selectedUser._id}`);
                            const updated = await res.json();
                            setSelectedUser(updated);
                            fetchAll();
                            setFeedback('User account has been unfrozen successfully.');
                          } catch { setUserActionError('Failed to unfreeze account'); }
                          setUserActionLoading(false);
                        }}
                      >Unfreeze Account</button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs transition duration-150 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                        disabled={userActionLoading}
                        onClick={async () => {
                          setUserActionLoading(true); setUserActionError('');
                          try {
                            await fetch(`/api/users/${selectedUser._id}/freeze`, { method: 'PATCH' });
                            const res = await fetch(`/api/users/${selectedUser._id}`);
                            const updated = await res.json();
                            setSelectedUser(updated);
                            fetchAll();
                            setFeedback('User account has been frozen successfully.');
                          } catch { setUserActionError('Failed to freeze account'); }
                          setUserActionLoading(false);
                        }}
                      >Freeze Account</button>
                    )}
                    {/* Delete */}
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs transition duration-150 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
                      disabled={userActionLoading}
                      onClick={async () => {
                        if (!window.confirm('Delete this user?')) return;
                        setUserActionLoading(true); setUserActionError('');
                        try {
                          await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, { method: 'DELETE' });
                          setSelectedUser(null); fetchAll();
                          setFeedback('User has been deleted successfully.');
                        } catch { setUserActionError('Failed to delete user'); }
                        setUserActionLoading(false);
                      }}
                    >Delete User</button>
                  </div>
                  <div className="mt-2 mb-2">
                    <div className="font-semibold mb-1">Add Funds</div>
                    <div className="flex gap-2 mb-2">
                      <input type="number" className="border rounded px-2 py-1 text-xs w-20" placeholder="Amount" value={addFunds.amount} onChange={e => setAddFunds(f => ({ ...f, amount: e.target.value }))} />
                      <input type="text" className="border rounded px-2 py-1 text-xs w-28" placeholder="Sender Name" value={addFunds.name} onChange={e => setAddFunds(f => ({ ...f, name: e.target.value }))} />
                      <input type="text" className="border rounded px-2 py-1 text-xs w-28" placeholder="Bank" value={addFunds.bank} onChange={e => setAddFunds(f => ({ ...f, bank: e.target.value }))} />
                      <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" disabled={userActionLoading || !addFunds.amount || !addFunds.name || !addFunds.bank} onClick={async () => {
                        setUserActionLoading(true); setUserActionError('');
                        try {
                          await fetch(`http://localhost:5000/api/users/${selectedUser._id}/add-funds`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount: addFunds.amount, name: addFunds.name, bank: addFunds.bank })
                          });
                          setAddFunds({ amount: '', name: '', bank: '' });
                          fetchAll();
                        } catch { setUserActionError('Failed to add funds'); }
                        setUserActionLoading(false);
                      }}>Add</button>
                    </div>
                  </div>

                  {userActionError && <div className="text-red-500 text-xs mt-2">{userActionError}</div>}

                </div>
              )}
  {/* Feedback Popup */}
  {feedback && <FeedbackPopup message={feedback} onClose={() => setFeedback(null)} />}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
