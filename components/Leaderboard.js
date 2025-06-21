
export const Leaderboard = ({ leaderboard, loadingLeaderboard }) => (
  <div className="mt-6 w-full max-w-xs">
    <h2 className="text-lg font-semibold mb-2">🏆 Leaderboard</h2>
    <ul className="bg-slate-800 border border-cyan-500 rounded-xl shadow-md text-cyan-200 divide-y divide-cyan-600 overflow-hidden">
      {loadingLeaderboard ? (
        <li className="px-4 py-3 text-center text-cyan-400">Loading...</li>
      ) : leaderboard.length === 0 ? (
        <li className="px-4 py-3 text-center">No scores yet</li>
      ) : (
        leaderboard.map((entry, index) => (
          <li
            key={index}
            className="flex justify-between items-center px-4 py-3 hover:bg-cyan-700/10 transition-all"
          >
            <div className="flex gap-2 items-center">
              <span className="font-bold text-lg text-cyan-300">#{index + 1}</span>
              <span className="text-base font-medium">{entry.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{entry.score} pts</p>
              <p className="text-xs text-gray-400">
                {new Date(entry.created_at).toLocaleString([], { 
                  weekday: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </li>
        ))
      )}
    </ul>
  </div>
);
