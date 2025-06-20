import React, { useEffect, useRef, useState, useCallback } from "react";
import { useGameState, useMobileDetection } from "../hooks/CustomHook";
import { MobileControls } from "./MobileControls";
import { ComboEffect } from "./ComboEffect";
import { GameOverModal } from "./GameOverModal";
import { useGameLogic } from "../hooks/Gamelogic";
import { COLORS, GAME_CONFIG } from "../constant/Constant";
import { gameUtils } from "../utility/Utility";

// Main Game Component
function SynqtrisGame() {
  const [username, setUsername] = useState("");
  const canvasRef = useRef(null);

  const gameState = useGameState();
  const isMobile = useMobileDetection();
  const gameLogic = useGameLogic(gameState, username);

  // Game tick effect
  useEffect(() => {
    if (gameState.gameOver || !gameState.hasStarted) return;

    const id = setInterval(() => {
      gameLogic.moveDown();
    }, GAME_CONFIG.TICK_SPEED);

    return () => clearInterval(id);
  }, [gameState.gameOver, gameState.hasStarted, gameLogic]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (gameState.gameOver || !gameState.hasStarted) return;

      switch (e.key) {
        case "ArrowLeft":
          gameLogic.move(-1);
          break;
        case "ArrowRight":
          gameLogic.move(1);
          break;
        case "ArrowDown":
          gameLogic.moveDown();
          break;
        case "ArrowUp":
          gameLogic.rotate();
          break;
        case " ":
          gameLogic.hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.hasStarted, gameState.gameOver, gameLogic]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid dan blok yang sudah tertumpuk
      for (let y = 0; y < GAME_CONFIG.ROWS; y++) {
        for (let x = 0; x < GAME_CONFIG.COLS; x++) {
          const block = gameState.grid[y][x];
          const px = x * GAME_CONFIG.BLOCK_SIZE;
          const py = y * GAME_CONFIG.BLOCK_SIZE;

          if (gameState.blinkingRows.includes(y)) {
            ctx.fillStyle = "#ffffff55"; // efek blink putih transparan
            ctx.fillRect(
              px,
              py,
              GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE
            );
            ctx.strokeStyle = "#00000022";
            ctx.strokeRect(
              px,
              py,
              GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE
            );
            continue; // jangan render block asli
          }

          if (block) {
            ctx.fillStyle = block;
            ctx.fillRect(
              px,
              py,
              GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE
            );
            ctx.strokeStyle = "#00000022"; // border tipis agar tidak flat
            ctx.strokeRect(
              px,
              py,
              GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE
            );
          } else {
            ctx.strokeStyle = "#ffffff10"; // grid samar
            ctx.strokeRect(
              px,
              py,
              GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE
            );
          }
        }
      }

      // Ghost Piece (bayangan posisi jatuh)
      if (!gameState.gameOver && gameState.hasStarted) {
        const ghostY = gameUtils.getGhostY(
          gameState.current.shape,
          gameState.position.x,
          gameState.position.y,
          gameState.grid
        );

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = COLORS[gameState.current.type];

        for (let y = 0; y < gameState.current.shape.length; y++) {
          for (let x = 0; x < gameState.current.shape[y].length; x++) {
            if (gameState.current.shape[y][x]) {
              ctx.fillRect(
                (gameState.position.x + x) * GAME_CONFIG.BLOCK_SIZE,
                (ghostY + y) * GAME_CONFIG.BLOCK_SIZE,
                GAME_CONFIG.BLOCK_SIZE,
                GAME_CONFIG.BLOCK_SIZE
              );
            }
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Current Piece
      ctx.fillStyle = COLORS[gameState.current.type];
      for (let y = 0; y < gameState.current.shape.length; y++) {
        for (let x = 0; x < gameState.current.shape[y].length; x++) {
          if (gameState.current.shape[y][x]) {
            ctx.fillRect(
              (gameState.position.x + x) * GAME_CONFIG.BLOCK_SIZE,
              (gameState.position.y + y) * GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE
            );
            ctx.strokeStyle = "#00000022";
            ctx.strokeRect(
              (gameState.position.x + x) * GAME_CONFIG.BLOCK_SIZE,
              (gameState.position.y + y) * GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE,
              GAME_CONFIG.BLOCK_SIZE
            );
          }
        }
      }
    };

    draw();
  }, [
    gameState.grid,
    gameState.current,
    gameState.position,
    gameState.gameOver,
    gameState.hasStarted,
    gameState.blinkingRows,
  ]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-black via-indigo-900 to-purple-950 text-white font-mono p-4">
      <h1 className="text-4xl font-extrabold my-6 tracking-wide bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-500 text-transparent bg-clip-text drop-shadow-md">
        Synqtris Royale
      </h1>

      {!gameState.hasStarted ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded mr-2 bg-slate-900 text-white placeholder-cyan-300 border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow hover:from-green-400 hover:to-teal-400 disabled:opacity-50"
            onClick={gameState.resetGame}
            disabled={!username.trim()}
          >
            Start Game
          </button>
        </div>
      ) : (
        <p className="text-lg font-medium mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-800 to-purple-700 shadow-md">
          Player: {username} | Score: {gameState.score}
        </p>
      )}

      <GameOverModal
        open={gameState.gameOver}
        score={gameState.score}
        username={username}
        onRestart={gameState.resetGame}
      />

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE}
          height={GAME_CONFIG.ROWS * GAME_CONFIG.BLOCK_SIZE}
          className="bg-black border border-gray-600 rounded"
        />
        <ComboEffect comboFX={gameState.comboFX} />
      </div>

      <MobileControls
        visible={isMobile && gameState.hasStarted && !gameState.gameOver}
        onMove={gameLogic.move}
        onRotate={gameLogic.rotate}
        onMoveDown={gameLogic.moveDown}
        onHardDrop={gameLogic.hardDrop}
      />
    </div>
  );
}

export default SynqtrisGame;
