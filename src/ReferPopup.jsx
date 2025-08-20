import React, { useState } from 'react';

export default function ReferPopup({ onClose, user }) {
  const [copied, setCopied] = useState(false);
  const referralCode = user && user._id ? user._id.slice(-6).toUpperCase() : 'ABC123';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glassy-popup rounded-xl shadow-2xl p-6 w-96 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={onClose}>✕</button>
        <div className="font-bold text-lg mb-2 text-center">Refer & Earn</div>
        <div className="mb-2 text-center">Share your referral link and earn rewards!</div>
        <div className="bg-gray-100 rounded p-2 text-center text-xs font-mono mb-2">{referralLink}</div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200 w-full" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Link'}</button>
      </div>
    </div>
  );
}
