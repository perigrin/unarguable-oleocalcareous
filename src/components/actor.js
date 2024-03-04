import { Component } from '../ecs.js'
import { GetMultiDiceRoll } from '../dice.js'

export class Actor extends Component {
  static StatsRoll = () => {
    // [lowest 2 8d10]/2 + 3
    const rolls = GetMultiDiceRoll(8, 10)
      .sort((a, b) => a < b)
      .slice(0, 2)
      .reduce((a, v) => a + v)
    return Math.round(rolls / 2) + 3
  }

  static stat_names = ['strength', 'endurance', 'agility', 'luck'] // don't need SPECIAL yet

  constructor () {
    super()
    Actor.stat_names.forEach((a) => (this[a] = Actor.StatsRoll()))
  }

  max_health () {
    return this.endurance + this.luck
  }
}

// TODO differentiate stats between Players and Monsters
export class Player extends Actor {
  char = '@'
  sprite = [0, 0]
}

export class Monster extends Actor {
  char = 'm'
  sprite = [1, 1]
} // TODO different monsters



