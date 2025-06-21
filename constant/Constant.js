// Constants
export const GAME_CONFIG = {
  ROWS: 20,
  COLS: 10,
  BLOCK_SIZE: 30,
  TICK_SPEED: 800,
  ANIMATION_SPEED: 16,
  BLINK_DURATION: 180,
  COMBO_DURATION: 950,
  LEADERBOARD_REFRESH: 10000
};

export  const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[1, 1, 1], [1, 1, 1]],
  S: [[1, 1, 1], [1, 1, 1]],
  Z: [[1, 1, 1], [1, 1, 1]],
  J: [[1, 1, 1], [1, 1, 1]],
  L: [[1, 1, 1], [1, 1, 1]],
};

export const COLORS = {
  I: "#00f0f0",
  O: "#f0f000",
  T: "#a000f0",
  S: "#00f000",
  Z: "#f00000",
  J: "#0000f0",
  L: "#f0a000",
};

// Sebaiknya disimpan di .env.local untuk aplikasi Next.js
export const SUPABASE_CONFIG = {
  URL: "https://drvegjjbjxryogrxrhpz.supabase.co",
  KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmVnampianhyeW9ncnhyaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzEyNzIsImV4cCI6MjA2NTkwNzI3Mn0._UMUfA4sxx96oA7d4h9YwgUo1ZpZZOnLgQxgOgrxO68"
};
