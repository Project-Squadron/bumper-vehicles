import GameActor from "./GameActor";

class StaticActor extends GameActor {
  constructor(config) {
    super({ ...config, type_of_actor: "passive_static" });
  }

  update() {
    this.display();
  }
}

export default StaticActor;