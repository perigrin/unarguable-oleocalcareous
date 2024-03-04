export class Level {
  tiles = [];
  rooms = [];

  constructor({ height, width }) {
    this.height = height;
    this.width = width;
  }

  forEachTile(f, s = 0, y = 0) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const p = { x, y };
        const i = this.getIndexFromXY(x, y);
        f(i, this.tiles[i], p);
      }
    }
  }

  getPointForTile({ x, y }) {
    return { x, y };
  }

  getIndexFromXY(x, y) {
    return y * this.width + x;
  }

  getIndexFromPoint({ x, y }) {
    return this.getIndexFromXY(x, y);
  }

  getTile(x, y) {
    return this.tiles[this.getIndexFromXY(x, y)];
  }

  inBounds(x, y) {
    const idx = this.getIndexFromXY(x, y);
    return (
      x >= 0 <= this.width &&
      y >= 0 <= this.height &&
      idx >= 0 &&
      idx < this.tiles.length
    );
  }

  blockTile(p) {
    this.tiles[this.getIndexFromPoint(p)].blocked = true;
  }

  unblockTile(p) {
    this.tiles[this.getIndexFromPoint(p)].blocked = false;
  }

  getTilesNear(p) {
    return [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ].map((n) => this.getTile(p.x + n[0], p.y + n[1]));
  }
}
