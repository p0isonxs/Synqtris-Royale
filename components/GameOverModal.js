import { useRouter } from "next/router";  // Import useRouter dari Next.js

export const GameOverModal = ({ open, score, username, onRestart }) => {
  const router = useRouter();  // Menggunakan useRouter untuk navigasi

  const goToLeaderboard = () => {
    router.push("/leaderboard");  // Mengarahkan ke halaman leaderboard
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center transition-all">
      <div className="bg-gradient-to-br from-cyan-900 to-purple-900 rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center border-2 border-cyan-400 relative animate-fade-in">
        <h2 className="text-3xl font-extrabold text-cyan-300 mb-2 drop-shadow">Game Over</h2>
        <p className="text-lg mb-2">Player: <span className="font-semibold text-cyan-200">{username}</span></p>
        <p className="mb-4 text-xl text-purple-200 font-bold">
          Final Score: <span className="text-cyan-400">{score}</span>
        </p>
        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-400 hover:to-indigo-500 font-bold text-lg transition-all"
          onClick={onRestart}
        >
          Restart
        </button>
        <button
          className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg shadow hover:from-yellow-400 hover:to-orange-400 font-bold text-lg transition-all"
          onClick={goToLeaderboard}  // Menambahkan aksi untuk pergi ke leaderboard
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
};
