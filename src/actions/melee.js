//import { Action } from "./main.js";
import { GetMultiDiceRoll } from "../dice.js";
import { Actor, Health } from "../components.js";

export class MeleeAttack {
  constructor(g, e, d) {
    this.game = g;
    this.entity = e;

    this.defender = d;
  }

  #actors() {
    const a = this.game.ecs.get_components(this.entity).get(Actor);
    const d = this.game.ecs.get_components(this.defender).get(Actor);
    return { a, d };
  }

  #check_for_hit() {
    const { a, d } = this.#actors();
    // TODO replace raw agility with derived attack/dodge stats
    return GetMultiDiceRoll(a.agility, 10) > GetMultiDiceRoll(d.agility, 10);
  }

  #calculate_damage() {
    const { a, d } = this.#actors();
    // TODO replace raw strenght with a derived damage roll stat
    return Math.abs(
      GetMultiDiceRoll(a.strength, 10) - GetMultiDiceRoll(d.endurance, 10),
    );
  }

  perform() {
    if (!this.#check_for_hit()) return; // no hit no combat
    const { a, d } = this.#actors();
    const damage = this.#calculate_damage();
    this.game.log(`${a.char} hits ${d.char} for ${damage} points of damage`);
    const h = this.game.ecs.get_components(this.defender).get(Health);
    h.current_health -= damage;
    this.game.log(`${d.char} is at ${h.current_health} health`);
  }
}
