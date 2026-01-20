import { useEffect, useRef } from 'react';
import '../styles/MessageList.css';

export default function MessageList({ messages, currentUserId }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return <div className="empty-messages">No messages yet. Start the conversation!</div>;
  }

  return (
    <div className="message-list">
      {messages.map((msg, i) => {
        const isOwn = msg.from === currentUserId;
        return (
          <div key={i} className={`message ${isOwn ? 'own' : 'other'}`}>
            <div className="message-header">
              <strong>{msg.from}</strong>
              <span className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="message-content">{msg.message}</p>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
