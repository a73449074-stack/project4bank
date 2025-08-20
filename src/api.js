// API utility for user-related requests
export async function setTransactionPin(userId, pin, token) {
  const res = await fetch(`/api/users/${userId}/transaction-pin`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ transactionPin: pin })
  });
  if (!res.ok) throw new Error('Failed to set transaction PIN');
  return res.json();
}

export async function getUser(userId, token) {
  const res = await fetch(`/api/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

// Alias for compatibility with UserDashboard.jsx
export const setTransactionPassword = setTransactionPin;
