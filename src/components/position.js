import { Component } from "../ecs.js";

export class Position extends Component {
  constructor({ x = 0, y = 0 }, l) {
    super(x, y);
    this.x = x;
    this.y = y;
    this.level = l;
    l.blockTile(this);
  }

  block() {
    this.level.blockTile(this);
  }

  unblock() {
    this.level.unblockTile(this);
  }

  move(dx, dy) {
    this.unblock();
    this.x += dx;
    this.y += dy;
    this.block();
  }
}
