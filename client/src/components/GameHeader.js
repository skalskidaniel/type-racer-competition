export default function GameHeader({ roomId, room, wpm, socket }) {
  const isRacing = room?.status === "racing";
  const player = room?.players?.[socket?.id];
  const displayWpm = isRacing ? wpm : (player?.avgWpm || 0);
  const label = isRacing ? "Current Velocity" : "Average Velocity";

  return (
    <header className="flex justify-between items-end border-b border-black/10 pb-8">
      <div className="space-y-4">
        <div className="mono-label">Session Control / {roomId}</div>
        <div className="flex gap-8 items-center">
          <div className="space-y-1">
            <div className="mono-label text-zinc-400">Iteration</div>
            <div className="text-xl font-light">
              0{room?.currentRound}{" "}
              <span className="text-zinc-400 text-sm">
                / 0{room?.config.totalRounds}
              </span>
            </div>
          </div>
          <div className="hairline-l border-black/10 pl-8 space-y-1">
            <div className="mono-label text-zinc-400">Status</div>
            {room?.status === "break" && (
              <div className="text-xl font-light italic text-black animate-pulse uppercase tracking-widest text-sm">
                Break: {room.timer}s
              </div>
            )}
            {room?.status === "racing" && (
              <div className="text-xl font-light uppercase tracking-widest text-sm text-zinc-500">
                Active Sequence: {room.timer}s
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="mono-label text-zinc-400">{label}</div>
        <div className="text-7xl font-serif italic leading-none">{displayWpm}</div>
        <div className="mono-label">Words / Minute</div>
      </div>
    </header>
  );
}
