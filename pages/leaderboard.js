// pages/leaderboard.js
import { useLeaderboard } from "../hooks/CustomHook";  // Menggunakan hook leaderboard
import Link from "next/link";  // Link dari Next.js untuk navigasi

const LeaderboardPage = () => {
  const { leaderboard, loadingLeaderboard } = useLeaderboard();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-black via-indigo-900 to-purple-950 text-white font-mono p-4">
      <h1 className="text-4xl font-extrabold my-6 tracking-wide bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-500 text-transparent bg-clip-text drop-shadow-md">
        Leaderboard
      </h1>

      <ul className="bg-slate-800 border border-cyan-500 rounded-xl shadow-md text-cyan-200 divide-y divide-cyan-600 overflow-hidden w-full md:w-1/3 max-w-xs">
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

      <div className="mt-6">
        <Link href="/">
          <p className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow hover:from-green-400 hover:to-teal-400">
            Back to Game
          </p>
        </Link>
      </div>
    </div>
  );
};

export default LeaderboardPage;
