import React, { useState } from 'react';

export default function BettingPopup({ onClose, user, onSuccess, onTransactionCreated }) {
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState('Bet9ja');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          type: 'gaming',
          amount: Number(amount),
          from: platform,
          to: account
        })
      });
      setLoading(false);
      if (res.ok) {
        setSuccess('Your gaming fund request is pending admin approval.');
        if (onTransactionCreated) await onTransactionCreated(() => onClose && onClose());
        if (onSuccess) onSuccess('Your gaming fund request is pending admin approval.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to submit request.');
      }
    } catch (err) {
      setLoading(false);
      setError('Server error.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glassy-popup rounded-xl shadow-2xl p-6 w-96 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={onClose}>✕</button>
  <div className="font-bold text-lg mb-2 text-center">Fund Gaming Account</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Gaming Platform</label>
            <select className="w-full rounded p-2 border" value={platform} onChange={e => setPlatform(e.target.value)}>
              <option>DraftKings</option>
              <option>FanDuel</option>
              <option>BetMGM</option>
              <option>Caesars</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Account/Player ID</label>
            <input className="w-full rounded p-2 border" value={account} onChange={e => setAccount(e.target.value)} placeholder="Enter betting account/ID" required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Amount</label>
            <input className="w-full rounded p-2 border" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" min="1" required />
          </div>
    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200" disabled={loading}>{loading ? 'Processing...' : 'Fund Gaming'}</button>
          {success && <div className="text-yellow-600 text-xs text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-xs text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}
