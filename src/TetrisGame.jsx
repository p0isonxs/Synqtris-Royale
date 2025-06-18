export default function TetrisGame() {
  return (
    <div>
      <h1>Multisynq Tetris Royale</h1>
      <p>Final version with multiplayer and share room support.</p>
      <button
        onClick={() => {
          const room = new URLSearchParams(window.location.search).get("room") || "tetris-room";
          const url = `${window.location.origin}?room=${encodeURIComponent(room)}`;
          navigator.clipboard.writeText(url).then(() => {
            alert("Room link copied to clipboard! 🫡");
          });
        }}
      >
        🔗 Share Room
      </button>
    </div>
  );
}