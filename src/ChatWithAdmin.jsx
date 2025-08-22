
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function ChatWithAdmin({ isAdmin, users = [], userId, adminId = '', onClose }) {
  const [selectedUser, setSelectedUser] = useState(isAdmin && users.length > 0 ? '' : userId || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);


  // Connect socket and join room only if selectedUser is set (for admin)
  useEffect(() => {
    let s;
    try {
      s = io('http://localhost:5000');
      setSocket(s);
      // Always join the room for the current user (admin or user)
      if (isAdmin && userId) {
        s.emit('join', userId);
      } else if (!isAdmin && userId) {
        s.emit('join', userId);
      }
      s.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } catch (err) {
      setMessages([{ sender: 'system', message: 'Socket connection error.' }]);
    }
    return () => { if (s) s.disconnect(); };
    // eslint-disable-next-line
  }, [selectedUser, userId, adminId, isAdmin]);

  // Fetch chat history when user is selected (admin) or userId is set (user)
  useEffect(() => {
    // For admin: need both adminId (userId) and selectedUser
    // For user: need userId and adminId
    if ((isAdmin && (!selectedUser || !userId)) || (!isAdmin && (!userId || !adminId))) return;
    const fetchHistory = async () => {
      try {
        // For admin: userId = admin's _id, selectedUser = user's _id
        // For user: userId = user's _id, adminId = admin's _id
        const res = await fetch(`/api/chat/${isAdmin ? selectedUser : userId}/${isAdmin ? userId : adminId}`);
        if (!res.ok) throw new Error('Failed to fetch chat history');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setMessages([{ sender: 'system', message: 'Failed to load chat history.' }]);
      }
    };
    fetchHistory();
  }, [selectedUser, userId, adminId, isAdmin]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || (isAdmin && !selectedUser) || (!isAdmin && !adminId)) return;
    if (!socket) {
      setMessages((prev) => [...prev, { sender: 'system', message: 'Socket not connected.' }]);
      return;
    }
    // For admin: sender = admin's _id, receiver = selectedUser
    // For user: sender = userId, receiver = adminId
    socket.emit('send_message', {
      sender: isAdmin ? userId : userId,
      receiver: isAdmin ? selectedUser : adminId,
      message: input,
    });
    setInput('');
  };

  return (
    <div className="fixed top-16 right-6 z-50 w-80 max-w-xs bg-white/90 dark:bg-[#232b2b]/95 rounded-2xl shadow-2xl glassy animate-fade-in flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="font-semibold">Support Chat</span>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
      </div>
      {isAdmin && (
        <select
          className="m-2 p-1 border rounded text-black bg-white"
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          style={{ color: 'black', backgroundColor: 'white' }}
        >
          <option value="" disabled style={{ color: 'black', backgroundColor: 'white' }}>Select user...</option>
          {users.map(u => (
            <option key={u._id} value={u._id} style={{ color: 'black', backgroundColor: 'white' }}>{u.name || u.email}</option>
          ))}
        </select>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-2 max-h-60">
        {messages.length === 0 && <div className="text-gray-400 text-sm text-center">{isAdmin ? 'Select a user to start chat' : 'No messages yet'}</div>}
        {messages.map((msg, i) => {
          // For admin: admin's own messages (sender === userId) are blue/right, user messages are left/grey
          // For user: user's own messages (sender === userId) are blue/right, received messages are left/grey
          const isOwn = msg.sender === userId;
          return (
            <div key={i} className={`mb-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-3 py-2 text-sm ${isOwn ? 'bg-blue-500 text-white' : msg.sender === 'system' ? 'bg-red-200 text-red-800' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{msg.message}</div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="flex items-center border-t border-gray-200 dark:border-gray-700 px-2 py-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 rounded-lg px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none bg-white/60 dark:bg-[#232b2b]/60 text-sm"
          placeholder={isAdmin ? (!selectedUser ? 'Select a user to chat...' : 'Type your message...') : 'Type your message...'}
          disabled={isAdmin && !selectedUser}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 font-semibold text-sm"
          disabled={isAdmin && !selectedUser}
        >Send</button>
      </div>
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
    </div>
  );
}
