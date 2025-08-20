import React, { useState, useRef, useEffect } from 'react';

export default function ChatWithAdmin({ floating = true, floatingPosition }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'admin', text: 'Welcome! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { from: 'user', text: input }]);
      setInput('');
      // Simulate admin reply
      setTimeout(() => {
        setMessages(msgs => [...msgs, { from: 'admin', text: 'Admin will reply soon.' }]);
      }, 1000);
    }
  };

  return (
    <>
      <button
        className={
          (floating
            ? (floatingPosition === "top"
                ? "fixed top-3 right-6 z-50 "
                : "fixed bottom-6 right-6 z-50 ")
            : "w-full ") +
          " w-11 h-11 p-2 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
        }
        onClick={() => setOpen(!open)}
        aria-label="Chat with admin"
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      </button>
      {open && (
        <div className="fixed top-16 right-6 z-50 w-80 max-w-xs bg-white/90 dark:bg-[#232b2b]/95 rounded-2xl shadow-2xl glassy animate-fade-in flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold">Chat with Admin</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-red-500">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 max-h-60">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-3 py-2 text-sm ${msg.from === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center border-t border-gray-200 dark:border-gray-700 px-2 py-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 dark:bg-[#232b2b]/60 text-sm"
              placeholder="Type your message..."
            />
            <button onClick={sendMessage} className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 font-semibold text-sm">Send</button>
          </div>
        </div>
      )}
      <style>{`
        .glassy {
          background: rgba(255,255,255,0.25);
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .dark .glassy {
          background: rgba(35,43,43,0.7);
          border: 1px solid rgba(255,255,255,0.12);
        }
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: animate-fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </>
  );
}
