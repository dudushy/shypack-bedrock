import {
  world,
  system,
  DisplaySlotId,
  ScoreboardObjective
} from "@minecraft/server";

const COLOR = "§a";
const TITLE = "Stats§r";

const START_TICK = 100;

let currentTick = 0;

const test = world.scoreboard.getObjective("hours_played") || world.scoreboard.addObjective("hours_played", "Hours Played");

function gameTick() {
  try {
    currentTick++;

    if (currentTick === START_TICK) {
      world.sendMessage(`${COLOR}${TITLE} Script Loaded!`);
      setSidebar(test);
    }

    incrementObjective(test);
  } catch (e) {
    console.warn("Tick error: " + e);
  }

  system.run(gameTick);
}

system.run(gameTick);

function setSidebar(objective: ScoreboardObjective) {
  world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
    objective: objective,
  });
}

function incrementObjective(objective: ScoreboardObjective) {
  const players = world.getAllPlayers();

  for (const player of players) {
    const score = objective.getScore(player) || 0;

    objective.setScore(player, score + 1);
  }
}
