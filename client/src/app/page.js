"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import JoinScreen from "../components/JoinScreen";
import Lobby from "../components/Lobby";
import GameHeader from "../components/GameHeader";
import BreakScreen from "../components/BreakScreen";
import ResultsScreen from "../components/ResultsScreen";
import RaceTrack from "../components/RaceTrack";
import TypingArea from "../components/TypingArea";
import DeadlineWarning from "../components/DeadlineWarning";

const SOCKET_URL = "http://localhost:4001";

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
  const [showDeadlineWarning, setShowDeadlineWarning] = useState(false);

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
    if (room?.status === "break" || room?.status === "finished") {
      setTypedText("");
      setShowDeadlineWarning(false);
    }
  }, [room?.status]);

  useEffect(() => {
    if (
      room?.status === "racing" &&
      room?.timer === 5 &&
      !room?.players[socket?.id]?.isFinished
    ) {
      setShowDeadlineWarning(true);
    } else if (
      room?.status !== "racing" ||
      room?.players[socket?.id]?.isFinished
    ) {
      setShowDeadlineWarning(false);
    }
  }, [room?.timer, room?.status, room?.players, socket?.id]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username && roomId && socket) {
      socket.emit("join-room", { roomId, username });
      setJoined(true);
    }
  };

  const calculateWPM = (correctText, timeElapsed, fullText) => {
    const trimmed = correctText.trim();
    if (!trimmed || timeElapsed <= 0) return 0;

    let wordsCount = trimmed.split(/\s+/).length;

    if (
      correctText.length < fullText.length &&
      correctText[correctText.length - 1] !== " " &&
      fullText[correctText.length] !== " "
    ) {
      wordsCount--;
    }

    return Math.round((wordsCount / timeElapsed) * 60);
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
    const correctText = targetText.slice(0, correctChars);
    const currentWpm = startTime
      ? calculateWPM(correctText, timeElapsed, targetText)
      : 0;

    setWpm(currentWpm);
    socket.emit("update-progress", { roomId, progress, wpm: currentWpm });

    if (progress >= 100) {
      return;
    }
  };

  if (!joined) {
    return (
      <JoinScreen
        joinError={joinError}
        handleJoin={handleJoin}
        username={username}
        setUsername={setUsername}
        roomId={roomId}
        setRoomId={setRoomId}
      />
    );
  }

  const isAdmin = room?.players[socket.id]?.isAdmin;
  const status = room?.status || "waiting";

  if (status === "waiting" || status === "starting") {
    return (
      <Lobby
        roomId={roomId}
        room={room}
        socket={socket}
        isAdmin={isAdmin}
        status={status}
        onStartGame={() =>
          socket.emit("start-game", { roomId, config: room.config })
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-12">
      <div className="max-w-6xl mx-auto space-y-16">
        <GameHeader roomId={roomId} room={room} wpm={wpm} />

        {room?.status === "break" ? (
          <BreakScreen room={room} />
        ) : room?.status === "finished" ? (
          <ResultsScreen room={room} socket={socket} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
            {showDeadlineWarning && <DeadlineWarning />}

            <RaceTrack room={room} socket={socket} />

            <TypingArea
              room={room}
              socket={socket}
              typedText={typedText}
              handleTyping={handleTyping}
              inputRef={inputRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}
