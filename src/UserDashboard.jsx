import { useEffect } from 'react';
import { getUser } from './api.js';
import React, { useRef, useState } from 'react';
import html2canvas from "html2canvas";
import AirtimePopup from './AirtimePopup';
import DataPopup from './DataPopup';
import BettingPopup from './BettingPopup';
import TVPopup from './TVPopup';
import SafeBoxPopup from './SafeBoxPopup';
import LoanPopup from './LoanPopup';
import ReferPopup from './ReferPopup';

export default function UserDashboard({ onShowRevenuesChart, onShowExpensesChart }) {
  const [popupData, setPopupData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showCardsPopup, setShowCardsPopup] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('STATISTICS'); // 'ACTIVITIES' | 'STATISTICS' | 'SUMMARY'
  // Always use backend for profilePic and name
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {});
  const name = user.name || 'User';
  const profilePic = user.profilePic;
  const cards = user.cards || [];
  const [uploadingPic, setUploadingPic] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [pending, setPending] = useState([]);
  const [revenues, setRevenues] = useState(0);
  const [expenses, setExpenses] = useState(0);

  // Feature popups state
  const [showAirtime, setShowAirtime] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showBetting, setShowBetting] = useState(false);
  const [showTV, setShowTV] = useState(false);
  const [showSafeBox, setShowSafeBox] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [showRefer, setShowRefer] = useState(false);

  async function fetchTransactionsAndUser() {
    if (!user._id) return;
    // Fetch user from backend for fresh balance and profilePic
    const userRes = await fetch(`/api/users/${user._id}`);
    if (userRes.ok) {
      const freshUser = await userRes.json();
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    }
    const res = await fetch(`/api/transactions?userId=${user._id}`);
    if (res.ok) {
      const all = await res.json();
      // Only show transactions for this user
      const userTx = all.filter(tx => tx.user === user._id || (tx.user && tx.user._id === user._id));
      setTransactions(userTx);
      setPending(userTx.filter(tx => tx.status === 'pending'));
      // Calculate net inflow (revenues) and expenses from approved transactions
      let rev = 0, exp = 0;
      userTx.forEach(tx => {
        if (tx.status === 'approved') {
          if (tx.type === 'deposit') rev += Number(tx.amount);
          if (tx.type === 'withdraw' || tx.type === 'transfer') {
            exp += Number(tx.amount);
            rev -= Number(tx.amount); // net inflow
          }
        }
      });
      if (userTx.length === 0) {
        setRevenues(0);
        setExpenses(0);
      } else if (!userTx.some(tx => tx.status === 'approved')) {
        setRevenues(0);
        setExpenses(0);
      } else {
        setRevenues(rev);
        setExpenses(exp);
      }
    } else {
      setTransactions([]);
      setPending([]);
      setRevenues(0);
      setExpenses(0);
    }
  }

  useEffect(() => {
    fetchTransactionsAndUser();
    const handler = () => fetchTransactionsAndUser();
    window.addEventListener('profileUpdated', handler);
    return () => window.removeEventListener('profileUpdated', handler);
    // eslint-disable-next-line
  }, [user._id]);

  // Admin: Hard reset all transactions and balances (for testing)
  async function handleAdminResetAll() {
    if (!window.confirm('Are you sure you want to delete ALL transactions and reset ALL user balances?')) return;
    await fetch('/api/transactions/admin/reset-all', { method: 'POST' });
    setTransactions([]);
    setPending([]);
    setRevenues(0);
    setExpenses(0);
    localStorage.removeItem('transactions');
    setTimeout(() => fetchTransactionsAndUser(), 1000);
    window.location.reload();
  }
  const receiptRef = useRef();
  function downloadReceipt() {
    if (!popupData) return;
    setReceiptData(popupData);
    setTimeout(() => {
      if (receiptRef.current) {
        (async () => {
          const canvas = await html2canvas(receiptRef.current);
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${popupData.title.replace(/\s+/g, '_')}_receipt.png`;
          link.click();
          setReceiptData(null);
        })();
      }
    }, 100);
  }
  // Handler to reset all transactions and balance
  async function handleResetAccount() {
    if (!user._id) return;
    if (!window.confirm('Are you sure you want to delete all transaction history and reset your account balance to 0?')) return;
    const res = await fetch(`/api/transactions/reset/${user._id}`, { method: 'DELETE' });
    if (res.ok) {
      setTransactions([]);
      setPending([]);
      // Optionally update user balance in localStorage
      const updatedUser = { ...user, balance: 0 };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    }
  }
  // Main render
  // (fragment and return below)
  return (
  <>
      {/* Cards Linked Popup */}
      {showCardsPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowCardsPopup(false)}>✕</button>
            <div className="font-bold text-lg mb-2 text-center">Linked Cards ({cards.length})</div>
            {cards.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No cards linked yet.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cards.map(card => (
                  <li key={card.id} className="py-2 flex items-center gap-3">
                    <span className="inline-block w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">{card.type ? card.type[0] : '?'}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{card.type} <span className="text-xs text-gray-500">{card.number}</span></div>
                      <div className="text-xs text-gray-500">{card.holder}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Pending Transactions Popup */}
      {showPendingPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowPendingPopup(false)}>✕</button>
            <div className="font-bold text-lg mb-2 text-center">Pending Transactions ({pending.length})</div>
            {pending.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No pending transactions.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pending.map(txn => (
                  <li key={txn.id} className="py-2 flex items-center gap-3">
                    <span className="inline-block w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">{txn.title ? txn.title[0] : '?'}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{txn.title}</div>
                      <div className="text-xs text-gray-500">{txn.date}</div>
                    </div>
                    <span className="font-bold text-gray-700">{txn.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Popup for viewing receipt details */}
      {popupData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            className={`glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40 ${
              popupData.status === 'approved' ? 'bg-green-100/60' : popupData.status === 'declined' ? 'bg-red-100/60' : 'bg-yellow-100/60'
            }`}
            style={{
              background:
                popupData.status === 'approved'
                  ? 'rgba(34,197,94,0.18)'
                  : popupData.status === 'declined'
                  ? 'rgba(239,68,68,0.18)'
                  : 'rgba(253,224,71,0.18)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              borderRadius: 18,
              border: '1.5px solid rgba(100,180,255,0.18)'
            }}
          >
            <div className="font-bold text-lg mb-2 text-center">Transaction Receipt</div>
            <div className="mb-1"><span className="font-semibold">Transaction ID:</span> {popupData.id || 'TXN123456'}</div>
            <div className="mb-1"><span className="font-semibold">Section ID:</span> {popupData.sectionId || 'SEC-001'}</div>
            <div className="mb-1"><span className="font-semibold">Recipient Name:</span> {popupData.recipient === 'John Doe' || popupData.recipient === 'Jane Smith' ? 'Support' : (popupData.recipient || 'Support')}</div>
            <div className="mb-1"><span className="font-semibold">Sender Details:</span> {popupData.sender && (popupData.sender.includes('Jane Smith') || popupData.sender.includes('John Doe')) ? popupData.sender.replace(/Jane Smith|John Doe/g, 'Support') : (popupData.sender || 'Support, 0123456789')}</div>
            <div className="mb-1"><span className="font-semibold">Title:</span> {popupData.title}</div>
            <div className="mb-1"><span className="font-semibold">Date:</span> {popupData.date}</div>
            <div className="mb-1"><span className="font-semibold">Time:</span> {popupData.time || '14:32'}</div>
            <div className="mb-1"><span className="font-semibold">Type:</span> {popupData.type || 'Debit'}</div>
            <div className="mb-1"><span className="font-semibold">Status:</span> <span className={
              popupData.status === 'approved' ? 'text-green-600 font-bold' : popupData.status === 'declined' ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'
            }>{popupData.status ? popupData.status.toUpperCase() : 'PENDING'}</span></div>
            <div className="mb-1"><span className="font-semibold">Amount:</span> <span className={
              popupData.status === 'approved' ? 'text-green-600 font-bold' : popupData.status === 'declined' ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'
            }>{popupData.amount}</span></div>
            <div className="mb-1"><span className="font-semibold">Remark:</span> {popupData.remark || 'Payment for services'}</div>
            <div className="flex gap-4 mt-4 justify-center">
              <button onClick={async () => {
                setPopupData(null);
                // Refetch transactions and user for live update
                await fetchTransactionsAndUser();
              }} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
              <button onClick={downloadReceipt} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Download</button>
            </div>
          </div>
        </div>
      )}
      {/* Feature Popups */}
      {showAirtime && (
        <AirtimePopup onClose={() => setShowAirtime(false)} user={user} />
      )}
      {showData && (
        <DataPopup onClose={() => setShowData(false)} user={user} />
      )}
      {showBetting && (
        <BettingPopup onClose={() => setShowBetting(false)} user={user} />
      )}
      {showTV && (
        <TVPopup onClose={() => setShowTV(false)} user={user} />
      )}
      {showSafeBox && (
        <SafeBoxPopup onClose={() => setShowSafeBox(false)} user={user} />
      )}
      {showLoan && (
        <LoanPopup onClose={() => setShowLoan(false)} user={user} />
      )}
      {showRefer && (
        <ReferPopup onClose={() => setShowRefer(false)} user={user} />
      )}
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#232b2b] to-[#3a506b] px-2 py-4">
        <div className="glassy rounded-3xl p-4 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in border border-blue-200/40 relative">
          {/* Header/Profile Centered (chat icon removed) */}
          <div className="flex flex-col items-center justify-center mb-4 mt-2">
            <div className="relative w-20 h-20 mb-2">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-20 h-20 rounded-full border-4 border-blue-400 shadow-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-blue-400 shadow-xl bg-gradient-to-br from-blue-800 to-blue-400 flex items-center justify-center">
                  {/* Bank building SVG icon fallback */}
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
                    <rect x="3" y="10" width="18" height="10" rx="2" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                    <path d="M3 10L12 4L21 10" fill="none" stroke="#fff" strokeWidth="2.2" />
                    <rect x="7" y="14" width="2" height="3" rx="1" fill="#fff" />
                    <rect x="11" y="14" width="2" height="3" rx="1" fill="#fff" />
                    <rect x="15" y="14" width="2" height="3" rx="1" fill="#fff" />
                  </svg>
                </div>
              )}
              <label htmlFor="profilePicUpload" className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-0.5 cursor-pointer shadow-lg border-2 border-white transition-transform active:scale-90" title="Change Profile Picture" style={{width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {/* Camera icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.17a2 2 0 0 0 1.41-.59l1.83-1.82A2 2 0 0 1 10.83 2h2.34a2 2 0 0 1 1.42.59l1.83 1.82A2 2 0 0 0 17.83 5H21a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <input id="profilePicUpload" type="file" accept="image/*" className="hidden" onChange={async e => {
                  if (!e.target.files || !e.target.files[0]) return;
                  setUploadingPic(true);
                  const file = e.target.files[0];
                  const formData = new FormData();
                  formData.append('profilePic', file);
                  try {
                    const uploadRes = await fetch('/api/upload/profile-pic', {
                      method: 'POST',
                      body: formData
                    });
                    const uploadJson = await uploadRes.json();
                    if (uploadRes.ok && uploadJson.url) {
                      // Update user profilePic in backend
                      const patchRes = await fetch(`/api/users/${user._id}/profile`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profilePic: uploadJson.url })
                      });
                      if (patchRes.ok) {
                        const updatedUser = await patchRes.json();
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                      }
                    }
                  } finally {
                    setUploadingPic(false);
                  }
                }} />
              </label>
              {uploadingPic && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full"><span className="text-white text-xs">Uploading...</span></div>}
            </div>
            <span className="text-white font-extrabold text-2xl text-center mt-1 tracking-wide drop-shadow-lg" style={{letterSpacing:'0.02em'}}>{name}</span>
          </div>
          {/* Balance Centered */}
          <div className="mb-4 flex flex-col items-center">
            <div className="text-white text-lg font-semibold text-center">TODAY</div>
            <div className="text-3xl font-bold text-white tracking-wide text-center">{typeof user.balance === 'number' ? user.balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '0.00'} $</div>
            <div className="flex items-center gap-2 mt-1 justify-center">
              <span className="bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full">{user.balance ? '+' + user.balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '+0.00'} $</span>
              <span className="text-white/60 text-xs">Main Account Balance</span>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex items-center justify-between mt-4 mb-2 border-b border-white/10">
            <button className={`flex-1 text-xs py-2 border-b-2 transition-all duration-200 ${activeTab === 'ACTIVITIES' ? 'text-white font-bold border-white' : 'text-white/60 border-transparent'}`} onClick={() => setActiveTab('ACTIVITIES')}>ACTIVITIES</button>
            <button className={`flex-1 text-xs py-2 border-b-2 transition-all duration-200 ${activeTab === 'STATISTICS' ? 'text-white font-bold border-white' : 'text-white/60 border-transparent'}`} onClick={() => setActiveTab('STATISTICS')}>STATISTICS</button>
            <button className={`flex-1 text-xs py-2 border-b-2 transition-all duration-200 ${activeTab === 'SUMMARY' ? 'text-white font-bold border-white' : 'text-white/60 border-transparent'}`} onClick={() => setActiveTab('SUMMARY')}>SUMMARY</button>
          </div>
          {/* Tab Content */}
          {activeTab === 'STATISTICS' && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  className="stat-card bg-cyan-400/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={onShowRevenuesChart}
                >
                  <div className="text-xs">REVENUES</div>
                  <div className="text-lg font-bold">{revenues.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} $</div>
                  <div className="text-xs mt-1">{revenues === 0 ? '' : '▲'}</div>
                </button>
                <button
                  className="stat-card bg-indigo-400/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={onShowExpensesChart}
                >
                  <div className="text-xs">EXPENSES</div>
                  <div className="text-lg font-bold">{expenses.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} $</div>
                  <div className="text-xs mt-1">{expenses === 0 ? '' : '▼'}</div>
                </button>
                <button
                  className="stat-card bg-green-400/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={() => setShowCardsPopup(true)}
                >
                  <div className="text-xs">CARDS LINKED</div>
                  <div className="text-lg font-bold">{cards.length}</div>
                  <div className="text-xs mt-1">+1 this month</div>
                </button>
                <button
                  className="stat-card bg-pink-400/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                  onClick={() => setShowPendingPopup(true)}
                >
                  <div className="text-xs">PENDING TRANSACTIONS</div>
                  <div className="text-lg font-bold">{pending.length}</div>
                  <div className="text-xs mt-1">-1 today</div>
                </button>
                {/* New Feature Cards */}
                <button className="stat-card bg-yellow-400/90 rounded-xl p-3 text-white shadow-md hover:scale-105 focus:outline-none" onClick={() => setShowAirtime(true)}>
                  <div className="text-xs">AIRTIME</div>
                  <div className="text-lg font-bold">Buy</div>
                </button>
                <button className="stat-card bg-blue-400/90 rounded-xl p-3 text-white shadow-md hover:scale-105 focus:outline-none" onClick={() => setShowData(true)}>
                  <div className="text-xs">DATA</div>
                  <div className="text-lg font-bold">Buy</div>
                </button>
                <button className="stat-card bg-purple-500/90 rounded-xl p-3 text-white shadow-md hover:scale-105 focus:outline-none" onClick={() => setShowBetting(true)}>
                  <div className="text-xs">BETTING</div>
                  <div className="text-lg font-bold">Fund</div>
                </button>
                <button className="stat-card bg-orange-400/90 rounded-xl p-3 text-white shadow-md hover:scale-105 focus:outline-none" onClick={() => setShowTV(true)}>
                  <div className="text-xs">TV</div>
                  <div className="text-lg font-bold">Pay</div>
                </button>
                <button className="stat-card bg-gray-700/90 rounded-xl p-3 text-white shadow-md hover:scale-105 focus:outline-none" onClick={() => setShowSafeBox(true)}>
                  <div className="text-xs">SAFE BOX</div>
                  <div className="text-lg font-bold">Save</div>
                </button>
                <button className="stat-card bg-red-400/90 rounded-xl p-3 text-white shadow-md hover:scale-105 focus:outline-none" onClick={() => setShowLoan(true)}>
                  <div className="text-xs">LOAN</div>
                  <div className="text-lg font-bold">Apply</div>
                </button>
                <button className="stat-card bg-teal-400/90 rounded-xl p-3 text-white shadow-md hover:scale-105 focus:outline-none" onClick={() => setShowRefer(true)}>
                  <div className="text-xs">REFER</div>
                  <div className="text-lg font-bold">Earn</div>
                </button>
                {user.isAdmin && (
                  <button
                    className="stat-card bg-red-500/90 rounded-xl p-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                    onClick={handleAdminResetAll}
                  >
                    <div className="text-xs">ADMIN RESET ALL</div>
                    <div className="text-lg font-bold">Reset Everything</div>
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === 'ACTIVITIES' && (
            <div className="mb-4">
              <div className="font-semibold text-white mb-2">Transaction History</div>
              {transactions.length === 0 ? (
                <div className="text-center text-white/60 py-4">No transactions yet.</div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {[...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(txn => (
                    <li key={txn._id} className="flex items-center justify-between py-2 group hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => setPopupData(txn)}>
                      <div className="flex-1">
                        <span className="text-white font-medium text-xs">{txn.type.toUpperCase()} {txn.status ? `(${txn.status})` : ''}</span>
                        <div className="text-white/50 text-[10px]">{new Date(txn.createdAt).toLocaleString()}</div>
                      </div>
                      <span className={
                        txn.status === 'approved'
                          ? 'text-green-400 font-bold text-xs'
                          : txn.status === 'declined'
                          ? 'text-red-400 font-bold text-xs'
                          : 'text-yellow-400 font-bold text-xs'
                      }>{txn.amount} $</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === 'SUMMARY' && (
            <div className="mb-4">
              <div className="font-semibold text-white mb-2">Account Summary</div>
              <div className="bg-white/10 rounded-xl p-4 text-white mb-2">
                <div className="flex justify-between mb-1"><span>Current Balance:</span> <span className="font-bold">{typeof user.balance === 'number' ? user.balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '0.00'} $</span></div>
                <div className="flex justify-between mb-1"><span>Total Cards:</span> <span className="font-bold">{cards.length}</span></div>
                <div className="flex justify-between mb-1"><span>Pending Transactions:</span> <span className="font-bold">{pending.length}</span></div>
                <div className="flex justify-between mb-1"><span>Total Transactions:</span> <span className="font-bold">{transactions.length}</span></div>
              </div>
              <div className="text-white/80 text-xs">Tip: Link more cards or complete pending transactions for more features!</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
