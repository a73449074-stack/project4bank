import { useState } from 'react';

const API_URL = '/api/auth';

export default function LoginPage({ onLogin }) {

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Profile picture logic removed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  // Profile picture is now optional
    setLoading(true);
    try {
      const sendForm = { ...form };
      const res = await fetch(`${API_URL}/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        if (isRegister) {
          setSuccess('Registration successful! Awaiting admin approval.');
        } else {
          setSuccess('Login successful!');
          let userObj = data.user;
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(userObj));
          onLogin && onLogin(userObj);
        }
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100/60 to-blue-300/60 dark:from-[#232b2b]/80 dark:to-[#3a506b]/80 transition-colors duration-500">
      <div className="glassy rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? 'Create Account' : 'Sign In'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="bg-red-100 text-red-700 rounded-lg px-3 py-2 text-sm animate-fade-in border border-red-300">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 rounded-lg px-3 py-2 text-sm animate-fade-in border border-green-300">{success}</div>}
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 dark:bg-[#232b2b]/60"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 dark:bg-[#232b2b]/60"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 dark:bg-[#232b2b]/60"
            required
          />
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-500 hover:underline text-sm"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Already have an account? Sign In' : 'New user? Create an account'}
          </button>
        </div>
      </div>
      <style>{`
        .glassy {
          background: rgba(255,255,255,0.35);
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1.5px solid rgba(255,255,255,0.22);
        }
        .dark .glassy {
          background: rgba(35,43,43,0.85);
          border: 1.5px solid rgba(255,255,255,0.18);
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
