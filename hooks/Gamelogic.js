import { useCallback } from "react";
import { gameUtils } from "../utility/Utility";
import { COLORS, GAME_CONFIG } from "../constant/Constant";
import { apiService } from "../api/api.service";

// Game Logic Hook
export const useGameLogic = (gameState, username) => {
  const {
    grid,
    setGrid,
    current,
    setCurrent,
    position,
    setPosition,
    score,
    setScore,
    setGameOver,
    setBlinkingRows,
    setComboFX,
  } = gameState;

const clearLines = useCallback(
  (currentGrid) => {
    let linesCleared = 0;
    let cleared = [];
    for (let y = GAME_CONFIG.ROWS - 1; y >= 0; y--) {
      if (currentGrid[y].every((cell) => cell)) {
        cleared.push(y);
        linesCleared++;
      }
    }

    if (cleared.length > 0) {
      let message = "";
      if (cleared.length === 4) message = "TETRIS!";
      else if (cleared.length === 3) message = "TRIPLE!";
      else if (cleared.length === 2) message = "DOUBLE!";

      if (message) {
        setComboFX((prev) => ({ message, key: prev.key + 1 }));
        setTimeout(
          () => setComboFX((prev) => ({ ...prev, message: "" })),
          GAME_CONFIG.COMBO_DURATION
        );
      }

      setBlinkingRows(cleared);
      setTimeout(() => {
        const newGrid = [...currentGrid];
        for (const y of cleared) {
          newGrid.splice(y, 1);
          newGrid.unshift(Array(GAME_CONFIG.COLS).fill(0));
        }
        setBlinkingRows([]);
        setGrid(newGrid);
      }, GAME_CONFIG.BLINK_DURATION);
    }
    return linesCleared;
  },
  [setGrid, setBlinkingRows, setComboFX] // This is sufficient, no need for other dependencies like `grid`
);


const lockPiece = useCallback(
  async (finalGrid, finalPosition) => {
    const newGrid = finalGrid.map((row) => [...row]);

    // Masukkan blok ke grid
    for (let y = 0; y < current.shape.length; y++) {
      for (let x = 0; x < current.shape[y].length; x++) {
        if (current.shape[y][x]) {
          const newY = finalPosition.y + y;
          const newX = finalPosition.x + x;
          if (
            newY >= 0 &&
            newY < GAME_CONFIG.ROWS &&
            newX >= 0 &&
            newX < GAME_CONFIG.COLS
          ) {
            newGrid[newY][newX] = COLORS[current.type];
          }
        }
      }
    }

    // Cek baris penuh tapi TUNDA penghapusan
    let linesCleared = 0;
    let cleared = [];
    for (let y = GAME_CONFIG.ROWS - 1; y >= 0; y--) {
      if (newGrid[y].every((cell) => cell)) {
        cleared.push(y);
        linesCleared++;
      }
    }

    if (cleared.length > 0) {
      let message = "";
      if (cleared.length === 4) message = "TETRIS!";
      else if (cleared.length === 3) message = "TRIPLE!";
      else if (cleared.length === 2) message = "DOUBLE!";
      if (message) {
        setComboFX((prev) => ({ message, key: prev.key + 1 }));
        setTimeout(() => setComboFX((prev) => ({ ...prev, message: "" })), GAME_CONFIG.COMBO_DURATION);
      }

      setBlinkingRows(cleared);       // trigger efek blink
      setGrid(newGrid);               // tampilkan grid final yang bikin baris penuh

      // TUNDA penghapusan baris
      setTimeout(async () => {
         console.log("Menghapus baris:", cleared);  // debug log
        for (const y of cleared) {
          newGrid.splice(y, 1);
          newGrid.unshift(Array(GAME_CONFIG.COLS).fill(0));
        }

        setBlinkingRows([]);
        setGrid([...newGrid]);

        const newScore =
          score + linesCleared * 100 + (finalPosition.y - position.y);
        setScore(newScore);

        const next = gameUtils.getRandomTetromino();
        if (!gameUtils.canMove(next.shape, 3, 0, newGrid)) {
          setGameOver(true);
          if (username) await apiService.saveScore(username, newScore);
          return;
        }

        setCurrent(next);
        setPosition({ x: 3, y: 0 });
      }, GAME_CONFIG.BLINK_DURATION); // tunggu blink selesai
    } else {
      // Kalau tidak ada baris penuh, langsung lanjut
      setGrid(newGrid);
      const next = gameUtils.getRandomTetromino();
      if (!gameUtils.canMove(next.shape, 3, 0, newGrid)) {
        setGameOver(true);
        if (username) await apiService.saveScore(username, score);
        return;
      }

      setCurrent(next);
      setPosition({ x: 3, y: 0 });
    }
  },
  [
    score,
    username,
    current,
    position.y,
    position.x,
    setScore,
    setGrid,
    setGameOver,
    setCurrent,
    setPosition,
    setBlinkingRows,
    setComboFX,
  ]
);


const moveDown = useCallback(() => {
  const nextY = position.y + 1;
  if (!gameUtils.canMove(current.shape, position.x, nextY, grid)) {
    lockPiece(grid, position);
  } else {
    setPosition((pos) => ({ ...pos, y: nextY }));
  }
}, [position, current, grid, lockPiece, setPosition]);  // `setPosition`, `position`, `current`, `grid`, `lockPiece` are required dependencies

  const move = useCallback(
    (dir) => {
      const newX = position.x + dir;
      if (gameUtils.canMove(current.shape, newX, position.y, grid)) {
        setPosition((pos) => ({ ...pos, x: newX }));
      }
    },
    [position, current, grid, setPosition]
  );

  const rotate = useCallback(() => {
    const rotatedShape = gameUtils.rotate(current.shape);
    if (gameUtils.canMove(rotatedShape, position.x, position.y, grid)) {
      setCurrent((cur) => ({ ...cur, shape: rotatedShape }));
    }
  }, [current, position, grid, setCurrent]);

  const hardDrop = useCallback(() => {
    let dropY = position.y;
    while (gameUtils.canMove(current.shape, position.x, dropY + 1, grid)) {
      dropY++;
    }
    if (dropY === position.y) return;

    const finalPosition = { ...position, y: dropY };
    lockPiece(grid, finalPosition);
  }, [position, current, grid, lockPiece]);

  return { moveDown, move, rotate, hardDrop };
};
