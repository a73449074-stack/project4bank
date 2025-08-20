import { useState } from 'react';

const API_URL = '/api/auth';

export default function LoginPage({ onLogin }) {

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', profilePic: '' });
  const [previewPic, setPreviewPic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new window.FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, profilePic: reader.result }));
        setPreviewPic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  // Profile picture is now optional
    setLoading(true);
    try {
      let profilePicUrl = form.profilePic;
      if (isRegister && form.profilePic && !form.profilePic.startsWith('http')) {
        // Upload image to backend
        const picData = new FormData();
        // Convert base64 to blob if needed
        if (form.profilePic.startsWith('data:')) {
          const arr = form.profilePic.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
          const blob = new Blob([u8arr], { type: mime });
          picData.append('profilePic', blob, 'profile.jpg');
        } else {
          // If not base64, treat as file
          picData.append('profilePic', form.profilePic);
        }
  const uploadRes = await fetch('/api/upload/profile-pic', {
          method: 'POST',
          body: picData
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.url) {
          profilePicUrl = uploadJson.url;
        } else {
          setError('Profile picture upload failed.');
          setLoading(false);
          return;
        }
      }
      const sendForm = { ...form, profilePic: profilePicUrl };
      if (!isRegister) delete sendForm.profilePic;
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
          // Save profilePic to localStorage for new user (frontend only)
          if (profilePicUrl) {
            const user = { ...form, profilePic: profilePicUrl };
            localStorage.setItem('user', JSON.stringify(user));
          }
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
            <>
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-blue-400 mb-2 shadow-xl">
                  {previewPic ? (
                    <img src={previewPic} alt="Profile" className="object-cover w-full h-full" />
                  ) : (
                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M16 16c0-2.21-3.58-4-8-4s-8 1.79-8 4v2h16v-2z"/></svg>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} required />
                <span className="text-xs text-blue-500 hover:underline">Choose Profile Picture</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 dark:bg-[#232b2b]/60"
                required
              />
            </>
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
