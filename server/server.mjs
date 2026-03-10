import { createServer } from "http";
import { Server } from "socket.io";
import { sentences } from "./sentences.js";
import { supabase } from "./supabase/client.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("get-leaderboard", async () => {
    const { data, error } = await supabase
      .from("player_stats")
      .select("user_name, played_games, words_per_min_avg")
      .order("words_per_min_avg", { ascending: false })
      .limit(10);

    if (!error) {
      socket.emit("leaderboard-update", data);
    } else {
      console.error("Error fetching leaderboard:", error);
    }
  });

  socket.on("join-room", ({ roomId, username }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        adminId: socket.id,
        players: {},
        status: "waiting", // waiting, starting, racing, break, finished
        text: sentences[Math.floor(Math.random() * sentences.length)],
        config: {
          roundTime: 30,
          breakTime: 10,
          totalRounds: 5,
        },
        currentRound: 1,
        timer: 60,
      });
    }

    const room = rooms.get(roomId);

    if (room.status !== "waiting") {
      socket.emit(
        "join-error",
        "This tournament has already started and cannot be joined.",
      );
      return;
    }

    socket.join(roomId);
    room.players[socket.id] = {
      id: socket.id,
      username,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      isFinished: false,
      isAdmin: room.adminId === socket.id,
    };

    io.to(roomId).emit("room-update", room);
  });

  socket.on("start-game", ({ roomId, config }) => {
    const room = rooms.get(roomId);
    if (room && room.adminId === socket.id) {
      room.config = { ...room.config, ...config };
      room.status = "starting";
      room.timer = 10;
      room.currentRound = 1;

      const countdownInterval = setInterval(() => {
        room.timer--;
        if (room.timer <= 0) {
          clearInterval(countdownInterval);
          startRound(roomId);
        } else {
          io.to(roomId).emit("room-update", room);
        }
      }, 1000);

      io.to(roomId).emit("room-update", room);
    }
  });

  function startRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.status = "racing";
    room.timer = room.config.roundTime;
    room.text = sentences[Math.floor(Math.random() * sentences.length)];

    Object.values(room.players).forEach((p) => {
      p.progress = 0;
      p.wpm = 0;
      p.accuracy = 100;
      p.isFinished = false;
    });

    const roundInterval = setInterval(() => {
      room.timer--;

      const allFinished = Object.values(room.players).every(
        (p) => p.isFinished,
      );

      if (room.timer <= 0 || allFinished) {
        clearInterval(roundInterval);
        endRound(roomId);
      } else {
        io.to(roomId).emit("room-update", room);
      }
    }, 1000);

    io.to(roomId).emit("room-update", room);
  }

  function endRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.currentRound < room.config.totalRounds) {
      room.status = "break";
      room.timer = room.config.breakTime;

      const breakInterval = setInterval(() => {
        room.timer--;
        if (room.timer <= 0) {
          clearInterval(breakInterval);
          room.currentRound++;
          startRound(roomId);
        } else {
          io.to(roomId).emit("room-update", room);
        }
      }, 1000);
    } else {
      room.status = "finished";

      const resultsToSave = Object.values(room.players).map((player) => ({
        user_name: player.username,
        words_per_min: Math.round(player.wpm) || 0,
      }));

      if (resultsToSave.length > 0) {
        supabase
          .from("game_results")
          .insert(resultsToSave)
          .then(({ error }) => {
            if (error) {
              console.error("Error saving game results:", error);
            } else {
              console.log("Game results saved for room:", roomId);
            }
          });
      }
    }

    io.to(roomId).emit("room-update", room);
  }

  socket.on("update-progress", ({ roomId, progress, wpm, accuracy }) => {
    const room = rooms.get(roomId);
    if (room && room.players[socket.id] && room.status === "racing") {
      const player = room.players[socket.id];
      player.progress = progress;
      player.wpm = wpm;
      player.accuracy = accuracy;

      if (progress >= 100) {
        player.isFinished = true;
      }

      io.to(roomId).emit("room-update", room);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    rooms.forEach((room, roomId) => {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        if (Object.keys(room.players).length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit("room-update", room);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
