import React, { useState } from 'react';

export default function TransactionPopup({ type = 'success', message = 'Transaction successful!', onClose }) {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
    if (onClose) setTimeout(onClose, 300);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
      <div className={`glassy rounded-2xl p-6 shadow-2xl flex flex-col items-center ${type === 'success' ? 'border-green-400' : 'border-red-400'}`}
        style={{ borderWidth: 2 }}>
        <div className="mb-2">
          {type === 'success' ? (
            <svg width="48" height="48" fill="none" stroke="green" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>
          ) : (
            <svg width="48" height="48" fill="none" stroke="red" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
          )}
        </div>
        <div className="text-lg font-semibold mb-4">{message}</div>
        <button onClick={handleClose} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200">OK</button>
      </div>
      <style>{`
        .glassy {
          background: rgba(255,255,255,0.25);
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .dark .glassy {
          background: rgba(35,43,43,0.7);
          border: 1px solid rgba(255,255,255,0.12);
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
