import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3001");

function Room() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState("Random"); // New state variable
  const emojis = ["😀", "🐱", "🍎", "⚽", "🚀", "👽", "🎩", "💼", "🍔", "🦄"]; // Emoji list

  useEffect(() => {
    socket.on("room users", (usersInRoom) => {
      setUsers(usersInRoom);
      setInRoom(true); // Set inRoom to true here
    });

    socket.on("error", (errorMessage) => {
      alert(errorMessage);
      setInRoom(false); // Reset inRoom if there's an error
    });

    return () => {
      socket.off("room users");
      socket.off("error");
    };
  }, []);

  const createRoom = () => {
    const newRoomCode = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");
    setRoomCode(newRoomCode);
    socket.emit("create room", newRoomCode); // Emit event to create the room
    handleJoinRoom(newRoomCode);
  };

  const handleJoinRoom = (joinRoomCode = roomCode) => {
    if (username.trim() === "") {
      alert("Please enter a username");
      return;
    }
    socket.emit("join room", {
      username,
      roomCode: joinRoomCode,
      emoji: selectedEmoji,
    });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave room", { roomCode });
    setRoomCode("");
    setInRoom(false);
    setUsers([]);
  };

  return (
    <div className="container">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {!inRoom && (
        <input
          type="text"
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
      )}
      {!inRoom ? (
        <>
          <select
            value={selectedEmoji}
            onChange={(e) => setSelectedEmoji(e.target.value)}
          >
            <option value="Random">Random</option>
            {emojis.map((emoji, index) => (
              <option key={index} value={emoji}>
                {emoji}
              </option>
            ))}
          </select>
          <button onClick={() => handleJoinRoom()}>Join Room</button>
          <button onClick={createRoom}>Create Room</button>
        </>
      ) : (
        <div>
          <p>You are in Room: {roomCode}</p>
          <button onClick={handleLeaveRoom}>Leave Room</button>
        </div>
      )}

      <div className="user-list">
        <h3>Users in Room:</h3>
        <ul style={{ listStyleType: "none" }}>
          {users.map((user, index) => (
            <li key={index}>
              {user.name} {user.emoji}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Room;
