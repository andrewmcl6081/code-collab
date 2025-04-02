"use client";

import { useState } from "react";
import ChatTester from "@/components/ChatTester";

const Dashboard = () => {
  const [room, setRoom] = useState(null);

  async function createRoom() {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Test room" }),
    });

    const data = await response.json();
    console.log("DATA:", data);
    setRoom(data);
  }

  return (
    <>
      <h1>Dashboard</h1>
      <p>Welcome to the Dashboard!</p>
      <button onClick={createRoom}>Create Room</button>
      {room && <p>Room Created: {room.name}</p>}
      <ChatTester />
    </>
  );
}

export default Dashboard;