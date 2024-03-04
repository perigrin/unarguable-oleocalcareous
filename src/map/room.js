export class Room {
  constructor(x, y, h, w) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
  }

  center() {
    return {
      x: Math.round(this.x + this.w / 2),
      y: Math.round(this.y + this.h / 2),
    };
  }

  intersects(that) {
    if (
      this.x + this.w < that.x ||
      that.x + that.w < this.x ||
      this.y + this.h < that.y ||
      that.y + that.h < this.y
    ) {
      return false;
    }

    return true;
  }
}
