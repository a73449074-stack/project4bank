import React, { useState } from 'react';

export default function DataPopup({ onClose, user, onSuccess, onTransactionCreated }) {
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [plan, setPlan] = useState('500MB');
  const [phone, setPhone] = useState('');
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
          type: 'internet',
          amount: Number(amount),
          from: network,
          to: phone
        })
      });
      setLoading(false);
      if (res.ok) {
        setSuccess('Your internet plan request is pending admin approval.');
        if (onTransactionCreated) await onTransactionCreated(() => onClose && onClose());
        if (onSuccess) onSuccess('Your internet plan request is pending admin approval.');
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
  <div className="font-bold text-lg mb-2 text-center">Buy Internet Plan</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Internet Provider</label>
            <select className="w-full rounded p-2 border" value={network} onChange={e => setNetwork(e.target.value)}>
              <option>Comcast Xfinity</option>
              <option>Spectrum</option>
              <option>AT&T Internet</option>
              <option>Verizon Fios</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Plan</label>
            <select className="w-full rounded p-2 border" value={plan} onChange={e => setPlan(e.target.value)}>
              <option>1GB</option>
              <option>5GB</option>
              <option>10GB</option>
              <option>50GB</option>
              <option>Unlimited</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Account Number</label>
            <input className="w-full rounded p-2 border" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" required />
          </div>
    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200" disabled={loading}>{loading ? 'Processing...' : 'Buy Internet'}</button>
          {success && <div className="text-yellow-600 text-xs text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-xs text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}
