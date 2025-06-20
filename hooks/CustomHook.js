// Custom Hooks
import { useState, useEffect, useCallback } from "react";
import { GAME_CONFIG } from "../constant/Constant";
import { apiService } from "../api/api.service";
import { gameUtils } from "../utility/Utility";


console.log(gameUtils);  // Check if createEmptyGrid exists


export const useGameState = () => {
  const [grid, setGrid] = useState(gameUtils.createEmptyGrid());
  const [current, setCurrent] = useState(gameUtils.getRandomTetromino());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [blinkingRows, setBlinkingRows] = useState([]);
  const [comboFX, setComboFX] = useState({ message: "", key: 0 });

  const resetGame = useCallback(() => {
    setGrid(gameUtils.createEmptyGrid());
    setCurrent(gameUtils.getRandomTetromino());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setGameOver(false);
    setHasStarted(true);
    setBlinkingRows([]);
    setComboFX({ message: "", key: 0 });
  }, []);

  return {
    grid, setGrid,
    current, setCurrent,
    position, setPosition,
    score, setScore,
    gameOver, setGameOver,
    hasStarted, setHasStarted,
    blinkingRows, setBlinkingRows,
    comboFX, setComboFX,
    resetGame
  };
};

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const fetchAndSetLeaderboard = useCallback(async () => {
    const data = await apiService.fetchLeaderboard();
    setLeaderboard(data);
    setLoadingLeaderboard(false);
  }, []);

  useEffect(() => {
    fetchAndSetLeaderboard();
    const interval = setInterval(fetchAndSetLeaderboard, GAME_CONFIG.LEADERBOARD_REFRESH);
    return () => clearInterval(interval);
  }, [fetchAndSetLeaderboard]);

  return { leaderboard, loadingLeaderboard };
};

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};
