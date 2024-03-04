import { System } from '../ecs.js'
import { Actor, Player, Monster, Position, Health } from '../components.js'

// system of death and rebirth
export class SamsaraSystem extends System {
  components_required = [Health, Actor, Position]

  update () {
    const { ecs, entities } = this
    console.log('Checking for death and rebirth')

    entities.forEach((e) => {
      const cs = ecs.get_components(e)
      const h = cs.get(Health)
      const a = cs.get(Actor)
      if (h.current_health <= 0) {
        this.game.log(`${a.char} has died`)
        if (a instanceof Player) {
          this.game.log('Game Over.')
          this.game.stop()
          return
        }
        if (a instanceof Monster) {
          console.log('I should probably spawn another monster')
        } // TODO respawn monster
        const p = cs.get(Position)
        p.unblock() // unblock the position
        ecs.destroy_entity(e)
      }
    })
  }
} // handle death and rebirth
