import { Component } from "../ecs.js";

export class Health extends Component {
  constructor(health) {
    super();
    this.current_health = health;
  }
}
