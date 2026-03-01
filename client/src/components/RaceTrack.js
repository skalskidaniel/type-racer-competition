export default function RaceTrack({ room, socket }) {
  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="mono-label pb-4 hairline-b border-black/10">
        Competition Track
      </div>
      <div className="space-y-6 relative py-4">
        {room &&
          Object.values(room.players).map((player) => (
            <div key={player.id} className="relative group">
              <div className="flex justify-between items-center mb-2 px-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${player.id === socket.id ? "bg-black scale-125" : "bg-zinc-200"}`}
                  ></div>
                  <span
                    className={`mono-label transition-colors ${player.id === socket.id ? "text-black font-medium" : "text-zinc-400"}`}
                  >
                    {player.username}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">
                    {player.wpm} WPM
                  </span>
                  <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-tighter">
                    {Math.round(player.progress)}%
                  </span>
                </div>
              </div>
              <div className="relative h-1 w-full bg-zinc-50 overflow-hidden">
                {/* Grid markers */}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-[1px] bg-black/[0.03]"
                    style={{ left: `${(i + 1) * 10}%` }}
                  ></div>
                ))}

                {/* Progress bar */}
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                    player.id === socket.id ? "bg-black" : "bg-zinc-300"
                  }`}
                  style={{ width: `${player.progress}%` }}
                >
                  {/* Car/Pointer indicator */}
                  <div
                    className={`absolute right-0 top-0 bottom-0 w-1 ${player.id === socket.id ? "bg-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" : "bg-zinc-400"}`}
                  ></div>
                </div>
              </div>
            </div>
          ))}

        {/* Finish Line */}
        <div className="absolute right-0 top-0 bottom-0 w-1 border-r border-dashed border-black/10 h-full pointer-events-none"></div>
      </div>
    </div>
  );
}
