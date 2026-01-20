import { useState } from 'react';
import { roomAPI } from '../utils/api';
import '../styles/RoomForm.css';

export default function RoomForm({ onRoomCreated }) {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await roomAPI.createRoom(roomName);
      setRoomName('');
      onRoomCreated(res.data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="room-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="Room name..."
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          disabled={loading}
          className="form-input"
        />
        <button type="submit" disabled={loading} className="form-btn">
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
}
