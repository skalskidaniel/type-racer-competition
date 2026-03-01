"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export default function TypeRacer() {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("default");
  const [joined, setJoined] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("room-update", (data) => {
      setRoom(data);
    });

    return () => newSocket.close();
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username && roomId && socket) {
      socket.emit("join-room", { roomId, username });
      setJoined(true);
    }
  };

  const calculateWPM = (text, timeElapsed) => {
    const words = text.trim().split(/\s+/).length;
    return Math.round((words / timeElapsed) * 60);
  };

  const handleTyping = (e) => {
    if (room?.status === "finished") return;

    const value = e.target.value;
    const targetText = room?.text || "";

    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }

    setTypedText(value);

    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === targetText[i]) {
        correctChars++;
      } else {
        break;
      }
    }

    const progress = (correctChars / targetText.length) * 100;
    const timeElapsed = (Date.now() - startTime) / 1000;
    const currentWpm = startTime ? calculateWPM(value, timeElapsed) : 0;

    setWpm(currentWpm);
    socket.emit("update-progress", { roomId, progress, wpm: currentWpm });

    if (progress >= 100) {
      return;
    }
  };

  // the below was llm generated
  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Type Racer
          </h1>
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Enter your name..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="default"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              Join Competition
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Type Racer / {roomId}
          </h1>
          <div className="text-slate-400 text-sm">
            WPM: <span className="text-2xl font-mono text-emerald-400 ml-2">{wpm}</span>
          </div>
        </div>

        {/* Players Progress */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
          {room && Object.values(room.players).map((player) => (
            <div key={player.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={player.id === socket.id ? "text-blue-400 font-bold" : "text-slate-400"}>
                  {player.username} {player.id === socket.id && "(You)"}
                </span>
                <span className="text-slate-500 font-mono">{Math.round(player.progress)}% • {player.wpm} WPM</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${player.id === socket.id ? "bg-blue-500" : "bg-slate-600"}`}
                  style={{ width: `${player.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Typing Area */}
        <div className="space-y-4">
          <div className="relative text-2xl font-mono leading-relaxed p-8 bg-slate-900 rounded-3xl border border-white/10 min-h-32 select-none">
            <div className="absolute inset-0 p-8">
              <span className="text-emerald-400 bg-emerald-400/10 rounded">
                {room?.text.slice(0, typedText.length)}
              </span>
              <span className="text-slate-400">
                {room?.text.slice(typedText.length)}
              </span>
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={typedText}
            onChange={handleTyping}
            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-700"
            placeholder="Type the text above..."
            disabled={room?.players[socket.id]?.isFinished}
          />

          {room?.players[socket.id]?.isFinished && (
            <div className="animate-pulse flex items-center justify-center p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
              Race Finished! Final Speed: {room.players[socket.id]?.wpm} WPM
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
