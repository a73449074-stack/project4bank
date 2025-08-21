// Fix: Add a no-op handleTransactionComplete to prevent ReferenceError
  const handleTransactionComplete = () => {};
import React, { useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import ChatWithAdmin from './ChatWithAdmin';
import LoginPage from './LoginPage';

// Import your real popups/components here
import DepositPopup from './DepositPopup';
import WithdrawPopup from './WithdrawPopup';
import TransferPopup from './TransferPopup';

const GlassyLoader = ({ text }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
    <div className="glassy rounded-2xl p-8 shadow-2xl animate-fade-in text-center">
      <div className="loader mb-4" />
      <div className="text-white text-lg font-semibold animate-pulse">{text || 'Loading...'}</div>
    </div>
    <style>{`
      .loader {
        border: 4px solid rgba(255,255,255,0.2);
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  // Login handler for LoginPage
  // Always fetch latest user from backend after login to ensure up-to-date transactionPin
  const handleLogin = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch latest user from backend
      const res = await fetch(`/api/users/${userData._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        setPage(freshUser.isAdmin ? 'admin' : 'dashboard');
      } else {
        // fallback to original userData if fetch fails
        setUser(userData);
        setPage(userData.isAdmin ? 'admin' : 'dashboard');
      }
    } catch (err) {
      setUser(userData);
      setPage(userData.isAdmin ? 'admin' : 'dashboard');
    }
    setShowHamburger(false); // Ensure hamburger is closed on login
  };
  const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('user');
  setPage('login');
  // Optionally, add navigation or notification here
  };
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const menuItems = [
    { label: 'Dashboard', onClick: () => handleNav(user?.isAdmin ? 'admin' : 'dashboard') },
    { label: 'Profile', onClick: () => setShowProfilePopup(true) },
    { label: 'Settings', onClick: () => setShowSettings(true) },
    { label: 'Logout', onClick: handleLogout },
  ];
  // Login handler
  const fabActions = [
    { key: 'deposit', icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7"/></svg>
    ), onClick: () => { setShowTransactionPopup('deposit'); setFabOpen(false); }, label: 'Deposit' },
    { key: 'withdraw', icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7-7-7 7"/></svg>
    ), onClick: () => { setShowTransactionPopup('withdraw'); setFabOpen(false); }, label: 'Withdraw' },
    { key: 'transfer', icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 17l5-5-5-5M21 12H8M8 7v10"/></svg>
    ), onClick: () => { setShowTransactionPopup('transfer'); setFabOpen(false); }, label: 'Transfer' },
  ];
  // Always require login on first load unless a valid user is in localStorage
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      if (!u) return null;
      const parsed = JSON.parse(u);
      // Optionally, add a check for a valid _id or email
      if (!parsed || !parsed._id || !parsed.email) return null;
      return parsed;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState(() => {
    const u = localStorage.getItem('user');
    if (!u) return 'login';
    try {
      const parsed = JSON.parse(u);
      if (!parsed || !parsed._id || !parsed.email) return 'login';
      return parsed.isAdmin ? 'admin' : 'dashboard';
    } catch {
      return 'login';
    }
  });
  const [showTransactionPopup, setShowTransactionPopup] = useState(null); // 'deposit' | 'withdraw' | null
  const [showTransferProcessing, setShowTransferProcessing] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pinStep, setPinStep] = useState(0); // for multi-step PIN
  const [transactionPin, setTransactionPin] = useState(user?.transactionPin || '1234');
  // Always sync transactionPin with user.transactionPin
  React.useEffect(() => {
    setTransactionPin(user?.transactionPin || '1234');
  }, [user?.transactionPin]);
  const [fabOpen, setFabOpen] = useState(false);
  // Theme state: 'dark', 'glass', 'system'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  // Chart popup state: null | 'revenues' | 'expenses'
  const [showChart, setShowChart] = useState(null);
  // Chart popup component
  const ChartPopup = ({ type, onClose }) => {
    // Example data for days of week
    const chartData = type === 'revenues'
      ? {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [120, 150, 110, 180, 90, 200, 170],
          color: 'rgba(0,200,120,0.7)'
        }
      : {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [80, 90, 70, 95, 60, 120, 100],
          color: 'rgba(255,80,80,0.7)'
        };
    const data = {
      labels: chartData.labels,
      datasets: [
        {
          label: type === 'revenues' ? 'Revenues' : 'Expenses',
          data: chartData.data,
          backgroundColor: chartData.color,
          borderRadius: 6,
          barPercentage: 0.5,
          categoryPercentage: 0.7,
        },
      ],
    };
    const options = {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return `${type === 'revenues' ? 'Revenue' : 'Expense'}: $${context.parsed.y}`;
            }
          }
        },
        title: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#888', font: { size: 10 } },
        },
        y: {
          grid: { display: false },
          ticks: { display: false },
        },
      },
      animation: {
        duration: 600,
      },
    };
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glassy-popup rounded-2xl p-6 shadow-2xl animate-fade-in w-[220px] h-[140px] max-w-full relative flex flex-col items-center justify-center">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={onClose} style={{fontSize:'1.1rem'}}>✕</button>
          <div className="text-base font-bold mb-2 text-center">{type === 'revenues' ? 'Revenues' : 'Expenses'}</div>
          <Bar data={data} options={options} width={180} height={60} />
        </div>
      </div>
    );
  };

  // Apply theme to document body
  React.useEffect(() => {
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      document.body.setAttribute('data-theme', mq.matches ? 'dark' : 'glass');
      const handler = (e) => document.body.setAttribute('data-theme', e.matches ? 'dark' : 'glass');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Navigation handler
  const handleNav = (target) => {
    setPage(target);
    setShowHamburger(false);
    setFabOpen(false);
  };

  // Login handler
  // Login handler
  // Profile popup (edit name/email, and change profile picture)
  const ProfilePopup = ({onBack}) => {
    return (
      <div className="glassy-popup rounded-2xl p-8 shadow-2xl animate-fade-in w-96 max-w-full relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowProfilePopup(false)}>
7</button>
        <div className="text-xl font-bold mb-4 text-center">Profile</div>
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-blue-300 text-2xl font-bold text-blue-700">
            {user?.email ? user.email[0].toUpperCase() : 'U'}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-left text-gray-500 text-xs mb-1">Email</label>
            <input className="rounded-lg px-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed" value={user?.email || ''} readOnly tabIndex={-1} />
          </div>
          <div className="flex flex-col">
            <label className="text-left text-gray-500 text-xs mb-1">Transaction Pin</label>
            <input className="rounded-lg px-4 py-2 border border-gray-300 bg-gray-100 text-black font-mono tracking-widest cursor-not-allowed" value={user?.transactionPin || ''} readOnly tabIndex={-1} />
          </div>
          <div className="flex flex-col">
            <label className="text-left text-gray-500 text-xs mb-1">Password</label>
            <input className="rounded-lg px-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed" value={user?.password || ''} readOnly tabIndex={-1} type="password" />
          </div>
        </div>
      </div>
    );
  };

  // Settings popup (profile pic and transaction PIN)
    const SettingsPopup = () => {
      const [pic, setPic] = useState(user?.profilePic || '');
      const [picMsg, setPicMsg] = useState('');
      const [view, setView] = useState('main'); // 'main' | 'transaction' | 'changePin'
      // For PIN view
      const [showPin, setShowPin] = useState(false);
      const [emailInput, setEmailInput] = useState('');
      const [emailMsg, setEmailMsg] = useState('');
      // PIN change fields
      const [prevPin, setPrevPin] = useState('');
      const [newPin, setNewPin] = useState('');
      const [confirmPin, setConfirmPin] = useState('');
      const [pinMsg, setPinMsg] = useState('');
      // Theme dropdown state
      const [showThemeDropdown, setShowThemeDropdown] = useState(false);
    const handlePicChange = async e => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('profilePic', file);
        try {
          const res = await fetch('/api/upload/profile-pic', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.url) {
            setPic(data.url);
            setPicMsg('Profile picture updated!');
            setUser({ ...user, profilePic: data.url });
            localStorage.setItem('user', JSON.stringify({ ...user, profilePic: data.url }));
          } else {
            setPicMsg('Upload failed');
          }
        } catch (err) {
          setPicMsg('Upload failed');
        }
      }
    };
    const handlePinSave = async () => {
      if (!newPin || newPin.length !== 4) {
        setPinMsg('New PIN must be 4 digits');
        return;
      }
      try {
        // Call backend to update pin (correct endpoint)
        const res = await fetch(`/api/users/${user._id}/transaction-pin`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionPin: newPin })
        });
        if (!res.ok) throw new Error('Failed to update pin');
        // Fetch updated user from backend
        const userRes = await fetch(`/api/users/${user._id}`);
        const updatedUser = await userRes.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setPinMsg('Transaction PIN updated!');
        setPrevPin(''); setNewPin(''); setConfirmPin('');
      } catch (err) {
        setPinMsg('Failed to update PIN. Please try again.');
      }
    };
    const handleForgetPin = () => {
      setShowSettings(false);
      setShowHamburger(false);
      setTimeout(() => {
        // Open chat with admin/support
        const chatBtn = document.querySelector('.chat-with-admin-btn');
        if (chatBtn) chatBtn.click();
      }, 200);
    };
    const handleEmailCheck = () => {
      if ((emailInput || '').trim().toLowerCase() === (user?.email || '').trim().toLowerCase()) {
        setShowPin(true);
        setEmailMsg('');
      } else {
        setEmailMsg('Email does not match registered email');
      }
    };
    // Main settings view
    if (view === 'main') {
      return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glassy-popup rounded-2xl p-8 shadow-2xl animate-fade-in w-96 max-w-full relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowSettings(false)}>✕</button>
            <div className="text-xl font-bold mb-4 text-center">Settings</div>
            <div className="flex flex-col gap-1 mb-4">
              <button
                className="text-base text-left py-2 px-3 rounded hover:bg-blue-100/40 dark:hover:bg-blue-900/40 transition-all"
                style={{background: 'transparent', color: '#fff', fontWeight: 500, lineHeight: '1.2'}} 
                onClick={() => setView('transaction')}
              >
                Account
              </button>
            </div>
            {/* Theme setting as a button with dropdown */}
            <div className="mb-2 relative">
              <button
                type="button"
                className="theme-btn w-full flex items-center justify-between px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                onClick={() => setShowThemeDropdown(v => !v)}
              >
                <span>Theme</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {showThemeDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900 rounded-lg shadow-lg z-10 p-3 flex flex-col gap-2 animate-fade-in border border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-white font-medium">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'dark'}
                      onChange={() => { setTheme('dark'); setShowThemeDropdown(false); }}
                      className="accent-blue-500 w-5 h-5"
                    />
                    Dark
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-green-700 font-bold">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'glass'}
                      onChange={() => { setTheme('glass'); setShowThemeDropdown(false); }}
                      className="accent-green-500 w-5 h-5"
                    />
                    More Glassy
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-blue-700 font-semibold">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'system'}
                      onChange={() => { setTheme('system'); setShowThemeDropdown(false); }}
                      className="accent-blue-400 w-5 h-5"
                    />
                    System
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    // Transaction settings view
    if (view === 'transaction') {
      return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glassy-popup rounded-2xl p-8 shadow-2xl animate-fade-in w-96 max-w-full relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowSettings(false)}>✕</button>
            <button className="absolute top-3 left-3 text-gray-400 hover:text-blue-500" onClick={() => setView('main')}>{'< Back'}</button>
            <div className="text-xl font-bold mb-4 text-center">Transaction Settings</div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Current Transaction PIN</label>
                <div className="flex items-center gap-2">
                  <input type={showPin ? 'text' : 'password'} className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 text-center tracking-widest w-32" value={showPin ? (user?.transactionPin || '') : (user?.transactionPin ? '••••' : '')} readOnly />
                  {!showPin && (
                    <button type="button" className="text-xs text-blue-500 underline" onClick={() => setShowPin(false)}>View</button>
                  )}
                </div>
                {!showPin && (
                  <div className="flex flex-col gap-1 mt-2">
                    <input type="email" className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 text-center" placeholder="Enter registered email to view" value={emailInput} onChange={e => setEmailInput(e.target.value)} />
                    <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-4 rounded-full shadow transition-all duration-200 text-xs" onClick={handleEmailCheck}>Verify Email</button>
                    {emailMsg && <div className="text-red-500 text-xs text-center">{emailMsg}</div>}
                  </div>
                )}
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200 mt-2" onClick={() => setView('changePin')}>Change Transaction PIN</button>
            </div>
          </div>
        </div>
      );
    }
    // Change PIN form view
    if (view === 'changePin') {
      return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glassy-popup rounded-2xl p-8 shadow-2xl animate-fade-in w-96 max-w-full relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowSettings(false)}>✕</button>
            <button className="absolute top-3 left-3 text-gray-400 hover:text-blue-500" onClick={() => setView('transaction')}>{'< Back'}</button>
            <div className="text-xl font-bold mb-4 text-center">Change Transaction PIN</div>
            <div className="flex flex-col gap-2">
              <input type="password" className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 text-center tracking-widest" maxLength={4} value={prevPin} onChange={e => setPrevPin(e.target.value.replace(/\D/g, ''))} placeholder="Previous PIN" />
              <input type="password" className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 text-center tracking-widest" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="New PIN" />
              <input type="password" className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 text-center tracking-widest" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} placeholder="Confirm New PIN" />
              <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200" onClick={handlePinSave}>Change PIN</button>
              {pinMsg && <div className={pinMsg.includes('updated') ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>{pinMsg}</div>}
              <button type="button" className="text-xs text-blue-500 underline mt-2" style={{alignSelf:'flex-end'}} onClick={handleForgetPin}>Forget pin? Write to customer service for support to change pin</button>
            </div>
          </div>
        </div>
      );
    }
  };

  // PIN popup (multi-step)
  const PinPopup = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glassy-popup rounded-2xl p-8 shadow-2xl animate-fade-in w-80 max-w-full relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowPinPopup(false)}>✕</button>
        <div className="text-xl font-bold mb-4 text-center">{pinStep === 0 ? 'Set Transaction PIN' : 'Confirm PIN'}</div>
        <input type="password" className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 text-center text-lg tracking-widest" maxLength={4} autoFocus />
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200 mt-4" onClick={() => handlePinNext('1234')}>{pinStep === 0 ? 'Next' : 'Save'}</button>
      </div>
    </div>
  );

  // Main render
  // If not logged in, always show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {/* Hamburger Menu (only for non-admins) */}
      {user && !user.isAdmin && page !== 'admin' && (
        <>
          <button
            className={`hamburger-menu glassy-action-btn${showHamburger ? ' open' : ''}`}
            style={{
              position: 'fixed',
              top: 20,
              left: 20,
              zIndex: 300,
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '9999px',
              border: '1.5px solid rgba(100,180,255,0.18)',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onClick={() => setShowHamburger(!showHamburger)}
            aria-label="Open menu"
          >
            <span className="hamburger-icon" aria-hidden="true">
              <span className="bar top" />
              <span className="bar middle" />
              <span className="bar bottom" />
            </span>
          </button>

          {showHamburger && (
            <div className="hamburger-overlay" style={{zIndex: 250}} onClick={() => setShowHamburger(false)}>
              <div className="hamburger-sidebar glassy-sidebar animate-slide-in shrink-fit" onClick={e => e.stopPropagation()}>
                <div className="sidebar-content-spacer">
                  {menuItems.map((item, i) => (
                    <button key={i} className="text-lg text-left py-2 px-3 rounded hover:bg-blue-100/40 dark:hover:bg-blue-900/40 transition-all" onClick={item.onClick}>{item.label}</button>
                  ))}
                  {showProfilePopup && <ProfilePopup />}
                  {showSettings && <SettingsPopup />}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content Area - now full width/height, no borders, no mobile card look */}
      <main style={{ minHeight: '100vh', minWidth: '100vw', padding: 0, margin: 0, background: 'none' }}>
        {page === 'dashboard' && (
          <UserDashboard user={user} onShowRevenuesChart={() => setShowChart('revenues')} onShowExpensesChart={() => setShowChart('expenses')} />
        )}
        {page === 'admin' && (
          <AdminDashboard onShowRevenuesChart={() => setShowChart('revenues')} onShowExpensesChart={() => setShowChart('expenses')} />
        )}
        {showChart && <ChartPopup type={showChart} onClose={() => setShowChart(null)} />}
      </main>

      {/* Animated Floating Action Button (FAB) with 3 popout actions, moves from left to center on open */}
      {user && page !== 'login' && !user.isAdmin && (
        <div className={`fab-container${fabOpen ? ' open' : ''}`} style={{zIndex: 300, pointerEvents: 'auto'}}>
          {/* Main FAB */}
          <button
            className={`fab-main glassy-action-btn${fabOpen ? ' fab-rolled' : ''}`}
            onClick={() => setFabOpen(!fabOpen)}
            aria-label="Open actions"
          >
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          </button>
          {/* Popout Actions: right (deposit), top (withdraw), left (transfer) */}
          <button
            className={`fab-action fab-action-right glassy-action-btn${fabOpen ? ' show' : ''}`}
            onClick={fabActions[0].onClick}
            aria-label="Deposit"
            title="Deposit"
          >
            {fabActions[0].icon}
          </button>
          <button
            className={`fab-action fab-action-top glassy-action-btn${fabOpen ? ' show' : ''}`}
            onClick={fabActions[1].onClick}
            aria-label="Withdraw"
            title="Withdraw"
          >
            {fabActions[1].icon}
          </button>
          <button
            className={`fab-action fab-action-left glassy-action-btn${fabOpen ? ' show' : ''}`}
            onClick={fabActions[2].onClick}
            aria-label="Transfer"
            title="Transfer"
          >
            {fabActions[2].icon}
          </button>
        </div>
      )}


      {/* Popups and overlays (remain global except settings/profile) */}
      {showTransferProcessing && <GlassyLoader text="Processing your transfer..." />}
      {showTransactionPopup === 'deposit' && (
        <DepositPopup setShowTransactionPopup={setShowTransactionPopup} transactionPin={transactionPin} onComplete={handleTransactionComplete} />
      )}
      {showTransactionPopup === 'withdraw' && (
        <WithdrawPopup setShowTransactionPopup={setShowTransactionPopup} transactionPin={transactionPin} onComplete={handleTransactionComplete} />
      )}
      {showTransactionPopup === 'transfer' && (
        <TransferPopup setShowTransactionPopup={setShowTransactionPopup} transactionPin={transactionPin} onComplete={handleTransactionComplete} />
      )}
      {showPinPopup && <PinPopup />}



      <style>{`
        .main-glassy-panel {
          background: var(--main-glass-bg, linear-gradient(135deg, rgba(0,255,120,0.18) 0%, rgba(178,247,239,0.18) 100%));
          box-shadow: 0 8px 32px 0 rgba(0,255,120,0.10);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-radius: 28px;
          border: none !important;
          margin: 0 auto;
          max-width: 420px;
          width: 100%;
          padding: 2.5rem 1.5rem;
          margin-top: 32px;
        }
        body[data-theme="glass"] .main-glassy-panel {
          --main-glass-bg: linear-gradient(135deg, rgba(0,255,120,0.22) 0%, rgba(178,247,239,0.18) 100%);
          --main-glass-border: #00ff88;
          border: none !important;
          box-shadow: 0 8px 32px 0 rgba(0,255,120,0.13);
        }
        body[data-theme="dark"] .main-glassy-panel {
          --main-glass-border: #2e3a5e;
          border: none !important;
          background: linear-gradient(135deg, #232b3e 0%, #2e3a5e 100%);
        }
        .main-glassy-panel-inner {
          background: linear-gradient(135deg, rgba(0,255,120,0.13) 0%, rgba(178,247,239,0.10) 100%);
          border-radius: 20px;
          border: none !important;
          padding: 1.5rem 1rem;
        }
        body[data-theme="dark"] .main-glassy-panel-inner {
          background: linear-gradient(135deg, #232b3e 0%, #2e3a5e 100%);
          border: none !important;
        }
        body[data-theme="dark"] .glassy-sidebar {
          border-right: none;
        }
        body[data-theme="dark"] .glassy-popup {
          border: none;
        }
        body[data-theme="dark"] .glassy-action-btn {
          border: none;
        }
        body[data-theme="dark"] input, body[data-theme="dark"] .rounded-lg {
          border: none !important;
        }
        .main-glassy-panel-inner {
          background: linear-gradient(135deg, rgba(0,255,120,0.13) 0%, rgba(178,247,239,0.10) 100%);
          border-radius: 20px;
          border: 1.5px solid #b2f7ef;
          padding: 1.5rem 1rem;
        }
        body[data-theme="dark"] .main-glassy-panel-inner {
          background: linear-gradient(135deg, #232b3e 0%, #2e3a5e 100%);
        }
        body[data-theme="dark"] {
          background: linear-gradient(135deg, #1e2746 0%, #2e3a5e 100%);
          color: #fff;
        }
        html[data-theme="glass"], body[data-theme="glass"] {
          /* Unified glassy green background for the whole app, including outside the main card */
          background: linear-gradient(135deg, rgba(0,255,120,0.18) 0%, rgba(178,247,239,0.18) 100%) !important;
          background-repeat: no-repeat !important;
          background-attachment: fixed !important;
          background-size: cover !important;
          min-height: 100vh !important;
          width: 100vw !important;
          color: #0a3d2c;
        }
        #root, main {
          background: transparent !important;
        }
        body[data-theme="system"] {
          /* fallback, will be set to dark or glass by JS */
        }
        .hamburger-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.35);
          display: flex;
        }
        .glassy-sidebar {
          background: var(--sidebar-bg, rgba(40, 50, 80, 0.65));
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-radius: 0 24px 24px 0;
          border-right: 1.5px solid rgba(100,180,255,0.18);
          min-width: 180px;
          width: auto;
          max-width: 320px;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: auto;
          /* max-height removed to fit content */
          transform: translateX(-100%);
          animation: slide-in 0.45s cubic-bezier(.4,0,.2,1) forwards;
        }
        body[data-theme="glass"] .glassy-sidebar {
          --sidebar-bg: rgba(0,255,120,0.18);
          color: #0a3d2c;
          box-shadow: 0 8px 32px 0 rgba(0,255,120,0.10);
          border-right: 2px solid rgba(0,255,120,0.18);
        }
        .glassy-sidebar.shrink-fit {
          height: auto;
          min-height: unset;
          max-height: 90vh;
          justify-content: flex-start;
        }
        .sidebar-content-spacer {
          margin-top: 72px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .hamburger-menu .hamburger-icon {
          display: inline-block;
          width: 28px;
          height: 28px;
          position: relative;
        }
        .hamburger-menu .bar {
          display: block;
          position: absolute;
          left: 4px;
          right: 4px;
          height: 4px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.35s cubic-bezier(.4,0,.2,1);
        }
        .hamburger-menu .bar.top {
          top: 6px;
        }
        .hamburger-menu .bar.middle {
          top: 12px;
        }
        .hamburger-menu .bar.bottom {
          top: 18px;
        }
        .hamburger-menu.open .bar.top {
          top: 12px;
          transform: rotate(45deg);
        }
        .hamburger-menu.open .bar.middle {
          opacity: 0;
        }
        .hamburger-menu.open .bar.bottom {
          top: 12px;
          transform: rotate(-45deg);
        }
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.45s cubic-bezier(.4,0,.2,1) forwards;
        }
        .glassy-action-btn {
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 9999px;
          border: 1.5px solid rgba(100,180,255,0.18);
          transition: background 0.2s, box-shadow 0.2s;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .fab-container {
          position: fixed;
          right: 32px;
          bottom: 32px;
          z-index: 100;
          transform: none;
          transition: right 0.5s cubic-bezier(.4,0,.2,1), bottom 0.4s cubic-bezier(.4,0,.2,1);
          pointer-events: none;
        }
        .fab-container.open {
          right: 50%;
          bottom: 80px;
          transform: translateX(50%);
          pointer-events: auto;
        }
        .fab-main {
          position: absolute;
          right: 0;
          bottom: 0;
          transform: scale(1);
          transition: right 0.5s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1);
          z-index: 2;
        }
        .fab-container.open .fab-main {
          right: 50%;
          transform: translateX(50%) scale(1.1) rotate(45deg);
        }
        .fab-main.fab-rolled {
          /* handled by .fab-container.open .fab-main */
        }
        .fab-action {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          transition: all 0.45s cubic-bezier(.4,0,.2,1);
          z-index: 1;
        }
        .fab-action.show {
          opacity: 1;
          pointer-events: auto;
        }
        /* FAB action positions: left, top, right, all equidistant from center */
        .fab-action-right {
          right: 0;
          bottom: 0;
          transform: scale(1) rotate(-360deg);
        }
        .fab-container.open .fab-action-right.show {
          right: 50%;
          bottom: 0;
          transform: translate(80px, -32px) scale(1.05) rotate(0deg);
        }
        .fab-action-top {
          right: 0;
          bottom: 0;
          transform: scale(1) rotate(-360deg);
        }
        .fab-container.open .fab-action-top.show {
          right: 50%;
          bottom: 0;
          /* Move down less and to the right a bit */
          transform: translate(28px, -64px) scale(1.05) rotate(0deg);
        }
        .fab-action-left {
          right: 0;
          bottom: 0;
          transform: scale(1) rotate(-360deg);
        }
        .fab-container.open .fab-action-left.show {
          right: 50%;
          bottom: 0;
          /* Move to the right a bit for better alignment */
          transform: translate(-24px, -32px) scale(1.05) rotate(0deg);
        }
        .glassy-popup {
          background: var(--popup-bg, rgba(40, 50, 80, 0.65));
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-radius: 18px;
          border: 1.5px solid rgba(100,180,255,0.18);
        }
        body[data-theme="glass"] .glassy-popup {
          --popup-bg: rgba(0,255,120,0.18);
          color: #0a3d2c;
          box-shadow: 0 8px 32px 0 rgba(0,255,120,0.10);
          border: 2px solid rgba(0,255,120,0.18);
        }
        body[data-theme="glass"] .glassy-action-btn {
          background: rgba(0,255,120,0.18);
          color: #0a3d2c;
          border: 2px solid rgba(0,255,120,0.22);
          font-weight: bold;
        }
        body[data-theme="glass"] .sidebar-content-spacer button,
        body[data-theme="glass"] .theme-btn,
        body[data-theme="glass"] .glassy-popup button {
          color: #0a3d2c !important;
          font-weight: bold !important;
        }
        body[data-theme="glass"] .font-bold {
          font-weight: bold !important;
        }
        body[data-theme="glass"] input, body[data-theme="glass"] .rounded-lg {
          background: rgba(255,255,255,0.7) !important;
          color: #0a3d2c !important;
          border: 1.5px solid rgba(0,255,120,0.18) !important;
        }
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: animate-fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </>
  );
}

export default App;
