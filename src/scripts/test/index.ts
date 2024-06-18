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
      test();
    }
  } catch (e) {
    console.warn("Tick error: " + e);
  }

  system.run(gameTick);
}

system.run(gameTick);

function test() {
  world.sendMessage("§6Shypack!!!!");
  world.sendMessage("§dtestingaaaaa");

  world.gameRules.playersSleepingPercentage = 0;
  world.gameRules.keepInventory = false;

  world.sendMessage("§6[@]§r playersSleepingPercentage: " + world.gameRules.playersSleepingPercentage);
  world.sendMessage("§6[@]§r keepInventory: " + world.gameRules.keepInventory);
}
