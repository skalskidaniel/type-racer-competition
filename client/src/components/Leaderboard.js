export default function Leaderboard({ players }) {
  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="mono-label mb-8">Best players so far</h2>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/10 text-xs font-mono uppercase tracking-wider text-black/50">
              <th className="py-3 font-normal w-16">Rank</th>
              <th className="py-3 font-normal">Player</th>
              <th className="py-3 font-normal text-right">Avg WPM</th>
              <th className="py-3 font-normal text-right">Games</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {!players || players.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-8 text-center text-black/40 font-mono text-sm"
                >
                  No records yet. Be the first to race!
                </td>
              </tr>
            ) : (
              players.map((player, index) => (
                <tr
                  key={player.user_name}
                  className="group hover:bg-black/5 transition-colors"
                >
                  <td className="py-3 text-black/40 font-mono text-sm">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </td>
                  <td className="py-3 font-medium truncate max-w-[150px]">
                    {player.user_name}
                  </td>
                  <td className="py-3 text-right font-mono">
                    {Math.round(player.words_per_min_avg)}
                  </td>
                  <td className="py-3 text-right text-black/40 font-mono">
                    {player.played_games}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
