import {
  world,
  system
} from "@minecraft/server";

const COLOR = "§9";
const TITLE = "One Player Sleep§r";

const START_TICK = 100;

let currentTick = 0;

function gameTick() {
  try {
    currentTick++;

    if (currentTick === START_TICK) {
      world.sendMessage(`${COLOR}${TITLE} Script Loaded!`);

      world.gameRules.playersSleepingPercentage = 0;

      world.sendMessage(`[@] ${COLOR}playersSleepingPercentage§r: ` + world.gameRules.playersSleepingPercentage);
    }
  } catch (e) {
    console.warn("Tick error: " + e);
  }

  system.run(gameTick);
}

system.run(gameTick);
