import React, { useState } from 'react';
import { setTransactionPin, getUser } from './api.js';
import GlassyLoader from './GlassyLoader.jsx';

export default function ProfileSettings({ onPinSet }) {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
  const [name, setName] = useState(user.name || 'User');
  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [saving, setSaving] = useState(false);
  const [cards, setCards] = useState(['**** **** **** 1234']);
  const [newCard, setNewCard] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const handleSetPin = async (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');
    if (!pin || pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    if (pin !== pin2) {
      setPinError('PINs do not match');
      return;
    }
    if (!user._id) {
      setPinError('User not found. Please log in again.');
      return;
    }
    setPinLoading(true);
    try {
      const token = localStorage.getItem('token');
      await setTransactionPin(user._id, pin, token);
      const updated = await getUser(user._id, token);
      localStorage.setItem('user', JSON.stringify(updated));
      setPin(''); setPin2('');
  setPinSuccess('Transaction PIN set successfully!');
  if (onPinSet) onPinSet();
    } catch (err) {
      setPinError('Failed to set PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handlePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCard = () => {
    if (newCard.length === 16) {
      setCards([...cards, '**** **** **** ' + newCard.slice(-4)]);
      setNewCard('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Optimistically update localStorage immediately
      localStorage.setItem('user', JSON.stringify({ ...user, name, profilePic }));
      // Send PATCH request to backend to update user profile
  const res = await fetch(`/api/users/${user._id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profilePic })
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem('user', JSON.stringify(updated));
        window.dispatchEvent(new Event('profileUpdated'));
        setName(updated.name || 'User');
        setProfilePic(updated.profilePic);
        setTimeout(() => {
          setSaving(false);
        }, 500);
      } else {
        setSaving(false);
        alert('Failed to update profile.');
      }
    } catch (err) {
      setSaving(false);
      alert('Network error.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#232b2b] to-[#3a506b] px-2 py-4">
      {(saving || pinLoading) && <GlassyLoader text={saving ? 'Saving profile...' : 'Saving PIN...'} />}
      <div className={`glassy rounded-3xl p-10 max-w-md w-full shadow-2xl animate-fade-in border border-blue-200/40 ${saving || pinLoading ? 'opacity-40 pointer-events-none' : ''}`}>
        <h2 className="text-2xl font-bold mb-4 text-center text-white">Profile Settings</h2>
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-blue-400 mb-2 shadow-xl">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <input
            type="text"
            value={name}
            readOnly
            className="rounded-lg px-4 py-2 border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white/70 dark:bg-[#232b2b]/70 text-center font-semibold shadow opacity-60 cursor-not-allowed"
          />
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-white">Transaction PIN</h3>
          <form onSubmit={handleSetPin} className="mb-4">
            <input
              type="password"
              maxLength={4}
              minLength={4}
              pattern="[0-9]{4}"
              inputMode="numeric"
              className="w-full px-3 py-2 rounded border border-blue-200/40 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              required
            />
            <input
              type="password"
              maxLength={4}
              minLength={4}
              pattern="[0-9]{4}"
              inputMode="numeric"
              className="w-full px-3 py-2 rounded border border-blue-200/40 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm 4-digit PIN"
              value={pin2}
              onChange={e => setPin2(e.target.value.replace(/\D/g, ''))}
              required
            />
            {pinError && <div className="text-red-500 text-xs mb-2 text-center">{pinError}</div>}
            {pinSuccess && <div className="text-green-500 text-xs mb-2 text-center">{pinSuccess}</div>}
            <button type="submit" className="w-full py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition" disabled={pinLoading}>{pinLoading ? 'Saving...' : 'Set PIN'}</button>
          </form>
          <h3 className="font-semibold mb-2 text-white">Linked Cards</h3>
          <ul className="mb-2">
            {cards.map((card, i) => (
              <li key={i} className="text-sm opacity-80 mb-1 text-white/80">{card}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={16}
              placeholder="New Card Number"
              value={newCard}
              onChange={e => setNewCard(e.target.value.replace(/\D/g, ''))}
              className="rounded-lg px-2 py-1 border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none bg-white/70 dark:bg-[#232b2b]/70 text-sm shadow"
            />
            <button
              onClick={handleAddCard}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-4 rounded-full shadow-xl transition-all duration-200 text-sm"
            >Add</button>
          </div>
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
  );
}
