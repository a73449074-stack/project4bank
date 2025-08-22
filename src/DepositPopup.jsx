
import React, { useState, useEffect } from 'react';
import GlassyLoader from './GlassyLoader.jsx';

export default function DepositPopup({ setShowTransactionPopup, transactionPin, onSuccess, onTransactionCreated }) {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({ cardName: '', cardNumber: '', cvv: '', expiry: '' });
  const [cardError, setCardError] = useState('');
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [agree, setAgree] = useState(false);
  const [password, setPassword] = useState('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [pinError, setPinError] = useState('');
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {});

  // Always fetch latest user status on mount
  React.useEffect(() => {
    if (user._id) {
      fetch(`/api/users/${user._id}`).then(res => res.json()).then(freshUser => {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Always load cards from backend user object
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
    if (!user._id) return;
    const fetchCards = () => {
      fetch(`/api/users/${user._id}`)
        .then(res => res.json())
        .then(freshUser => {
          setCards(freshUser.cards || []);
          setSelectedCard((freshUser.cards && freshUser.cards[0]) || null);
          localStorage.setItem('user', JSON.stringify(freshUser));
        });
    };
    fetchCards();
    window.addEventListener('cardUpdate', fetchCards);
    return () => window.removeEventListener('cardUpdate', fetchCards);
  }, []);

  const handleCardFormChange = (field, value) => {
    setCardForm(f => ({ ...f, [field]: value }));
  };
  const handleAddCard = async e => {
    e.preventDefault();
    setCardError('');
    if (!cardForm.cardName || cardForm.cardNumber.length !== 16 || cardForm.cvv.length !== 3 || !/^\d{2}\/\d{2}$/.test(cardForm.expiry)) {
      setCardError('Fill all fields correctly');
      return;
    }
    const cardObj = { ...cardForm };
    const updated = [...cards, cardObj];
    setCards(updated);
    setSelectedCard(cardObj);
    setCardForm({ cardName: '', cardNumber: '', cvv: '', expiry: '' });
    setShowAddCard(false);
    // Persist to backend
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
    if (user._id) {
      await fetch(`/api/users/${user._id}/cards`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updated })
      });
      window.dispatchEvent(new Event('cardUpdate'));
    }
  };

  // Delete card with PIN and admin approval
  const handleDeleteCard = async (cardIdx) => {
    const pin = prompt('Enter your transaction PIN to delete this card:');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
    if (!user._id || !pin) return;
    // Send request to backend for admin approval
    await fetch(`/api/users/${user._id}/cards/delete-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardIdx, transactionPin: pin })
    });
    alert('Delete card request sent for admin approval.');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
        <div className="font-bold text-lg mb-2 text-center">Self Deposit</div>
        <div className="mb-2 text-xs text-center text-gray-500">Step {step} of 4</div>
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setShowTransactionPopup(null)}>×</button>
        {showProcessing ? (
          <GlassyLoader text="Processing your deposit..." />
        ) : showAddCard ? (
          <form onSubmit={handleAddCard} className="flex flex-col items-center w-full">
            <div className="w-80 max-w-full rounded-xl p-6 mb-4 bg-white bg-opacity-20 backdrop-blur-md shadow-lg">
              <div className="mb-4">
                <input
                  className="w-full p-2 mb-2 rounded bg-white bg-opacity-30 text-white placeholder-gray-300 focus:outline-none"
                  placeholder="Card Name (Bank Name)"
                  value={cardForm.cardName}
                  onChange={e => handleCardFormChange('cardName', e.target.value)}
                />
                <input
                  className="w-full p-2 mb-2 rounded bg-white bg-opacity-30 text-white placeholder-gray-300 focus:outline-none font-mono tracking-widest"
                  placeholder="Card Number"
                  maxLength={16}
                  value={cardForm.cardNumber}
                  onChange={e => handleCardFormChange('cardNumber', e.target.value.replace(/\D/g, ''))}
                />
                <div className="flex gap-2">
                  <input
                    className="w-1/2 p-2 rounded bg-white bg-opacity-30 text-white placeholder-gray-300 focus:outline-none"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardForm.expiry}
                    onChange={e => handleCardFormChange('expiry', e.target.value)}
                  />
                  <input
                    className="w-1/2 p-2 rounded bg-white bg-opacity-30 text-white placeholder-gray-300 focus:outline-none"
                    placeholder="CVV"
                    maxLength={3}
                    value={cardForm.cvv}
                    onChange={e => handleCardFormChange('cvv', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              {cardError && <div className="text-red-500 text-xs mb-2 text-center">{cardError}</div>}
              <button
                className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition mb-2"
                type="submit"
              >
                Save Card
              </button>
              <button
                className="w-full py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition"
                type="button"
                onClick={() => setShowAddCard(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : step === 1 ? (
          <>
            <div className="mb-3">
              <div className="text-sm font-semibold mb-1">Select Card</div>
              <div className="flex flex-col gap-3 mb-2">
                {cards.length === 0 && (
                  <div className="text-gray-300 text-center">No cards linked yet.</div>
                )}
                {cards.map((card, i) => (
                  <div
                    key={i}
                    className={`relative cursor-pointer transition-transform duration-200 ${selectedCard === card ? 'ring-2 ring-blue-400 scale-105' : 'hover:scale-105'}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="bank-card-image w-full h-32 rounded-xl p-4 flex flex-col justify-between text-white shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg tracking-widest text-white">{card.cardName || 'Bank Name'}</span>
                        <span className="text-xs text-gray-200">{card.expiry || 'MM/YY'}</span>
                      </div>
                      <div className="text-xl font-mono text-white tracking-widest mb-1">**** **** **** {card.cardNumber ? card.cardNumber.slice(-4) : '0000'}</div>
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>Card Holder</span>
                        <span>CVV: ***</span>
                      </div>
                      {selectedCard === card && (
                        <div className="absolute top-2 right-2 bg-blue-400 rounded-full w-4 h-4 border-2 border-white"></div>
                      )}
                    </div>
                    <button className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded" onClick={e => { e.stopPropagation(); handleDeleteCard(i); }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="text-blue-300 underline mb-4"
              onClick={() => setShowAddCard(true)}
              type="button"
            >
              Add a new card
            </button>
            {selectedCard && (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  className="w-full px-3 py-2 rounded border border-blue-200/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="number"
                  min="1"
                  placeholder="Enter amount to deposit"
                  value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                />
                {amount && Number(amount) > 0 && (
                  <button
                    className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition mt-2 active:scale-95 focus:scale-95 duration-150"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        ) : step === 2 ? (
          <div className="flex flex-col gap-4 mt-2">
            <div className="text-base font-semibold text-gray-900 mb-2 bg-blue-100/80 rounded p-2 text-center shadow">You are about to deposit <span className="font-bold text-blue-700">${amount}</span> from your selected card. This amount will be debited from your card and credited to your account.</div>
            <label className="flex items-center gap-2 bg-blue-50/80 rounded px-2 py-2 shadow">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span className="text-base font-bold text-blue-800">I agree to the above statement</span>
            </label>
            {agree && (
              <button
                className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition active:scale-95 focus:scale-95 duration-150"
                onClick={() => setStep(3)}
              >
                Next
              </button>
            )}
          </div>
        ) : step === 3 ? (
          <div className="flex flex-col gap-4 mt-2">
            <input
              className="w-full px-3 py-2 rounded border border-blue-200/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="password"
              placeholder="Enter your transaction PIN"
              value={password}
              onChange={e => { setPassword(e.target.value); setPinError(''); }}
              autoComplete="new-password"
              inputMode="numeric"
              autoCorrect="off"
              spellCheck="false"
              name="pin_" id="pin_" // random name/id
            />
            {pinError && <div className="text-red-500 text-xs text-center">{pinError}</div>}
            {password.length >= 4 && (
              <button
                className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition active:scale-95 focus:scale-95 duration-150"
                onClick={async () => {
                  if (password !== transactionPin) {
                    setPinError('Incorrect transaction PIN.');
                    return;
                  }
                  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
                  if (user.blocked || user.locked || user.frozen) {
                    setPinError('Your account is blocked or frozen. Transaction not allowed.');
                    return;
                  }
                  setPinError('');
                  setShowProcessing(true);
                  // Send deposit transaction to backend
                  const res = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: user._id,
                      type: 'deposit',
                      amount: Number(amount),
                      from: selectedCard ? `${selectedCard.cardName} ****${selectedCard.cardNumber.slice(-4)}` : undefined
                    })
                  });
                  if (res.status === 403) {
                    setPinError('Your account is blocked or frozen. Transaction not allowed.');
                    setShowProcessing(false);
                    return;
                  }
                  setTimeout(async () => {
                    setShowTransactionPopup(null);
                    setShowProcessing(false);
                    if (onTransactionCreated) await onTransactionCreated(() => setShowTransactionPopup(null));
                    if (onSuccess) onSuccess();
                  }, 1000);
                }}
              >
                Deposit
              </button>
            )}
          </div>
        ) : null}
        <style>{`
          .bank-card-image {
            background: linear-gradient(135deg, #3a506b 60%, #5bc0be 100%);
            box-shadow: 0 4px 24px 0 rgba(31,38,135,0.18);
            border-radius: 18px;
            border: 1.5px solid rgba(100,180,255,0.18);
          }
        `}</style>
      </div>
    </div>
  );
}
