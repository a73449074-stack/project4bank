import React, { useState } from "react";

export default function TransferPopup({ setShowTransactionPopup, transactionPin, onSuccess, onTransactionCreated }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
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

  const handleNext = async () => {
    if (step === 0) {
      if (!recipientName || !recipientBank || !recipientAccount) {
        setError("Please enter recipient name, bank, and account number.");
        return;
      }
    }
    if (step === 1) {
      if (!amount) {
        setError("Please enter amount.");
        return;
      }
      if (Number(amount) > (user.balance || 0)) {
        setError("Insufficient funds");
        return;
      }
    }
    if (step === 2) {
      // Compare both as trimmed strings to avoid type/whitespace issues
      if ((pin || "").toString().trim() !== (transactionPin || "").toString().trim()) {
        setError("Invalid transaction PIN.");
        return;
      }
      // Prevent blocked/frozen users from transacting
      if (user.blocked || user.locked || user.frozen) {
        setError("Your account is blocked or frozen. Transaction not allowed.");
        return;
      }
    }
    setError("");
    if (step === 2) {
      // Send transfer transaction to backend
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          type: 'transfer',
          amount: Number(amount),
          to: recipientName,
          from: user.name,
          remark
        })
      });
      if (res.status === 403) {
        setError("Your account is blocked or frozen. Transaction not allowed.");
        return;
      }
  if (onTransactionCreated) await onTransactionCreated(() => setShowTransactionPopup(null));
  if (onSuccess) onSuccess();
  setShowTransactionPopup(null);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glassy-popup rounded-2xl p-8 shadow-2xl animate-fade-in w-80 max-w-full relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowTransactionPopup(null)}>✕</button>
        <div className="text-xl font-bold mb-4 text-center">Transfer Funds</div>
        {step === 0 && (
          <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleNext(); }}>
            <input className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60" placeholder="Recipient Name" value={recipientName} onChange={e => setRecipientName(e.target.value)} required />
            <input className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60" placeholder="Recipient Bank" value={recipientBank} onChange={e => setRecipientBank(e.target.value)} required />
            <input className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60" placeholder="Recipient Account Number" value={recipientAccount} onChange={e => setRecipientAccount(e.target.value)} required />
            {error && <div className="text-red-500 text-xs text-center">{error}</div>}
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200">Next</button>
          </form>
        )}
        {step === 1 && (
          <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleNext(); }}>
            <input className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60" placeholder="Amount" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required />
            <input className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60" placeholder="Remark (reason for transfer)" value={remark} onChange={e => setRemark(e.target.value)} />
            {error && <div className="text-red-500 text-xs text-center">{error}</div>}
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200">Next</button>
          </form>
        )}
        {step === 2 && (
          <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleNext(); }} autoComplete="off">
            {/* Hidden dummy username field to prevent autofill */}
            <input type="text" name="fakeusernameremembered" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} />
            <input
              type="password"
              className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 text-center text-lg tracking-widest"
              placeholder="Transaction PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              maxLength={4}
              required
              autoComplete="new-password"
              inputMode="numeric"
              autoCorrect="off"
              spellCheck="false"
              name="pin_" id="pin_" // random name/id
            />
            {error && <div className="text-red-500 text-xs text-center">{error}</div>}
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200">Transfer</button>
          </form>
        )}
      </div>
    </div>
  );
}
