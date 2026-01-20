import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_URL = "http://localhost:8080"; // backend
let socket;

export default function SocketTest() {
  const [token, setToken] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);

  const log = (msg) => setLogs((l) => [...l, msg]);

  // connect socket
  const connectSocket = () => {
    socket = io(API_URL, {
      auth: { token },
    });

    socket.on("connect", () => {
      log(`🟢 Connected: ${socket.id}`);
    });

    socket.on("disconnect", () => {
      log("🔴 Disconnected");
    });

    socket.on("room:message", (data) => {
      log(`💬 ${data.from}: ${data.message}`);
    });
  };

  // create room via HTTP
  const createRoom = async () => {
    console.log(`roomName: ${roomName}`)
    const res = await axios.post(
      `${API_URL}/api/v1/room`,
      { roomName: roomName },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setRoomId(res.data.room._id);
    log(`🏠 Room created: ${res.data.room._id}`);
  };

  // join room via socket
  const joinRoom = () => {
    socket.emit("room:join", { roomId });
    log(`➡️ Joined room ${roomId}`);
  };

  // send room message
  const sendMessage = () => {
    socket.emit("room:message", {
      roomId,
      message,
    });
    setMessage("");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Socket Test Page</h2>

      <input
        placeholder="JWT Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: "100%" }}
      />
      <button onClick={connectSocket}>Connect Socket</button>

      <hr />

      <input
        placeholder="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>

      <hr />

      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>

      <hr />

      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>

      <hr />

      <div style={{ background: "#111", color: "#0f0", padding: 10 }}>
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
