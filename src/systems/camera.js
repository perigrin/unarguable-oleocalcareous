import { System } from "../ecs.js";
import { Actor, Camera, Position, Viewshed } from "../components.js";

export class CameraSystem extends System {
  components_required = [Camera, Position, Viewshed];

  constructor(g) {
    super(g);
    const { ecs, ctx, map, player } = g;
    this.ecs = ecs;
    this.ctx = ctx;
    this.map = map;
    this.player = player;
    this.foreground = g.style.color;
    this.highlight = g.style.highlightColor;
    this.spritesheet = g.spritesheet;
  }

  SHOW_BOUNDS = true;

  drawSprite(sprite, x, y) {
    this.ctx.drawImage(
      this.spritesheet,
      sprite[0] * this.map.tileSize,
      sprite[1] * this.map.tileSize,
      this.map.tileSize,
      this.map.tileSize,
      x * this.map.tileSize,
      y * this.map.tileSize,
      this.map.tileSize,
      this.map.tileSize,
    );
  }

  render_viewport() {
    const { ctx, map } = this;
    const level = map.currentLevel();
    const { min, max } = this.get_min_max();

    let y = 0;
    for (let ty = min.y; ty < max.y; ty++) {
      let x = 0;
      for (let tx = min.x; tx < max.x; tx++) {
        if (level.inBounds(tx, ty)) {
          const t = level.getTile(tx, ty);
          ctx.fillStyle = this.foreground;
          if (t.visible) {
            ctx.fillStyle = this.highlight;
          }
          if (t.seen)
            ctx.fillText(
              t.char,
              x * map.tileSize,
              y * map.tileSize,
              map.tileSize,
            );
          //if (t.seen) this.drawSprite(t.sprite, x, y)
        } else {
          if (this.SHOW_BOUNDS) {
            ctx.fillText("x", x * map.tileSize, y * map.tileSize, map.tileSize);
          }
        }
        x++;
      }
      y++;
    }
  }

  get_min_max() {
    const { height, width } = this.get_camera_view();
    const center = {
      x: Math.round(width / 2),
      y: Math.round(height / 2),
    };
    const pos = this.ecs.get_components(this.player).get(Position);
    const min = {
      x: pos.x - center.x,
      y: pos.y - center.y,
    };
    const max = {
      x: min.x + width,
      y: min.y + width,
    };
    return { min, max };
  }

  get_camera_view() {
    const pc = this.ecs.get_components(this.player);
    const camera = pc.get(Camera);
    return camera.view();
  }

  render_player_view() {
    const { ecs, ctx, map, player } = this;
    const level = map.currentLevel();
    const pv = ecs.get_components(player).get(Viewshed);

    ecs
      .get_all_components(Actor) // for now, Actors are renderable
      .filter((c) => c.has(Position))
      .map((c) => ({ a: c.get(Actor), pos: c.get(Position) }))
      .filter((p) => pv.visible(level.getIndexFromPoint(p.pos)))
      .forEach((p) => {
        const { a, pos } = p;
        // TODO really we just need to loop over the viewshed coordinates
        const { min } = this.get_min_max();
        const x = pos.x - min.x;
        const y = pos.y - min.y;
        if (level.inBounds(x, y)) {
          ctx.fillText(a.char, x * map.tileSize, y * map.tileSize);
          //this.drawSprite(a.sprite, x, y);
        }
      });
  }

  update() {
    const { ctx } = this;
    const canvas = ctx.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.render_viewport();
    this.render_player_view();
  }
}
