import { Actor, ActionQueue } from "../components.js";
import { System } from "../ecs.js";

export class ActionSystem extends System {
  components_required = [ActionQueue];
  turn = 0;

  constructor(g) {
    super();
    this.game = g;
  }

  update() {
    const actors = this.ecs
      .get_all_components(Actor)
      .filter((a) => a.has(ActionQueue));

    const q = actors[this.turn % actors.length].get(ActionQueue);
    // TODO implement action points system
    while (q.nextAction) {
      q.nextAction = q.nextAction.perform();
    }
  }
}
