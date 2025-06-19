import React, { useEffect, useRef, useState } from "react";
import { Session, Model, View } from "@croquet/croquet";

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

class SynqtrisModel extends Model {
  init() {
    this.players = {};
    this.future(100, "tick");
  }
  tick() {
    this.publish("tetris", "sync", this.players);
    this.future(100, "tick");
  }
}

class SynqtrisView extends View {
  constructor(model) {
    super(model);
    const { username, setOpponentBoard } = model.options;
    model.subscribe("tetris", "sync", (data) => {
      const opponent = Object.entries(data).find(([name]) => name !== username);
      if (opponent) {
        const [, payload] = opponent;
        setOpponentBoard(payload.grid);
      }
    });
  }
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
  const [opponentBoard, setOpponentBoard] = useState([]);

  const SUPABASE_URL = "https://drvegjjbjxryogrxrhpz.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmVnampianhyeW9ncnhyaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzEyNzIsImV4cCI6MjA2NTkwNzI3Mn0._UMUfA4sxx96oA7d4h9YwgUo1ZpZZOnLgQxgOgrxO68";

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    Session.join({
      appId: "com.synqtris.royale",
      apiKey: "2oYvftXOLAkGHVrD8I5vXFPd5TgMiECskoXSGe16Xk",
      name: "room-1",
      password: "default",
      model: SynqtrisModel,
      view: SynqtrisView,
      options: {
        username,
        setOpponentBoard
      }
    });
  }, [username]);

  // Keep the rest of your component logic below here...
  return (
    <div className="flex flex-col items-center">
      {/* canvas and UI rendering */}
    </div>
  );
}

export default SynqtrisGame;
