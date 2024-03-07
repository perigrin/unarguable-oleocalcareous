export const EqualPositions = (n, o) => n.x === o.x && n.y === o.y;

// simple manhattan distance
export const MDistance = (h, t) => Math.abs(h.x - t.x) + Math.abs(h.y - t.y);

import { Tile } from "./map/tile.js";
import { Room } from "./map/room.js";
import { SimpleLevelBuilder } from "./map/builder/simple.js";

export class GameMap {
  builder = new SimpleLevelBuilder();
  levels = [];
  constructor({ width = 160, height = 90, tileSize = 64 }) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
  }

  #level = 0;
  currentLevel() {
    if (this.levels[this.#level] === undefined) {
      this.levels[this.#level] = this.builder.newLevel(this);
    }
    return this.levels[this.#level];
  }
}
