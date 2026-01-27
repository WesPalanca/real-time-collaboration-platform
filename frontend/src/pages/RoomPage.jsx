import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageAPI, roomAPI } from '../utils/api';
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
  const [members, setMembers] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);
  const [addMemberSuccess, setAddMemberSuccess] = useState(null);

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
      setMessages((prev) => [...prev, data.message]);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      if (err.type === 'ROOM_NOT_FOUND') {
        navigate('/dashboard');
      }
    });

    socket.on('room:error', (err) => {
      setAddMemberError(err.message);
    });

    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('room:message');
      socket.off('error');
      socket.off('room:error');
    };
  }, [roomId, navigate]);

  // Separate listener setup for real-time member additions that persists
  useEffect(() => {
    const socket = getSocket();

    // Listen for real-time member additions and update immediately
    socket.on('room:user-added', (data) => {
      setMembers(data.members);
      setAddMemberSuccess('Member added successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setAddMemberSuccess(null), 3000);
    });

    return () => {
      socket.off('room:user-added');
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await messageAPI.getRoomMessages(roomId);
      setMessages(res.data.messages || []);
      setRoomName(res.data.roomName || 'Room');
      setMembers(res.data.members || []);
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

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!recipientId.trim()) {
      setAddMemberError('Please enter a user ID');
      return;
    }

    try {
      setAddingMember(true);
      setAddMemberError(null);
      setAddMemberSuccess(null);

      // Emit socket event for real-time user addition
      const socket = getSocket();
      socket.emit('room:add-user', { 
        roomId, 
        recipientId: recipientId.trim() 
      });

      setRecipientId('');
    } catch (err) {
      setAddMemberError('Failed to add member');
    } finally {
      setAddingMember(false);
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
          <form onSubmit={handleAddMember} className="add-member-form">
            <input
              type="text"
              placeholder="Enter user ID to invite..."
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={addingMember}
              className="member-input"
            />
            <button
              type="submit"
              disabled={addingMember || !recipientId.trim()}
              className="btn-add-member"
            >
              {addingMember ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        </div>

        {/* Add-member feedback and updated members list */}
        {addMemberError && <div className="error-message">{addMemberError}</div>}
        {addMemberSuccess && <div className="success-message">{addMemberSuccess}</div>}
        {members.length > 0 && (
          <div className="room-members">
            Members: {members.map(m => m.username).join(', ')}
          </div>
        )}

        <div className="room-content">
          <MessageList messages={messages} currentUserId={user?.userId} />
          <MessageInput onSendMessage={handleSendMessage} loading={loading} />
        </div>
      </div>
    </div>
  );
}
