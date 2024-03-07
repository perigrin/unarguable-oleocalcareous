import { GetDiceRoll, GetRandomBetween } from "../dice.js";
import { Room } from "./room.js";
import { Level } from "./level.js";
import { Tile } from "./tile.js";

export class SimpleLevelBuilder {
  newLevel({ height, width, min = 3, max = 10, rooms = 40 }) {
    const level = new Level({ height, width });

    level.forEachTile((i, t, p) => {
      level.tiles[i] = Tile.WallTile(p.x, p.y);
    });
    this.createLevelTiles(level, min, max, rooms);

    level.entrance = level.rooms[0]?.center();
    level.spawn_points = level.rooms
      .filter((_, i) => i !== 0)
      .map((r) => r.center());
    return level;
  }

  createLevelTiles(level, min_size, max_size, max_rooms) {
    for (let idx = 0; idx < max_rooms; idx++) {
      const w = GetRandomBetween(min_size, max_size);
      const h = GetRandomBetween(min_size, max_size);
      const x = GetDiceRoll(level.width - w - 1);
      const y = GetDiceRoll(level.height - h - 1);

      const newRoom = new Room(x, y, h, w);

      if (!level.inBounds(x, y)) continue;

      if (level.rooms.some((r) => r.intersects(newRoom))) continue;

      if (level.rooms.length !== 0) {
        const lastRoom = level.rooms[level.rooms.length - 1];
        this.connectRooms(level, lastRoom, newRoom);
      }

      this.addRoom(level, newRoom);
    }
  }

  addRoom(level, r) {
    level.rooms.push(r);
    for (let x = 0; x < r.w; x++) {
      for (let y = 0; y < r.h; y++) {
        const i = level.getIndexFromXY(r.x + x, r.y + y);
        level.tiles[i].convertToFloor();
      }
    }
  }

  createHorizontalTunnel(level, x1, x2, y) {
    for (let x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; x++) {
      if (level.inBounds(x, y)) {
        level.tiles[level.getIndexFromXY(x, y)].convertToFloor();
      }
    }
  }

  createVerticalTunnel(level, y1, y2, x) {
    for (let y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; y++) {
      if (level.inBounds(x, y)) {
        level.tiles[level.getIndexFromXY(x, y)].convertToFloor();
      }
    }
  }

  connectRooms(level, r1, r2) {
    const c1 = r1.center();
    const c2 = r2.center();

    const coin = GetDiceRoll(2);
    if (coin === 2) {
      this.createHorizontalTunnel(level, c1.x, c2.x, c1.y);
      this.createVerticalTunnel(level, c1.y, c2.y, c2.x);
    } else {
      this.createHorizontalTunnel(level, c1.x, c2.x, c2.y);
      this.createVerticalTunnel(level, c1.y, c2.y, c1.x);
    }
  }
}
