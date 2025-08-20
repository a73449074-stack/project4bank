import React, { useState } from 'react';

export default function DataPopup({ onClose, user }) {
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
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess('Data purchase successful!');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glassy-popup rounded-xl shadow-2xl p-6 w-96 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={onClose}>✕</button>
        <div className="font-bold text-lg mb-2 text-center">Buy Data</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Network</label>
            <select className="w-full rounded p-2 border" value={network} onChange={e => setNetwork(e.target.value)}>
              <option>MTN</option>
              <option>GLO</option>
              <option>AIRTEL</option>
              <option>9MOBILE</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Plan</label>
            <select className="w-full rounded p-2 border" value={plan} onChange={e => setPlan(e.target.value)}>
              <option>500MB</option>
              <option>1GB</option>
              <option>2GB</option>
              <option>5GB</option>
              <option>10GB</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input className="w-full rounded p-2 border" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" required />
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200" disabled={loading}>{loading ? 'Processing...' : 'Buy Data'}</button>
          {success && <div className="text-green-600 text-xs text-center mt-2">{success}</div>}
          {error && <div className="text-red-600 text-xs text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}
