import { Action } from "./main.js";
import { EqualPositions } from "../map.js";
import { Position, Viewshed } from "../components.js";

export class MovementAction extends Action {
  constructor(g, e, dx, dy) {
    super(g, e);

    this.dx = dx;
    this.dy = dy;
  }

  perform() {
    const { entity, dx, dy } = this;
    const { ecs, map } = this.game;
    const comp = ecs.get_components(entity);
    const pos = comp.get(Position);
    const l = map.currentLevel();

    if (!l.inBounds(pos.x + dx, pos.y + dy)) return;
    const tile = l.getTile(pos.x + dx, pos.y + dy);
    if (tile.blocked) {
      // get monster at that position:
      const enemy = ecs.find_entity(
        (e) => e && EqualPositions(e.get(Position), tile),
      );
      if (enemy) {
        return new MeleeAttack(this.game, this.entity, enemy);
      }
      return; // nothing to attack but we can't move there so  ... "bump"
    }

    pos.move(dx, dy);
    ecs.get_components(entity).get(Viewshed).dirty = true;
  }
}
