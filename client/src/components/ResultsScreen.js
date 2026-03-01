export default function ResultsScreen({ room, socket }) {
  return (
    <div className="space-y-16 py-12">
      <h2 className="text-display-xl tracking-tighter text-black">
        SESSION <br /> COMPLETE
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
        <div className="space-y-8">
          <div className="mono-label pb-4 hairline-b border-black/10">
            Rankings
          </div>
          <div className="space-y-6">
            {Object.values(room.players)
              .sort((a, b) => b.wpm - a.wpm)
              .map((player, index) => (
                <div
                  key={player.id}
                  className="group flex items-center justify-between group"
                >
                  <div className="flex items-center gap-8">
                    <span className="font-serif italic text-2xl text-zinc-400">
                      0{index + 1}
                    </span>
                    <span
                      className={`text-2xl font-light ${player.id === socket.id ? "underline underline-offset-8 text-black" : "text-zinc-400"}`}
                    >
                      {player.username}
                    </span>
                  </div>
                  <span className="font-mono text-zinc-500">
                    {player.wpm} WPM
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col justify-end items-start space-y-8">
          <p className="text-zinc-400 font-light text-lg max-w-xs">
            The tournament has concluded. All session data has been finalized.
          </p>
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
  );
}
