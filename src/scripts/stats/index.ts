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
// const DEBUG = false;

const DEBUG_NUMBER = "0";
// const DEBUG_NUMBER = parseInt(localStorage.getItem("DEBUG_NUMBER") || "0");
// localStorage.setItem("DEBUG_NUMBER", `${DEBUG_NUMBER} + 1`);

const COLOR = "§a";
const COLOR_ERROR = "§c";
const TITLE = "Stats§r";

const START_TICK = 100;

var currentTick = 0;

const SECOND = 20;
const MINUTE = 20 * 60;
const HOUR = MINUTE * 60;
const SIDEBAR_TIMEOUT = SECOND * 30;

const debug = world.scoreboard.getObjective("debug") || world.scoreboard.addObjective("debug");
const ticks = world.scoreboard.getObjective("ticks") || world.scoreboard.addObjective("ticks");
const hours_played = world.scoreboard.getObjective("hours_played") || world.scoreboard.addObjective("hours_played", "Hours Played");
const deaths = world.scoreboard.getObjective("deaths") || world.scoreboard.addObjective("deaths", "Deaths");
const blocks_broken = world.scoreboard.getObjective("blocks_broken") || world.scoreboard.addObjective("blocks_broken", "Blocks Broken");
const blocks_placed = world.scoreboard.getObjective("blocks_placed") || world.scoreboard.addObjective("blocks_placed", "Blocks Placed");
const items_used = world.scoreboard.getObjective("items_used") || world.scoreboard.addObjective("items_used", "Items Used");
const kills = world.scoreboard.getObjective("kills") || world.scoreboard.addObjective("kills", "Kills");
const current_level = world.scoreboard.getObjective("current_level") || world.scoreboard.addObjective("current_level", "Current Level");
const max_level = world.scoreboard.getObjective("max_level") || world.scoreboard.addObjective("max_level", "Max Level");
const pearls_used = world.scoreboard.getObjective("pearls_used") || world.scoreboard.addObjective("pearls_used", "Pearls Used");

const sidebarObjectiveArray = [
  // debug,
  // ticks,
  hours_played,
  deaths,
  blocks_broken,
  blocks_placed,
  // items_used,
  kills,
  current_level,
  max_level,
  pearls_used
];

system.run(gameTick);

world.afterEvents.entityDie.subscribe((event) => {
  try {
    if (event.deadEntity.typeId != 'minecraft:player') {
      const player = event.damageSource.damagingEntity as Player;

      const score = kills.getScore(player) || 0;
      kills.setScore(player, score + 1);

      if (DEBUG) world.sendMessage(`[entityDie] ${player.name} ${COLOR}killed §r${event.deadEntity.typeId}${COLOR}!`);
    } else {
      const player = event.deadEntity as Player;

      const score = deaths.getScore(player) || 0;
      deaths.setScore(player, score + 1);

      if (DEBUG) world.sendMessage(`[entityDie] ${player.name} ${COLOR}died!`);
    }
  } catch (error) {
    world.sendMessage(`${COLOR}[entityDie] ${COLOR_ERROR}Error: §r` + error);
  }
});

world.afterEvents.playerBreakBlock.subscribe((event: PlayerBreakBlockAfterEvent) => {
  try {
    const player = event.player;

    const score = blocks_broken.getScore(player) || 0;
    blocks_broken.setScore(player, score + 1);

    if (DEBUG) world.sendMessage(`[playerBreakBlock] ${player.name} ${COLOR}broke §r${event.brokenBlockPermutation.type.id}`);
  } catch (error) {
    world.sendMessage(`${COLOR}[playerBreakBlock] ${COLOR_ERROR}Error: §r` + error);
  }
});

world.afterEvents.playerPlaceBlock.subscribe((event: PlayerPlaceBlockAfterEvent) => {
  try {
    const player = event.player;

    const score = blocks_placed.getScore(player) || 0;
    blocks_placed.setScore(player, score + 1);

    if (DEBUG) world.sendMessage(`[playerPlaceBlock] ${player.name} ${COLOR}placed §r${event.block.type.id}`);
  } catch (error) {
    world.sendMessage(`${COLOR}[playerPlaceBlock] ${COLOR_ERROR}Error: §r` + error);
  }
});

world.afterEvents.itemUse.subscribe((event) => {
  try {
    const player = event.source;

    const score = items_used.getScore(player) || 0;
    items_used.setScore(player, score + 1);

    if (event.itemStack.type.id === 'minecraft:ender_pearl') {
      const score = pearls_used.getScore(player) || 0;
      pearls_used.setScore(player, score + 1);
    }

    if (DEBUG) world.sendMessage(`[itemUse] ${player.name} ${COLOR}used §r${event.itemStack.type.id}`);

    if (DEBUG) cycleSidebar();
  } catch (error) {
    world.sendMessage(`${COLOR}[itemUse] ${COLOR_ERROR}Error: §r` + error);
  }
});

function gameTick() {
  try {
    currentTick++;

    if (currentTick === START_TICK) {
      world.sendMessage(`${COLOR}${TITLE} Script Loaded!` + (DEBUG ? ` §r§l§b${DEBUG_NUMBER}` : ""));

      if (DEBUG) world.sendMessage(`${COLOR}[gameTick] SIDEBAR_TIMEOUT: §r${SIDEBAR_TIMEOUT}`);
      if (DEBUG) world.sendMessage(`${COLOR}[gameTick] sidebarObjectiveArray: §r(${sidebarObjectiveArray.length}) ${sidebarObjectiveArray.map(obj => obj.displayName).join(', ')}`);

      if (DEBUG) setSidebar(debug);

      debug.setScore('sidebard_length', sidebarObjectiveArray.length);
      debug.setScore('sidebard_index', 0);
    }

    if (currentTick % SIDEBAR_TIMEOUT === 0) cycleSidebar();

    if (DEBUG) world.sendMessage(`${COLOR}[gameTick#0]`);

    incrementTicks();

    if (DEBUG) world.sendMessage(`${COLOR}[gameTick#1]`);

    checkLevelUp();

    if (DEBUG) world.sendMessage(`${COLOR}[gameTick#2]`);
  } catch (error) {
    world.sendMessage(`${COLOR}[gameTick] ${COLOR_ERROR}Error: §r` + error);
  }

  system.run(gameTick);
}

function setSidebar(objective: ScoreboardObjective) {
  try {
    if (DEBUG) world.sendMessage(`${COLOR}[setSidebar] Setting sidebar to §r${objective.displayName}`);

    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
      objective: objective,
    });
  } catch (error) {
    world.sendMessage(`${COLOR}[setSidebar] ${COLOR_ERROR}Error: §r` + error);
  }
}

function incrementTicks() {
  try {
    if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#0]`);

    const players = world.getAllPlayers();

    if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#1]`);

    for (const player of players) {
      if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#2]`);

      const score = ticks.getScore(player) || 0;

      if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#3]`);

      if (score % HOUR === 0) {
        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#4]`);

        const hours = score / HOUR;

        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#5]`);

        hours_played.setScore(player, hours);

        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#6]`);

        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks] ${player.name} has played for §r${hours} ${COLOR}hours!`);

        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#7]`);

        ticks.setScore(player, 1);

        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#8]`);
      } else {
        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#9]`);

        ticks.setScore(player, score + 1);

        if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#10]`);
      }

      if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#11]`);
    }

    if (DEBUG) world.sendMessage(`${COLOR}[incrementTicks#12]`);
  } catch (error) {
    world.sendMessage(`${COLOR}[incrementTicks] ${COLOR_ERROR}Error: §r` + error);
  }
}

function cycleSidebar() {
  try {
    const currentSidebarIndex = ((debug.getScore('sidebard_index') || 0) + 1) % sidebarObjectiveArray.length;

    if (DEBUG) world.sendMessage(`${COLOR}[cycleSidebar] currentSidebarIndex: §r${currentSidebarIndex}`);

    setSidebar(sidebarObjectiveArray[currentSidebarIndex]);
    debug.setScore('sidebard_index', currentSidebarIndex);
  } catch (error) {
    world.sendMessage(`${COLOR}[cycleSidebar] ${COLOR_ERROR}Error: §r` + error);
  }
}

function checkLevelUp() {
  try {
    if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#0]`);

    const players = world.getAllPlayers();

    if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#1]`);

    for (const player of players) {
      if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#2]`);

      const currentLevel = player.level;
      if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#3]`);

      const maxLevel = max_level.getScore(player) || 0;
      if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#4]`);

      if (currentLevel > maxLevel) {
        if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#5]`);

        max_level.setScore(player, currentLevel);

        if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#6]`);

        if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp] ${player.name} has reached level §r${currentLevel}!`);

        if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#7]`);
      }

      if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#8]`);

      current_level.setScore(player, currentLevel);

      if (DEBUG) world.sendMessage(`${COLOR}[checkLevelUp#9]`);
    }
  } catch (error) {
    world.sendMessage(`${COLOR}[checkLevelUp] ${COLOR_ERROR}Error: §r` + error);
  }
}
