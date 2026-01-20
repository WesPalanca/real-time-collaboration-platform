import { useEffect, useState } from 'react';
import { roomAPI } from '../utils/api';
import { initSocket } from '../utils/socket';
import Header from '../components/Header';
import RoomForm from '../components/RoomForm';
import RoomList from '../components/RoomList';
import '../styles/DashboardPage.css';

export default function DashboardPage({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket
    const token = localStorage.getItem('token');
    initSocket(token);

    // Fetch rooms
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomAPI.getRooms();
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = (newRoom) => {
    setRooms([...rooms, newRoom]);
  };

  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <section className="create-room-section">
            <h2>Create a New Room</h2>
            <RoomForm onRoomCreated={handleRoomCreated} />
          </section>

          <section className="rooms-section">
            <RoomList rooms={rooms} loading={loading} />
          </section>
        </div>
      </div>
    </div>
  );
}
