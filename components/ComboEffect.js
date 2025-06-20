

export const ComboEffect = ({ comboFX }) => {
  if (!comboFX.message) return null;

  return (
    <div
      key={comboFX.key}
      className="pointer-events-none select-none absolute left-1/2 top-1/2 z-40"
      style={{
        transform: 'translate(-50%, -240px)',
        width: '100%',
        textAlign: 'center',
        userSelect: 'none',
        fontFamily: 'inherit',
      }}
    >
      <span
        className={`
          text-6xl font-extrabold
          ${comboFX.message === "TETRIS!" ? "text-yellow-300 drop-shadow-lg" : ""}
          ${comboFX.message === "TRIPLE!" ? "text-pink-400 drop-shadow-lg" : ""}
          ${comboFX.message === "DOUBLE!" ? "text-cyan-300 drop-shadow" : ""}
          animate-bounce-in-out
        `}
        style={{
          letterSpacing: "2px",
          textShadow: "0 4px 32px #fff8, 0 0 64px #ffd70088",
          opacity: comboFX.message ? 1 : 0,
          transition: "opacity .2s",
        }}
      >
        {comboFX.message}
      </span>
    </div>
  );
};