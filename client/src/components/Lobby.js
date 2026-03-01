export default function Lobby({
  roomId,
  room,
  socket,
  isAdmin,
  status,
  onStartGame,
}) {
  return (
    <div className="min-h-screen bg-white text-black p-12">
      <div className="max-w-6xl mx-auto space-y-24">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <div className="mono-label">Lobby / {roomId}</div>
            <h1 className="text-display-lg tracking-tighter uppercase">
              Waiting Area
            </h1>
          </div>
          <div className="p-4 hairline-l bg-black/5 space-y-1">
            <div className="mono-label">Active Connections</div>
            <div className="text-2xl font-light">
              {Object.keys(room?.players || {}).length} Player(s)
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Player List */}
          <div className="lg:col-span-4 space-y-8">
            <div className="mono-label pb-4 hairline-b">Participant list</div>
            <div className="space-y-4">
              {room &&
                Object.values(room.players).map((player) => (
                  <div
                    key={player.id}
                    className="group flex items-center justify-between py-2 transition-opacity hover:opacity-100 opacity-80"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 ${player.isAdmin ? "bg-black" : "hairline-l w-2 h-2"}`}
                      ></div>
                      <span
                        className={`text-lg font-light ${player.id === socket.id ? "text-black underline underline-offset-8" : "text-zinc-500"}`}
                      >
                        {player.username}
                      </span>
                    </div>
                    {player.isAdmin && (
                      <span className="mono-label text-[8px] border border-black/20 px-1">
                        Host
                      </span>
                    )}
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
                    <label className="mono-label text-zinc-400">
                      Round Duration
                    </label>
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
                    <label className="mono-label text-zinc-400">
                      Break Duration
                    </label>
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
                    <label className="mono-label text-zinc-400">
                      Total Iterations
                    </label>
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
                  onClick={onStartGame}
                  className="group flex items-center gap-6 text-4xl font-serif italic hover:gap-10 transition-all pt-12"
                >
                  Begin the competition
                  <span className="not-italic text-5xl">→</span>
                </button>
              </div>
            ) : status === "starting" ? (
              <div className="h-full flex flex-col justify-center space-y-8">
                <div className="mono-label animate-pulse">
                  System Initialization
                </div>
                <div className="text-[12rem] font-serif leading-none italic text-black">
                  0{room.timer}
                </div>
                <p className="text-zinc-400 max-w-sm font-light">
                  The competition sequence is about to begin. Ensure your
                  interface is ready.
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center space-y-8">
                <div className="mono-label">Status Report</div>
                <h2 className="text-display-lg tracking-tighter text-black">
                  WAITING FOR <br /> HOST TO START
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-black animate-scale-x"></div>
                  <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
                    Awaiting Signal
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
