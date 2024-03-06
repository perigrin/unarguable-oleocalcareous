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
        aspect-ratio: 16/9;
        align-items: center;
        justify-content: center;
        background-color: black;
        color: white;
    }

    canvas {
        outline: 1px solid black;
      }
`;

class Game extends HTMLElement {
  ecs = new ECS();
  mapwidth = 80;
  mapheight = 45;
  tilesize = 64;
  spritesheet = "/img/doodle_rogue/tiles-64.png";

  static observedAttributes = [
    "mapheight",
    "mapwidth",
    "tilesize",
    "spritesheet",
  ];

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  #initCanvas() {
    const dpr = window.devicePixelRatio;
    this.canvas = document.createElement("canvas");

    const rect = this.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(dpr, dpr);

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.shadow.appendChild(this.canvas);
    //this.ctx.font = this.map.tileSize + "px monospace";
  }

  #initUI() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    this.shadow.adoptedStyleSheets = [sheet];
    this.style.color = window.getComputedStyle(this).color;
    this.style.backgroundColor = window.getComputedStyle(this).backgroundColor;
    this.style.highlightColor = "yellow"; // TODO figure out how to get this in CSS
    this.sprites = new Image();
    this.sprites.src = this.spritesheet;
    this.#initCanvas();
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
      if (this.keymap[key] === undefined) continue;
      player.nextAction = this.keymap[key];
    }
    this.keys = {};
  }

  #initMap() {
    this.map = new GameMap({
      width: this.mapwidth,
      height: this.mapheight,
      tileSize: this.tilesize,
    });
  }

  #init() {
    this.#initUI();
    this.#initMap();
    this.#initPlayer();
    this.#initSystems();
    this.#initKeymap();
    this.#initEventHandlers();
  }

  #updateUI() {
    this.sprites = new Image();
    this.sprites.src = this.spritesheet;
    // TODO figure out how to tell everything our sizes have changed
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log(`changing ${name} to ${newValue} (${oldValue})`);
    this[name] = newValue;
    this.#updateUI();
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
