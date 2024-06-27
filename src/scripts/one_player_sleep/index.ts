import {
  world,
  system
} from "@minecraft/server";

const DEBUG = true;

const COLOR = "§9";
const TITLE = "One Player Sleep§r";

const START_TICK = 100;

var currentTick = 0;

system.run(gameTick);

function gameTick() {
  try {
    currentTick++;

    if (currentTick === START_TICK) {
      world.sendMessage(`${COLOR}${TITLE} Script Loaded!`);

      world.gameRules.playersSleepingPercentage = 0;

      if (DEBUG) world.sendMessage(`${COLOR}playersSleepingPercentage§r: ` + world.gameRules.playersSleepingPercentage);
    }
  } catch (e) {
    world.sendMessage(`${COLOR}Tick error: §r` + e);
  }

  system.run(gameTick);
}
