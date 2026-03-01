export default function JoinScreen({
  joinError,
  handleJoin,
  username,
  setUsername,
  roomId,
  setRoomId,
}) {
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

          <form
            onSubmit={handleJoin}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
          >
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
