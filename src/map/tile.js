export class Tile {
  static WallTile(x, y, c = "#", s = [5, 12], b = true) {
    return new Tile("wall", x, y, c, s, b, true);
  }

  constructor(type, x, y, char, sprite, blocked, obstructed) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.char = char;
    this.sprite = sprite;
    this.blocked = blocked;
    this.seen = false;
    this.visible = false;
    this.obstructed = obstructed;
  }

  position() {
    return { x: this.x, y: this.y };
  }

  is_wall() {
    return this.type === "wall";
  }

  convertToFloor() {
    this.type = "floor";
    this.char = ".";
    this.sprite = [0, 11];
    this.blocked = false;
    this.obstructed = false;
  }

  distance(that) {
    return MDistance(this, that);
  }
}
