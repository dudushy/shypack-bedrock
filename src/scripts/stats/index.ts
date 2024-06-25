import {
  world,
  system,
  DisplaySlotId,
  ScoreboardObjective,
  PlayerBreakBlockAfterEvent,
  PlayerPlaceBlockAfterEvent,
  Player
} from "@minecraft/server";

const DEBUG = true;

const COLOR = "§a";
const TITLE = "Stats§r";

const START_TICK = 100;

var currentTick = 0;

const SECOND = 20;
const MINUTE = 20 * 60;
const HOUR = MINUTE * 60;
const SIDEBAR_TIMEOUT = SECOND * 10;

const debug = world.scoreboard.getObjective("debug") || world.scoreboard.addObjective("debug");
const ticks = world.scoreboard.getObjective("ticks") || world.scoreboard.addObjective("ticks");
const hours_played = world.scoreboard.getObjective("hours_played") || world.scoreboard.addObjective("hours_played", "Hours Played");
const deaths = world.scoreboard.getObjective("deaths") || world.scoreboard.addObjective("deaths", "Deaths");
const blocks_broken = world.scoreboard.getObjective("blocks_broken") || world.scoreboard.addObjective("blocks_broken", "Blocks Broken");
const blocks_placed = world.scoreboard.getObjective("blocks_placed") || world.scoreboard.addObjective("blocks_placed", "Blocks Placed");
const items_used = world.scoreboard.getObjective("items_used") || world.scoreboard.addObjective("items_used", "Items Used");

const sidebarObjectiveArray = [
  debug,
  ticks,
  hours_played,
  deaths,
  blocks_broken,
  blocks_placed,
  items_used,
];

system.run(gameTick);

world.afterEvents.entityDie.subscribe((event) => {
  if (event.deadEntity.typeId != 'minecraft:player') return;

  const player = event.deadEntity as Player;

  const score = deaths.getScore(player) || 0;
  deaths.setScore(player, score + 1);

  if (DEBUG) world.sendMessage(`${player.name} ${COLOR}died!`);
});

world.afterEvents.playerBreakBlock.subscribe((event: PlayerBreakBlockAfterEvent) => {
  const player = event.player;

  const score = blocks_broken.getScore(player) || 0;
  blocks_broken.setScore(player, score + 1);

  if (DEBUG) world.sendMessage(`${player.name} ${COLOR}broke §r${event.brokenBlockPermutation.type.id}`);
});

world.afterEvents.playerPlaceBlock.subscribe((event: PlayerPlaceBlockAfterEvent) => {
  const player = event.player;

  const score = blocks_placed.getScore(player) || 0;
  blocks_placed.setScore(player, score + 1);

  if (DEBUG) world.sendMessage(`${player.name} ${COLOR}placed §r${event.block.type.id}`);
});

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;

  const score = items_used.getScore(player) || 0;
  items_used.setScore(player, score + 1);

  if (DEBUG) world.sendMessage(`${player.name} ${COLOR}used §r${event.itemStack.type.id} ${COLOR}| §r${event.itemStack.typeId}`);
});

function gameTick() {
  try {
    currentTick++;

    if (currentTick === START_TICK) {
      world.sendMessage(`${COLOR}${TITLE} Script Loaded!`);

      if (DEBUG) world.sendMessage(`${COLOR}SIDEBAR_TIMEOUT: §r${SIDEBAR_TIMEOUT}`);
      if (DEBUG) world.sendMessage(`${COLOR}sidebarObjectiveArray: §r(${sidebarObjectiveArray.length}) ${sidebarObjectiveArray.map(obj => obj.displayName).join(', ')}`);

      if (DEBUG) setSidebar(debug);

      debug.setScore('sidebard_length', sidebarObjectiveArray.length);
      debug.setScore('sidebard_index', 0);
    }

    cycleSidebar();

    incrementTicks();
  } catch (e) {
    console.warn("Tick error: " + e);
  }

  system.run(gameTick);
}

function setSidebar(objective: ScoreboardObjective) {
  if (DEBUG) world.sendMessage(`${COLOR}Setting sidebar to §r${objective.displayName}`);

  world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
    objective: objective,
  });
}

function incrementTicks() {
  const players = world.getAllPlayers();

  for (const player of players) {
    const score = ticks.getScore(player) || 0;

    if (score % HOUR === 0) {
      const hours = score / HOUR;
      hours_played.setScore(player, hours);

      if (DEBUG) world.sendMessage(`${COLOR}${player.name} has played for §r${hours} ${COLOR}hours!`);

      ticks.setScore(player, 1);
    } else {
      ticks.setScore(player, score + 1);
    }
  }
}

function cycleSidebar() {
  if (currentTick % SIDEBAR_TIMEOUT === 0) {
    const currentSidebarIndex = ((debug.getScore('sidebard_index') || 0) + 1) % sidebarObjectiveArray.length;

    if (DEBUG) world.sendMessage(`${COLOR}currentSidebarIndex: §r${currentSidebarIndex}`);

    setSidebar(sidebarObjectiveArray[currentSidebarIndex]);
    debug.setScore('sidebard_index', currentSidebarIndex);
  }
}
