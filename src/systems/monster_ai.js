import { AStar } from "./astar.js";
import { System } from "../ecs.js";
import { Monster, ActionQueue, Position } from "../components.js";
import { Action, MovementAction } from "../actions.js";

export class MonsterAISystem extends System {
  components_required = [Monster];

  constructor(g) {
    super();
    this.game = g;
  }

  update() {
    const { game, entities, ecs } = this;
    const { map } = game;
    const level = map.currentLevel();
    const pPos = ecs.get_components(game.player).get(Position);

    entities.forEach((e) => {
      const move = (dx, dy) => new MovementAction(game, e, dx, dy);
      const cs = ecs.get_components(e);
      const v = cs.get(Viewshed);
      const q = cs.get(ActionQueue);
      const p = cs.get(Position);
      if (v.visible(level.getIndexFromPoint(pPos))) {
        const path = AStar.get_path(level, p, pPos);
        if (path.length > 1) {
          q.nextAction = move(path[1].x - p.x, path[1].y - p.y);
        }
      } else {
        q.nextAction = new Action(this);
      }
    });
  }
}
