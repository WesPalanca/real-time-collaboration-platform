import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageAPI } from '../utils/api';
import { getSocket } from '../utils/socket';
import Header from '../components/Header';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import '../styles/RoomPage.css';

export default function RoomPage({ user, onLogout }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
        navigate('/');
    }
  });

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    // Fetch existing messages
    fetchMessages();

    // Join room
    socket.emit('room:join', { roomId });

    // Listen for new messages
    socket.on('room:message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      if (err.type === 'ROOM_NOT_FOUND') {
        navigate('/dashboard');
      }
    });

    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('room:message');
      socket.off('error');
    };
  }, [roomId, navigate]);

  const fetchMessages = async () => {
    try {
      const res = await messageAPI.getRoomMessages(roomId);
      setMessages(res.data.messages || []);
      setRoomName(res.data.roomName || 'Room');
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = (message) => {
    try {
      setLoading(true);
      const socket = getSocket();
      socket.emit('room:message', { roomId, message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-page">
      <Header user={user} onLogout={onLogout} />
      <div className="room-container">
        <div className="room-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h1>{roomName}</h1>
        </div>

        <div className="room-content">
          <MessageList messages={messages} currentUserId={user?.userId} />
          <MessageInput onSendMessage={handleSendMessage} loading={loading} />
        </div>
      </div>
    </div>
  );
}
