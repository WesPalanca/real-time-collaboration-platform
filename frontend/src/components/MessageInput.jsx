import { useState } from 'react';
import '../styles/MessageInput.css';

export default function MessageInput({ onSendMessage, loading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage('');
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
        className="input-field"
      />
      <button type="submit" disabled={loading} className="send-btn">
        {loading ? '...' : 'Send'}
      </button>
    </form>
  );
}
