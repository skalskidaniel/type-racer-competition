import Leaderboard from "./Leaderboard";

export default function JoinScreen({
  joinError,
  handleJoin,
  username,
  setUsername,
  roomId,
  setRoomId,
  leaderboard,
}) {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-8 lg:p-12">
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start lg:items-center">
        {/* Left Column: Leaderboard */}
        <div className="order-2 lg:order-1 w-full border-t lg:border-t-0 lg:border-r border-black/10 pt-16 lg:pt-0 lg:pr-16">
          <Leaderboard players={leaderboard} />
        </div>

        {/* Right Column: Join Form */}
        <div className="order-1 lg:order-2 space-y-24 w-full max-w-xl">
          <header className="space-y-4">
            <div className="mono-label">Competition Platform</div>
            <h1 className="text-display-xl tracking-tighter leading-[0.85]">
              TYPE <br /> RACER
            </h1>
          </header>

          <main className="space-y-12">
            {joinError && (
              <div className="p-4 hairline-l bg-black/5 text-black text-sm font-mono">
                [ERROR] {joinError}
              </div>
            )}

            <form onSubmit={handleJoin} className="grid grid-cols-1 gap-y-12">
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
              <div className="pt-8">
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
    </div>
  );
}
