// Utility Functions

import { GAME_CONFIG, TETROMINOES } from "../constant/Constant";


export const gameUtils = {
  getRandomTetromino() {
    const keys = Object.keys(TETROMINOES);
    const rand = keys[Math.floor(Math.random() * keys.length)];
    return { shape: TETROMINOES[rand], type: rand };
  },

  rotate(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        result[x][rows - 1 - y] = matrix[y][x];
      }
    }
    return result;
  },

  createEmptyGrid() {
    return Array.from({ length: GAME_CONFIG.ROWS }, () =>
      Array(GAME_CONFIG.COLS).fill(0)
    );
  },

  canMove(shape, offsetX, offsetY, grid) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newY = offsetY + y;
          const newX = offsetX + x;
          if (
            newY >= GAME_CONFIG.ROWS ||
            newX < 0 ||
            newX >= GAME_CONFIG.COLS ||
            (newY >= 0 && grid[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  },

  getGhostY(shape, x, y, grid) {
    let ghostY = y;
    while (this.canMove(shape, x, ghostY + 1, grid)) {
      ghostY++;
    }
    return ghostY;
  },
};
