import React, { useState } from 'react';

export default function TVPopup({ onClose, user }) {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('DSTV');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess('TV subscription paid successfully!');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glassy-popup rounded-xl shadow-2xl p-6 w-96 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={onClose}>✕</button>
        <div className="font-bold text-lg mb-2 text-center">Pay TV Subscription</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Provider</label>
            <select className="w-full rounded p-2 border" value={provider} onChange={e => setProvider(e.target.value)}>
              <option>DSTV</option>
              <option>GOTV</option>
              <option>STARTIMES</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Account/Smartcard</label>
            <input className="w-full rounded p-2 border" value={account} onChange={e => setAccount(e.target.value)} placeholder="Enter account/smartcard number" required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Amount</label>
            <input className="w-full rounded p-2 border" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" min="1" required />
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200" disabled={loading}>{loading ? 'Processing...' : 'Pay Subscription'}</button>
          {success && <div className="text-green-600 text-xs text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-xs text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}
