"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export default function TypeRacer() {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("room-update", (data) => {
      setRoom(data);
      setJoinError("");
    });

    newSocket.on("join-error", (errorMsg) => {
      setJoinError(errorMsg);
      setJoined(false);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (room?.status === "break") {
      setTypedText("");
    }
  }, [room?.status]);

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
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-24">
          <header className="space-y-4">
            <div className="mono-label">Competition Platform</div>
            <h1 className="text-display-xl tracking-tighter">
              TYPE <br /> RACER
            </h1>
          </header>

          <main className="space-y-12">
            {joinError && (
              <div className="p-4 hairline-l bg-black/5 text-black text-sm font-mono">
                [ERROR] {joinError}
              </div>
            )}

            <form onSubmit={handleJoin} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <label className="mono-label">Identity</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 pb-2 focus:outline-none focus:border-black transition-all font-sans text-xl placeholder:text-zinc-300"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="mono-label">Space ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 pb-2 focus:outline-none focus:border-black transition-all font-sans text-xl placeholder:text-zinc-300"
                  placeholder="Enter room"
                  required
                />
              </div>
              <div className="md:col-span-2 pt-8">
                <button
                  type="submit"
                  className="group flex items-center gap-4 text-2xl font-light hover:gap-8 transition-all"
                >
                  Join Competition
                  <span className="text-4xl">→</span>
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    );
  }

  const isAdmin = room?.players[socket.id]?.isAdmin;
  const status = room?.status || "waiting";

  if (status === "waiting" || status === "starting") {
    return (
      <div className="min-h-screen bg-white text-black p-12">
        <div className="max-w-6xl mx-auto space-y-24">
          <header className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <div className="mono-label">Lobby / {roomId}</div>
              <h1 className="text-display-lg tracking-tighter uppercase">Waiting Area</h1>
            </div>
            <div className="p-4 hairline-l bg-black/5 space-y-1">
              <div className="mono-label">Active Connections</div>
              <div className="text-2xl font-light">{Object.keys(room?.players || {}).length} Player(s)</div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Player List */}
            <div className="lg:col-span-4 space-y-8">
              <div className="mono-label pb-4 hairline-b">Participant list</div>
              <div className="space-y-4">
                {room && Object.values(room.players).map((player) => (
                  <div key={player.id} className="group flex items-center justify-between py-2 transition-opacity hover:opacity-100 opacity-80">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 ${player.isAdmin ? 'bg-black' : 'hairline-l w-2 h-2'}`}></div>
                      <span className={`text-lg font-light ${player.id === socket.id ? "text-black underline underline-offset-8" : "text-zinc-500"}`}>
                        {player.username}
                      </span>
                    </div>
                    {player.isAdmin && <span className="mono-label text-[8px] border border-black/20 px-1">Host</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Config Area */}
            <div className="lg:col-span-8 hairline-l pl-12 space-y-12 border-black/10">
              {isAdmin && status === "waiting" ? (
                <div className="space-y-12">
                  <div className="mono-label">Tournament Parameters</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-2">
                      <label className="mono-label text-zinc-400">Round Duration</label>
                      <input
                        type="number"
                        defaultValue={room.config.roundTime}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) room.config.roundTime = val;
                        }}
                        className="w-full bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black font-mono text-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="mono-label text-zinc-400">Interval Duration</label>
                      <input
                        type="number"
                        defaultValue={room.config.breakTime}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) room.config.breakTime = val;
                        }}
                        className="w-full bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black font-mono text-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="mono-label text-zinc-400">Total Iterations</label>
                      <input
                        type="number"
                        defaultValue={room.config.totalRounds}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) room.config.totalRounds = val;
                        }}
                        className="w-full bg-transparent border-b border-black/10 py-2 focus:outline-none focus:border-black font-mono text-xl"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => socket.emit("start-game", { roomId, config: room.config })}
                    className="group flex items-center gap-6 text-4xl font-serif italic hover:gap-10 transition-all pt-12"
                  >
                    Initialize Tournament
                    <span className="not-italic text-5xl">→</span>
                  </button>
                </div>
              ) : status === "starting" ? (
                <div className="h-full flex flex-col justify-center space-y-8">
                  <div className="mono-label animate-pulse">System Initialization</div>
                  <div className="text-[12rem] font-serif leading-none italic text-black">
                    0{room.timer}
                  </div>
                  <p className="text-zinc-400 max-w-sm font-light">The competition sequence is about to begin. Ensure your interface is ready.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center space-y-8">
                  <div className="mono-label">Status Report</div>
                  <h2 className="text-display-lg tracking-tighter text-black">WAITING FOR <br /> HOST TO START</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[1px] bg-black animate-scale-x"></div>
                    <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">Awaiting Signal</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-12">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="flex justify-between items-end border-b border-black/10 pb-8">
          <div className="space-y-4">
            <div className="mono-label">Session Control / {roomId}</div>
            <div className="flex gap-8 items-center">
              <div className="space-y-1">
                <div className="mono-label text-zinc-400">Iteration</div>
                <div className="text-xl font-light">0{room?.currentRound} <span className="text-zinc-400 text-sm">/ 0{room?.config.totalRounds}</span></div>
              </div>
              <div className="hairline-l border-black/10 pl-8 space-y-1">
                <div className="mono-label text-zinc-400">Status</div>
                {room?.status === "break" && <div className="text-xl font-light italic text-black animate-pulse uppercase tracking-widest text-sm">Maintenance: {room.timer}s</div>}
                {room?.status === "racing" && <div className="text-xl font-light uppercase tracking-widest text-sm text-zinc-500">Active Sequence: {room.timer}s</div>}
              </div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="mono-label text-zinc-400">Current Velocity</div>
            <div className="text-7xl font-serif italic leading-none">{wpm}</div>
            <div className="mono-label">Words / Minute</div>
          </div>
        </header>

        {room?.status === "break" ? (
          <div className="h-[50vh] flex flex-col justify-center items-center text-center space-y-12">
            <h2 className="text-display-xl tracking-tighter italic font-serif text-black">SYSTEM RECOVERY</h2>
            <div className="space-y-4">
              <p className="mono-label">Next sequence initialization in</p>
              <div className="text-5xl font-light text-black">{room.timer} SECONDS</div>
            </div>
            <div className="w-64 h-[2px] bg-black/10 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-1000"
                style={{ width: `${(room.timer / room.config.breakTime) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : room?.status === "finished" ? (
          <div className="space-y-16 py-12">
            <h2 className="text-display-xl tracking-tighter text-black">SESSION <br /> COMPLETE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
              <div className="space-y-8">
                <div className="mono-label pb-4 hairline-b border-black/10">Rankings</div>
                <div className="space-y-6">
                  {Object.values(room.players)
                    .sort((a, b) => b.wpm - a.wpm)
                    .map((player, index) => (
                      <div key={player.id} className="group flex items-center justify-between group">
                        <div className="flex items-center gap-8">
                          <span className="font-serif italic text-2xl text-zinc-400">0{index + 1}</span>
                          <span className={`text-2xl font-light ${player.id === socket.id ? "underline underline-offset-8 text-black" : "text-zinc-400"}`}>
                            {player.username}
                          </span>
                        </div>
                        <span className="font-mono text-zinc-500">{player.wpm} WPM</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex flex-col justify-end items-start space-y-8">
                <p className="text-zinc-400 font-light text-lg max-w-xs">The tournament has concluded. All session data has been finalized.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="group flex items-center gap-6 text-3xl font-serif italic hover:gap-10 transition-all text-black"
                >
                  Restart Sequence
                  <span className="not-italic text-4xl">→</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Players Progress */}
            <div className="lg:col-span-3 space-y-8">
              <div className="mono-label pb-4 hairline-b border-black/10">Live Metrics</div>
              <div className="space-y-8">
                {room && Object.values(room.players).map((player) => (
                  <div key={player.id} className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-end">
                      <span className={`mono-label ${player.id === socket.id ? "text-black" : "text-zinc-400"}`}>
                        {player.username}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">{player.wpm} WPM</span>
                    </div>
                    <div className="h-[1px] w-full bg-black/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${player.id === socket.id ? "bg-black" : "bg-zinc-300"}`}
                        style={{ width: `${player.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typing Area */}
            <div className="lg:col-span-9 space-y-16 font-serif">
              <div className="mono-label pb-4 hairline-b border-black/10">Input Buffer</div>
              <div className="relative text-3xl md:text-5xl font-light leading-[1.4] tracking-tight min-h-[12rem] text-black">
                <span className="underline decoration-1 underline-offset-[12px] decoration-zinc-200">
                  {room?.text.slice(0, typedText.length)}
                </span>
                <span className="text-zinc-300">
                  {room?.text.slice(typedText.length)}
                </span>
              </div>

              <div className="pt-8 hairline-t border-black/10">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  value={typedText}
                  onChange={handleTyping}
                  className="w-full bg-transparent py-4 text-2xl font-light focus:outline-none placeholder:text-zinc-200 transition-all font-sans text-black"
                  placeholder="Start typing to begin..."
                  disabled={room?.players[socket.id]?.isFinished}
                />
              </div>

              {room?.players[socket.id]?.isFinished && (
                <div className="pt-8 flex items-center gap-4">
                  <div className="w-2 h-2 bg-black animate-pulse"></div>
                  <div className="mono-label text-black">Buffer finalized. Stand by for next iteration.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
