import { Component } from "../ecs.js";

export class Viewshed extends Component {
  visible_tiles = [];
  dirty = true;
  constructor(r = 8) {
    super(r);
    this.range = r;
  }

  visible(idx) {
    return this.visible_tiles.find((i) => i === idx);
  }
}
