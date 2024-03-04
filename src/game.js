import { MovementAction, Action } from "./actions.js";
import {
  ActionQueue,
  Actor,
  Player,
  Monster,
  Camera,
  Health,
  Position,
  Viewshed,
} from "./components.js";

import { ECS } from "./ecs.js";

import { GameMap } from "./map.js";

import {
  ActionSystem,
  CameraSystem,
  MonsterAISystem,
  SamsaraSystem,
  VisibilitySystem,
} from "./systems.js";

import "./mainloop.js";

const css = `
    :host {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        background-color: black;
        color: white;
    }

    canvas {
        outline: 1px solid black;
        width: 90%;
        aspect-ratio: 16/9;
      }
`;

class Game extends HTMLElement {
  ecs = new ECS();
  map = new GameMap({});

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  #initCanvas() {
    this.canvas = document.createElement("canvas");
    this.shadow.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = this.map.tileSize + "px monospace";
  }

  #initUI() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    this.shadow.adoptedStyleSheets = [sheet];
    this.#initCanvas();
    this.style.color = window.getComputedStyle(this).color;
    this.style.backgroundColor = window.getComputedStyle(this).backgroundColor;
    this.style.highlightColor = "yellow"; // TODO figure out how to get this in CSS
    this.spritesheet = new Image();
    this.spritesheet.src = "/assets/doodle_rogue/tiles-64.png";
  }

  #initSystems() {
    this.ecs.add_system(new ActionSystem(this));
    this.ecs.add_system(new CameraSystem(this));
    this.ecs.add_system(new VisibilitySystem(this));
    this.ecs.add_system(new MonsterAISystem(this));
    this.ecs.add_system(new SamsaraSystem(this));
  }

  #addActor(actor, position) {
    const e = this.ecs.add_entity();
    this.ecs.add_component(e, actor);
    this.ecs.add_component(e, position);
    this.ecs.add_component(e, new Health(actor.max_health()));
    this.ecs.add_component(e, new Viewshed());
    this.ecs.add_component(e, new ActionQueue());
    return e;
  }

  #initPlayer() {
    const level = this.map.currentLevel();
    this.player = this.#addActor(
      new Player(),
      new Position(level.entrance, level),
    );
    this.ecs.add_component(this.player, new Camera(this));
  }

  #initKeymap() {
    const move = (dx, dy) => new MovementAction(this, this.player, dx, dy);
    this.keymap = {
      KeyH: move(-1, 0),
      KeyJ: move(0, 1),
      KeyK: move(0, -1),
      KeyL: move(1, 0),
      ArrowLeft: move(-1, 0),
      ArrowRight: move(1, 0),
      ArrowDown: move(0, 1),
      ArrowUp: move(0, -1),
    };
  }

  #initEventHandlers() {
    this.keys = {};
    window.onkeypress = (e) => (this.keys[e.code] = true);
    //window.onkeyup = (e) => delete this.keys[e.code];
  }

  #processInput() {
    const player = this.ecs.get_components(this.player).get(ActionQueue);
    for (const key in this.keys) {
      console.log({ key });
      if (this.keymap[key] === undefined) continue;
      console.log(this.keymap[key]);
      player.nextAction = this.keymap[key];
    }
    this.keys = {};
  }

  #init() {
    this.#initUI();
    this.#initPlayer();
    this.#initSystems();
    this.#initKeymap();
    this.#initEventHandlers();
  }

  connectedCallback() {
    this.#init();
    const input = () => this.#processInput();
    const update = () => this.ecs.update();

    MainLoop.setBegin(input).setDraw(update).start();
  }

  stop() {
    MainLoop.stop();
  }
}

customElements.define("rl-game", Game);
