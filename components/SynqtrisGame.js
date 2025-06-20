import React, { useEffect, useRef, useState } from "react";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};
const COLORS = {
  I: "#00f0f0",
  O: "#f0f000",
  T: "#a000f0",
  S: "#00f000",
  Z: "#f00000",
  J: "#0000f0",
  L: "#f0a000",
};


function getRandomTetromino() {
  const keys = Object.keys(TETROMINOES);
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return { shape: TETROMINOES[rand], type: rand };
}

function rotate(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      result[x][rows - 1 - y] = matrix[y][x];
    }
  }
  return result;
}

// Custom Game Over Modal
function GameOverModal({ open, score, username, onRestart }) {
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
      </div>
    </div>
  );
}

function SynqtrisGame() {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [current, setCurrent] = useState(getRandomTetromino());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [tick, setTick] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [blinkingRows, setBlinkingRows] = useState([]);
  const [comboFX, setComboFX] = useState({ message: "", key: 0 });



  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const SUPABASE_URL = "https://drvegjjbjxryogrxrhpz.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmVnampianhyeW9ncnhyaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzEyNzIsImV4cCI6MjA2NTkwNzI3Mn0._UMUfA4sxx96oA7d4h9YwgUo1ZpZZOnLgQxgOgrxO68";

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch(`${SUPABASE_URL}/rest/v1/scores?select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      })
        .then(res => res.json())
        .then(data => {
          // Filter to keep only highest score per user
          const topScoresMap = {};
          for (const entry of data) {
            if (!topScoresMap[entry.name] || entry.score > topScoresMap[entry.name].score) {
              topScoresMap[entry.name] = entry;
            }
          }
          const uniqueTopScores = Object.values(topScoresMap);
          const sorted = uniqueTopScores.sort((a, b) => b.score - a.score).slice(0, 5);
          setLeaderboard(sorted);
          setLoadingLeaderboard(false);
        });
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);

    if (gameOver || !hasStarted) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
    }, 800);

    return () => {
      clearInterval(id);
      clearInterval(interval);
    };
  }, [gameOver, hasStarted]);

  useEffect(() => {
    if (!gameOver && hasStarted) moveDown();
  }, [tick]);
  
  function hardDrop() {
  if (gameOver || !hasStarted) return;
  let dropY = position.y;
  let steps = 0;
  while (canMove(current.shape, position.x, dropY + 1)) {
    dropY++;
    steps++;
  }
  if (steps === 0) return; // Sudah paling bawah

  // Animasi turun satu-satu secara cepat
  let currentY = position.y;
  const animSpeed = 16; // ms per step (semakin kecil = semakin cepat)
  function animateStep() {
    if (currentY < dropY) {
      setPosition(pos => ({ ...pos, y: pos.y + 1 }));
      currentY++;
      setTimeout(animateStep, animSpeed);
    } else {
      // Setelah selesai animasi, lock block & logic lanjut seperti moveDown
      setTimeout(() => {
        const newGrid = grid.map((row) => [...row]);
        for (let y = 0; y < current.shape.length; y++) {
          for (let x = 0; x < current.shape[y].length; x++) {
            if (current.shape[y][x]) {
              const newY = dropY + y;
              const newX = position.x + x;
              if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                newGrid[newY][newX] = COLORS[current.type];
              }
            }
          }
        }
        const linesCleared = clearLines(newGrid);
        setScore(prev => prev + linesCleared * 100);
        setGrid(newGrid);
        const next = getRandomTetromino();
        if (!canMove(next.shape, 3, 0)) {
          setGameOver(true);
          fetch(`${SUPABASE_URL}/rest/v1/scores?name=eq.${username}`, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`
            }
          })
            .then(res => res.json())
            .then(data => {
              if (data.length === 0 || score + linesCleared * 100 > data[0].score) {
                fetch(`${SUPABASE_URL}/rest/v1/scores`, {
                  method: "POST",
                  headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    Prefer: "resolution=merge-duplicates"
                  },
                  body: JSON.stringify({
                    name: username,
                    score: score + linesCleared * 100
                  })
                });
              }
            });
          return;
        }
        setCurrent(next);
        setPosition({ x: 3, y: 0 });
      }, animSpeed * 2); // jeda kecil biar gak terlalu abrupt
    }
  }
  animateStep();
}

  function getGhostY(shape, x, y) {
  let ghostY = y;
  while (canMove(shape, x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}


  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
  e.preventDefault();
}
if (gameOver || !hasStarted) return;
if (e.key === "ArrowLeft") {
  move(-1);
} else if (e.key === "ArrowRight") {
  move(1);
} else if (e.key === "ArrowDown") {
  moveDown();
} else if (e.key === "ArrowUp") {
  const rotated = rotate(current.shape);
  if (canMove(rotated, position.x, position.y)) {
    setCurrent(cur => ({ ...cur, shape: rotated }));
  }
} else if (e.key === " ") {
  hardDrop();
}

    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, position, grid, gameOver, hasStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    draw(ctx);
  }, [grid, current, position]);

  function move(dir) {
    const newX = position.x + dir;
    if (canMove(current.shape, newX, position.y)) {
      setPosition(pos => ({ ...pos, x: newX }));
    }
  }

  function moveDown() {
    const nextY = position.y + 1;
    if (!canMove(current.shape, position.x, nextY)) {
      const newGrid = grid.map((row) => [...row]);
      for (let y = 0; y < current.shape.length; y++) {
        for (let x = 0; x < current.shape[y].length; x++) {
          if (current.shape[y][x]) {
            const newY = position.y + y;
            const newX = position.x + x;
            if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
              newGrid[newY][newX] = COLORS[current.type];
            }
          }
        }
      }
      const linesCleared = clearLines(newGrid);
      setScore(prev => prev + linesCleared * 100);
      setGrid(newGrid);
      const next = getRandomTetromino();
      if (!canMove(next.shape, 3, 0)) {
        setGameOver(true);
        fetch(`${SUPABASE_URL}/rest/v1/scores?name=eq.${username}`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.length === 0 || score + linesCleared * 100 > data[0].score) {
              fetch(`${SUPABASE_URL}/rest/v1/scores`, {
                method: "POST",
                headers: {
                  apikey: SUPABASE_KEY,
                  Authorization: `Bearer ${SUPABASE_KEY}`,
                  "Content-Type": "application/json",
                  Prefer: "resolution=merge-duplicates"
                },
                body: JSON.stringify({
                  name: username,
                  score: score + linesCleared * 100
                })
              });
            }
          });
        // Hapus alert, modal akan muncul otomatis
        return;
      }
      setCurrent(next);
      setPosition({ x: 3, y: 0 });
    } else {
      setPosition(pos => ({ ...pos, y: nextY }));
    }
  }

  function draw(ctx) {
  ctx.clearRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
  drawGrid(ctx);
  // Gambar ghost piece dulu
  if (!gameOver && hasStarted) {
    const ghostY = getGhostY(current.shape, position.x, position.y);
    drawTetromino(
      ctx,
      current.shape,
      position.x,
      ghostY,
      COLORS[current.type],
      true // isGhost true
    );
  }
  // Baru gambar block asli
  drawTetromino(ctx, current.shape, position.x, position.y, COLORS[current.type]);
}


  function drawGrid(ctx) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x]) {
        const color = grid[y][x];
        ctx.save();
        // Baris yang sedang blink
        if (blinkingRows.includes(y)) {
          ctx.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(Date.now() / 80)); // animasi blinking
          ctx.fillStyle = "#fff";
        } else {
          // Gunakan gradient + glow juga di blok grid (tidak cuma solid)
          const grad = ctx.createLinearGradient(
            x * BLOCK_SIZE, y * BLOCK_SIZE,
            (x + 1) * BLOCK_SIZE, (y + 1) * BLOCK_SIZE
          );
          grad.addColorStop(0, "#fff3"); // highlight di pojok
          grad.addColorStop(0.6, color);
          grad.addColorStop(1, "#0002");
          ctx.fillStyle = grad;
        }
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillRect(
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        ctx.restore();
        // Tambahkan outline tipis agar antar block tetap kelihatan
        ctx.strokeStyle = "#ffffff22";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          x * BLOCK_SIZE + 0.5,
          y * BLOCK_SIZE + 0.5,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );
      } else {
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}



  function drawTetromino(ctx, shape, offsetX, offsetY, color, isGhost = false) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const drawX = offsetX + x;
        const drawY = offsetY + y;
        if (drawY >= 0) {
          ctx.save();
          // ---- PATCH DI SINI UNTUK HIGHLIGHT LANDING ----
          let isLanding = false;
          if (!isGhost) {
            // Cek apakah cell ini adalah bagian terbawah dari shape
            // dan tepat di atas lantai/blok lain
            const isBottomCell =
              y === shape.length - 1 ||
              !shape[y + 1]?.[x];
            const nextY = drawY + 1;
            if (
              isBottomCell &&
              (nextY >= ROWS || (nextY >= 0 && grid[nextY][drawX]))
            ) {
              isLanding = true;
            }
          }
          if (isGhost) {
            // Ghost style (tidak perlu diubah)
            ctx.globalAlpha = 0.22;
            ctx.fillStyle = color;
            ctx.fillRect(
              drawX * BLOCK_SIZE,
              drawY * BLOCK_SIZE,
              BLOCK_SIZE,
              BLOCK_SIZE
            );
            ctx.globalAlpha = 0.40;
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([4, 2]);
            ctx.lineWidth = 2;
            ctx.strokeRect(
              drawX * BLOCK_SIZE + 0.5,
              drawY * BLOCK_SIZE + 0.5,
              BLOCK_SIZE - 1,
              BLOCK_SIZE - 1
            );
            ctx.setLineDash([]);
            ctx.globalAlpha = 1.0;
          } else {
            // Normal block style
            const grad = ctx.createLinearGradient(
              drawX * BLOCK_SIZE,
              drawY * BLOCK_SIZE,
              (drawX + 1) * BLOCK_SIZE,
              (drawY + 1) * BLOCK_SIZE
            );
            grad.addColorStop(0, "#ffffff22");
            grad.addColorStop(1, color);
            ctx.fillStyle = grad;

            ctx.fillRect(
              drawX * BLOCK_SIZE,
              drawY * BLOCK_SIZE,
              BLOCK_SIZE,
              BLOCK_SIZE
            );

            ctx.strokeStyle = "#ffffff55";
            ctx.lineWidth = 1.2;
            ctx.strokeRect(
              drawX * BLOCK_SIZE + 0.5,
              drawY * BLOCK_SIZE + 0.5,
              BLOCK_SIZE - 1,
              BLOCK_SIZE - 1
            );

            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // **HIGHLIGHT landing row**
            if (isLanding) {
              ctx.globalAlpha = 0.7;
              ctx.shadowColor = "#ffff00";
              ctx.shadowBlur = 40;
              ctx.lineWidth = 4;
              ctx.strokeStyle = "#fff15a";
              ctx.strokeRect(
                drawX * BLOCK_SIZE + 2,
                drawY * BLOCK_SIZE + 2,
                BLOCK_SIZE - 4,
                BLOCK_SIZE - 4
              );
              ctx.globalAlpha = 1;
            }
          }
          ctx.restore();
        }
      }
    }
  }
}

  
  
  function clearLines(currentGrid) {
  let linesCleared = 0;
  let cleared = [];
  for (let y = ROWS - 1; y >= 0; y--) {
    if (currentGrid[y].every(cell => cell)) {
      cleared.push(y);
      linesCleared++;
    }
  }

  // ---- COMBO FX PATCH START ----
  if (cleared.length > 0) {
    // FX Message logic
    let message = "";
    if (cleared.length === 4) message = "TETRIS!";
    else if (cleared.length === 3) message = "TRIPLE!";
    else if (cleared.length === 2) message = "DOUBLE!";
    if (message) {
      setComboFX(prev => ({ message, key: prev.key + 1 }));
      setTimeout(() => setComboFX(prev => ({ ...prev, message: "" })), 950);
    }
    // ---- COMBO FX PATCH END ----

    setBlinkingRows(cleared);
    setTimeout(() => {
      for (const y of cleared) {
        currentGrid.splice(y, 1);
        currentGrid.unshift(Array(COLS).fill(0));
      }
      setBlinkingRows([]);
      setGrid(currentGrid);
    }, 180);
    return linesCleared;
  }
  return 0;
}



  function canMove(shape, offsetX, offsetY) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newY = offsetY + y;
          const newX = offsetX + x;
          if (newY >= ROWS || newX < 0 || newX >= COLS || (newY >= 0 && grid[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  }

  

  function resetGame() {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setCurrent(getRandomTetromino());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setTick(0);
    setGameOver(false);
    setHasStarted(true);
  }

  return (

    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-black via-indigo-900 to-purple-950 text-white font-mono">
      <h1 className="text-4xl font-extrabold my-6 tracking-wide bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-500 text-transparent bg-clip-text drop-shadow-md">Synqtris Royale</h1>
      {!hasStarted && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded mr-2 bg-slate-900 text-white placeholder-cyan-300 border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow hover:from-green-400 hover:to-teal-400"
            onClick={resetGame}
            disabled={!username.trim()}
          >
            Start Game
          </button>
        </div>
      )}

      {hasStarted && <p className="text-lg font-medium mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-800 to-purple-700 shadow-md">Player: {username} | Score: {score}</p>}

      {/* Custom Game Over Modal */}
      <GameOverModal
        open={gameOver}
        score={score}
        username={username}
        onRestart={resetGame}
      />

      {comboFX.message && (
        <div
          key={comboFX.key}
          className="pointer-events-none select-none absolute left-1/2 top-1/2 z-40"
          style={{
            transform: 'translate(-50%, -240px)', // geser ke tengah board
            width: '100%',
            textAlign: 'center',
            userSelect: 'none',
            fontFamily: 'inherit',
          }}
        >
          <span
            className={`
              text-6xl font-extrabold
              ${comboFX.message === "P0ISONX!" ? "text-yellow-300 drop-shadow-lg" : ""}
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
)}

      
     <canvas ref={canvasRef} className="border-4 border-cyan-400 mt-4 bg-black rounded-lg shadow-lg w-full max-w-[360px] h-auto"/>

      {isMobile && hasStarted && !gameOver && (
        <div className="grid grid-cols-3 gap-2 max-w-xs w-full mt-4">
          <button
            onTouchStart={() => move(-1)}
            className="bg-cyan-600 p-4 rounded-lg shadow active:scale-90">
            ◀️
          </button>
          <button
            onTouchStart={() => {
              const rotated = rotate(current.shape);
              if (canMove(rotated, position.x, position.y)) {
                setCurrent(cur => ({ ...cur, shape: rotated }));
              }
            }}
            className="bg-cyan-600 p-4 rounded-lg shadow active:scale-90">
            ⟳
          </button>
          <button
            onTouchStart={() => move(1)}
            className="bg-cyan-600 p-4 rounded-lg shadow active:scale-90">
            ▶️
          </button>
          <button
            onTouchStart={moveDown}
            className="col-span-3 bg-cyan-600 p-4 rounded-lg shadow active:scale-90">
            ⬇️
          </button>
              </div>
        )}

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
          <p className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </li>
    ))
  )}
</ul>
      </div>
    </div>
  );
}

export default SynqtrisGame;       
