
import React, { useState } from 'react';
import GlassyLoader from './GlassyLoader.jsx';

const ATM_LIST = [
  { name: 'Bank of America ATM', account: '0210003221' },
  { name: 'Chase Bank ATM', account: '0210000219' },
  { name: 'Wells Fargo ATM', account: '1210002487' },
  { name: 'Citibank ATM', account: '0210000893' },
  { name: 'US Bank ATM', account: '1230002201' },
  { name: 'PNC Bank ATM', account: '0430000965' },
  { name: 'TD Bank ATM', account: '0311012667' },
  { name: 'Capital One ATM', account: '0514055152' },
  { name: 'Regions Bank ATM', account: '0620056903' },
];
const POS_LIST = [
  { name: 'Walmart Supercenter POS', account: 'POS-100001' },
  { name: 'Target POS', account: 'POS-100002' },
  { name: 'CVS Pharmacy POS', account: 'POS-100003' },
  { name: 'Best Buy POS', account: 'POS-100004' },
  { name: 'Starbucks POS', account: 'POS-100005' },
  { name: 'Costco POS', account: 'POS-100006' },
  { name: 'Walgreens POS', account: 'POS-100007' },
  { name: 'Kroger POS', account: 'POS-100008' },
  { name: 'Home Depot POS', account: 'POS-100009' },
];

function getRandomList(list, n = 3) {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function WithdrawPopup({ setShowTransactionPopup, onSuccess, onTransactionCreated }) {
  const [step, setStep] = useState(0); // 0: choose, 1: list, 2: amount, 3: confirm, 4: processing
  const [mode, setMode] = useState(null); // 'atm' | 'pos'
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [processing, setProcessing] = useState(false);
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

  // Step 0: Choose method
  if (step === 0) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
          <div className="font-bold text-lg mb-2 text-center">Withdraw</div>
          <div className="mb-2 text-xs text-center text-gray-500">Choose withdrawal method</div>
          <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setShowTransactionPopup(null)}>×</button>
          <div className="flex flex-col gap-4 mt-6">
            <button
              className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition text-lg flex items-center justify-center gap-2 active:scale-95 focus:scale-95 duration-150"
              onClick={() => { setMode('atm'); setOptions(getRandomList(ATM_LIST, 3)); setStep(1); }}
            >
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Scan for Nearest ATM
            </button>
            <button
              className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition text-lg flex items-center justify-center gap-2 active:scale-95 focus:scale-95 duration-150"
              onClick={() => { setMode('pos'); setOptions(getRandomList(POS_LIST, 3)); setStep(1); }}
            >
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="2"/><path d="M8 11h8M8 15h8"/></svg>
              Scan for Nearest POS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Show random list
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
          <div className="font-bold text-lg mb-2 text-center">Select {mode === 'atm' ? 'ATM' : 'POS'}</div>
          <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setShowTransactionPopup(null)}>×</button>
          <div className="flex flex-col gap-3 mt-4">
            {options.map((opt, i) => (
              <button
                key={i}
                className="w-full py-3 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-900 font-semibold border border-blue-200/40 shadow flex flex-col items-start px-4 transition active:scale-95 focus:scale-95 duration-150"
                onClick={() => { setSelected(opt); setStep(2); }}
              >
                <span className="text-base font-bold">{opt.name}</span>
                <span className="text-xs text-gray-500">Account: {opt.account}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Enter amount
  if (step === 2 && selected) {
    const handleNext = () => {
      if (Number(amount) > (user.balance || 0)) {
        setAmountError('Insufficient funds');
        return;
      }
      setAmountError('');
      setStep(3);
    };
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
          <div className="font-bold text-lg mb-2 text-center">Withdraw from {selected.name}</div>
          <div className="mb-2 text-xs text-center text-gray-500">Account: {selected.account}</div>
          <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setShowTransactionPopup(null)}>×</button>
          <input
            className="w-full px-3 py-2 rounded border border-blue-200/40 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
            type="number"
            min="1"
            placeholder="Enter amount to withdraw"
            value={amount}
            onChange={e => { setAmount(e.target.value.replace(/[^0-9]/g, '')); setAmountError(''); }}
            autoFocus
          />
          {amountError && <div className="text-red-500 text-xs text-center mb-2">{amountError}</div>}
          {amount && Number(amount) > 0 && (
            <button
              className="w-full py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition active:scale-95 focus:scale-95 duration-150"
              onClick={handleNext}
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Confirm and enter PIN
  if (step === 3 && selected) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glassy-popup rounded-xl shadow-2xl p-6 w-80 max-w-full text-gray-900 relative animate-fade-in border border-blue-200/40">
          <div className="font-bold text-lg mb-2 text-center">Confirm Withdrawal</div>
          <div className="mb-2 text-xs text-center text-gray-500">ATM/POS: {selected.name}</div>
          <div className="mb-2 text-xs text-center text-gray-500">Account: {selected.account}</div>
          <div className="mb-2 text-center text-lg font-bold text-blue-700">${amount}</div>
          <input
            className="w-full px-3 py-2 rounded border border-blue-200/40 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
            type="password"
            placeholder="Enter your transaction PIN"
            value={pin}
            onChange={e => { setPin(e.target.value); setPinError(''); }}
            minLength={4}
            autoFocus
            autoComplete="new-password"
            inputMode="numeric"
            autoCorrect="off"
            spellCheck="false"
            name="pin_" id="pin_" // random name/id
          />
          {pinError && <div className="text-red-500 text-xs text-center mb-2">{pinError}</div>}
          <div className="flex gap-2 mt-2">
            <button className="flex-1 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition active:scale-95 focus:scale-95 duration-150" onClick={() => setStep(2)}>Back</button>
            <button
              className="flex-1 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition active:scale-95 focus:scale-95 duration-150"
              onClick={async () => {
                if (!pin || pin !== user.transactionPin) {
                  setPinError('Incorrect transaction PIN.');
                  return;
                }
                if (user.blocked || user.locked || user.frozen) {
                  setPinError('Your account is blocked or frozen. Transaction not allowed.');
                  return;
                }
                setProcessing(true);
                setStep(4);
                // Send withdraw transaction to backend
                const res = await fetch('/api/transactions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user._id,
                    type: 'withdraw',
                    amount: Number(amount),
                    from: selected ? selected.name : undefined
                  })
                });
                if (res.status === 403) {
                  setPinError('Your account is blocked or frozen. Transaction not allowed.');
                  setProcessing(false);
                  return;
                }
                setTimeout(async () => {
                  setProcessing(false);
                  setShowTransactionPopup(null);
                  if (onTransactionCreated) await onTransactionCreated(() => setShowTransactionPopup(null));
                  if (onSuccess) onSuccess();
                }, 1000);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Processing
  if (step === 4 && processing) {
    return <GlassyLoader text="Processing your withdrawal..." />;
  }

  return null;
}


