import { useNavigate } from 'react-router-dom';
import '../styles/RoomList.css';

export default function RoomList({ rooms, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading">Loading rooms...</div>;
  }

  if (!rooms || rooms.length === 0) {
    return <div className="empty-state">No rooms yet. Create one to get started!</div>;
  }

  return (
    <div className="room-list">
      <h2>Your Rooms</h2>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="room-card"
            onClick={() => navigate(`/room/${room._id}`)}
          >
            <h3>{room.name}</h3>
            <p className="room-members">{room.members?.length || 0} members</p>
            <p className="room-date">
              {new Date(room.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
