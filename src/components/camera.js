import { Component } from "../ecs.js";

export class Camera extends Component {
  constructor({ ctx, map }) {
    super();
    this.ctx = ctx;
    this.map = map;
  }

  view() {
    const width = Math.round(this.ctx.canvas.width / this.map.tileSize);
    const height = Math.round(this.ctx.canvas.height / this.map.tileSize);
    return { width, height };
  }
}
