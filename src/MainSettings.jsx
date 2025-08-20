import React, { useState } from 'react';

export default function MainSettings() {
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [security, setSecurity] = useState({ twoFA: false, biometrics: false });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100/60 to-blue-300/60 dark:from-[#232b2b]/80 dark:to-[#3a506b]/80 transition-colors duration-500">
  <div className="glassy rounded-3xl p-10 max-w-md w-full shadow-2xl animate-fade-in border border-blue-200/40">
        <h2 className="text-2xl font-bold mb-4 text-center">Main Settings</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Theme</h3>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-full shadow ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setTheme('light')}>Light</button>
            <button className={`px-4 py-2 rounded-full shadow ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setTheme('dark')}>Dark</button>
            <button className={`px-4 py-2 rounded-full shadow ${theme === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setTheme('system')}>System</button>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Notifications</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="accent-blue-500 scale-125" />
            <span>Enable notifications</span>
          </label>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Security</h3>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" checked={security.twoFA} onChange={() => setSecurity(s => ({ ...s, twoFA: !s.twoFA }))} className="accent-blue-500 scale-125" />
            <span>Two-Factor Authentication</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={security.biometrics} onChange={() => setSecurity(s => ({ ...s, biometrics: !s.biometrics }))} className="accent-blue-500 scale-125" />
            <span>Enable Biometrics</span>
          </label>
        </div>
      </div>
      <style>{`
        .glassy {
          background: rgba(255,255,255,0.35);
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 28px;
          border: 1.5px solid rgba(100,180,255,0.18);
        }
        .dark .glassy {
          background: rgba(35,43,43,0.85);
          border: 1.5px solid rgba(255,255,255,0.18);
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
  );
}
