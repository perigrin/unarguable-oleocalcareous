import { System } from '../ecs.js'
import { Position, Viewshed } from '../components.js'

import { FOV } from './fov.js'
const fov = new FOV()

export class VisibilitySystem extends System {
  components_required = [Position, Viewshed]

  constructor (g) {
    super(g)
    this.level = g.map.currentLevel()
    this.player = g.player
  }

  static fov (p, r, l) {
    // point range level
    const cells = fov.calcVisibleCellsFrom(
      p, // point
      r, // range
      ({ x, y }) => {
        return l.getTile(x, y)?.obstructed
      } // isTransparent }
    )
    const indexes = [l.getIndexFromPoint(p)]
    for (const p of cells) {
      if (l.inBounds(p.x, p.y)) indexes.push(l.getIndexFromPoint(p))
    }
    return indexes
  }

  update () {
    const { ecs, entities } = this

    entities.forEach((e) => {
      const pos = ecs.get_components(e).get(Position)
      const v = ecs.get_components(e).get(Viewshed)
      if (!v.dirty) return // if no viewshed change, don't update

      const level = this.level
      level.forEachTile((_, t) => {
        t.visible = false
      }) // reset visibility

      v.visible_tiles = VisibilitySystem.fov(
        { x: pos.x, y: pos.y },
        v.range,
        level
      )
      // update what the player can see
      if (e === this.player) {
        v.visible_tiles
          .map((i) => level.tiles[i])
          .forEach((t) => {
            t.visible = true
            t.seen = true
          })
      }
      v.dirty = false
    })
  }
}

