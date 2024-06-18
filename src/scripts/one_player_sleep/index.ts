import {
  world,
  system
} from "@minecraft/server";

const START_TICK = 100;

let currentTick = 0;

function gameTick() {
  try {
    currentTick++;

    if (currentTick === START_TICK) {
      world.sendMessage("§9One Player Sleep§r Script Loaded!");

      world.gameRules.playersSleepingPercentage = 0;

      world.sendMessage("[@] §9playersSleepingPercentage§r: " + world.gameRules.playersSleepingPercentage);
    }
  } catch (e) {
    console.warn("Tick error: " + e);
  }

  system.run(gameTick);
}

system.run(gameTick);
