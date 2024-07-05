// import * as coreBuildTasks from "@minecraft/core-build-tasks"
// import * as math from "@minecraft/math"
import * as server from "@minecraft/server";
// import * as serverUi from "@minecraft/server-ui"
// import * as vanillaData from "@minecraft/vanilla-data"

const DEBUG = true;

const DEBUG_NUMBER = "0";

const COLOR = "§a";
const COLOR_ERROR = "§c";
const TITLE = "Stats§r";

const START_TICK = 100;

var currentTick = 0;

const SECOND = 20;
const MINUTE = 20 * 60;
const HOUR = MINUTE * 60;
const SIDEBAR_TIMEOUT = SECOND * 30;

const debug = server.world.scoreboard.getObjective("debug") || server.world.scoreboard.addObjective("debug", "Debug");
const ticks = server.world.scoreboard.getObjective("ticks") || server.world.scoreboard.addObjective("ticks", "Ticks");
const hours_played = server.world.scoreboard.getObjective("hours_played") || server.world.scoreboard.addObjective("hours_played", "Hours Played");
const deaths = server.world.scoreboard.getObjective("deaths") || server.world.scoreboard.addObjective("deaths", "Deaths");
const blocks_broken = server.world.scoreboard.getObjective("blocks_broken") || server.world.scoreboard.addObjective("blocks_broken", "Blocks Broken");
const blocks_placed = server.world.scoreboard.getObjective("blocks_placed") || server.world.scoreboard.addObjective("blocks_placed", "Blocks Placed");
const items_used = server.world.scoreboard.getObjective("items_used") || server.world.scoreboard.addObjective("items_used", "Items Used");
const kills = server.world.scoreboard.getObjective("kills") || server.world.scoreboard.addObjective("kills", "Kills");
const current_level = server.world.scoreboard.getObjective("current_level") || server.world.scoreboard.addObjective("current_level", "Current Level");
const max_level = server.world.scoreboard.getObjective("max_level") || server.world.scoreboard.addObjective("max_level", "Max Level");
const pearls_used = server.world.scoreboard.getObjective("pearls_used") || server.world.scoreboard.addObjective("pearls_used", "Pearls Used");

const sidebarObjectiveArray = [
  debug,
  ticks,
  hours_played,
  deaths,
  blocks_broken,
  blocks_placed,
  items_used,
  kills,
  current_level,
  max_level,
  pearls_used
];

server.system.run(gameTick);

server.world.afterEvents.entityDie.subscribe((event: server.EntityDieAfterEvent) => {
  try {
    if (event.deadEntity.typeId != 'minecraft:player') {
      const player = event.damageSource.damagingEntity as server.Player;
      if (!player) throw new Error("Player is undefined");

      const playerIdentity = player.scoreboardIdentity;
      if (!playerIdentity) throw new Error("Player identity is undefined");

      const score = kills.getScore(player) || 0;
      kills.setScore(player, score + 1);

      log(`${COLOR}[entityDie] ${player.name} ${COLOR}killed §r${event.deadEntity.typeId}${COLOR}!`);
    } else {
      const player = event.deadEntity as server.Player;
      if (!player) throw new Error("Player is undefined");

      const playerIdentity = player.scoreboardIdentity;
      if (!playerIdentity) throw new Error("Player identity is undefined");

      const score = deaths.getScore(player) || 0;
      deaths.setScore(player, score + 1);

      log(`${COLOR}[entityDie] ${player.name} ${COLOR}died!`);
    }
  } catch (error) {
    log(`${COLOR}[entityDie] ${COLOR_ERROR}Error: §r` + error);
  }
});

server.world.afterEvents.playerBreakBlock.subscribe((event: server.PlayerBreakBlockAfterEvent) => {
  try {
    const player = event.player as server.Player;
    if (!player) throw new Error("Player is undefined");

    const playerIdentity = player.scoreboardIdentity;
    if (!playerIdentity) throw new Error("Player identity is undefined");

    const score = blocks_broken.getScore(player) || 0;
    blocks_broken.setScore(player, score + 1);

    log(`${COLOR}[playerBreakBlock] ${event.player.name} ${COLOR}broke §r${event.brokenBlockPermutation.type.id}`);
  } catch (error) {
    log(`${COLOR}[playerBreakBlock] ${COLOR_ERROR}Error: §r` + error);
  }
});

server.world.afterEvents.playerPlaceBlock.subscribe((event: server.PlayerPlaceBlockAfterEvent) => {
  try {
    const player = event.player as server.Player;
    if (!player) throw new Error("Player is undefined");

    const playerIdentity = player.scoreboardIdentity;
    if (!playerIdentity) throw new Error("Player identity is undefined");

    const score = blocks_placed.getScore(player) || 0;
    blocks_placed.setScore(player, score + 1);

    log(`${COLOR}[playerPlaceBlock] ${player.name} ${COLOR}placed §r${event.block.type.id}`);
  } catch (error) {
    log(`${COLOR}[playerPlaceBlock] ${COLOR_ERROR}Error: §r` + error);
  }
});

server.world.afterEvents.itemUse.subscribe((event: server.ItemUseAfterEvent) => {
  try {
    const player = event.source as server.Player;
    if (!player) throw new Error("Player is undefined");

    const playerIdentity = player.scoreboardIdentity;
    if (!playerIdentity) throw new Error("Player identity is undefined");

    const score = items_used.getScore(player) || 0;
    items_used.setScore(player, score + 1);

    if (event.itemStack.type.id === 'minecraft:ender_pearl') {
      const score = pearls_used.getScore(player) || 0;
      pearls_used.setScore(player, score + 1);
    }

    log(`${COLOR}[itemUse] ${player.name} ${COLOR}used §r${event.itemStack.type.id}`);

    if (DEBUG) cycleSidebar();
  } catch (error) {
    log(`${COLOR}[itemUse] ${COLOR_ERROR}Error: §r` + error);
  }
});

function log(message: string, force = false) {
  if (DEBUG || force) server.world.sendMessage(message);
  console.log(message);
}

function gameTick() {
  try {
    currentTick++;

    if (currentTick === START_TICK) {
      log(`${COLOR}${TITLE} Script Loaded!` + (DEBUG ? ` §r§l§b${DEBUG_NUMBER}` : ""), true);

      log(`${COLOR}[gameTick] SIDEBAR_TIMEOUT: §r${SIDEBAR_TIMEOUT}`);
      log(`${COLOR}[gameTick] sidebarObjectiveArray: §r(${sidebarObjectiveArray.length}) ${sidebarObjectiveArray.map(obj => obj.displayName).join(', ')}`);

      if (DEBUG) setSidebar(debug);

      debug.setScore('sidebard_length', sidebarObjectiveArray.length);
      debug.setScore('sidebard_index', 0);
    }

    if (currentTick % SIDEBAR_TIMEOUT === 0) cycleSidebar();

    // log(`${COLOR}[gameTick#0]`);

    incrementTicks();

    // log(`${COLOR}[gameTick#1]`);

    checkLevelUp();

    // log(`${COLOR}[gameTick#2]`);
  } catch (error) {
    log(`${COLOR}[gameTick] ${COLOR_ERROR}Error: §r` + error);
  }

  server.system.run(gameTick);
}

function setSidebar(objective: server.ScoreboardObjective) {
  try {
    log(`${COLOR}[setSidebar] Setting sidebar to §r${objective.displayName}`);

    server.world.scoreboard.setObjectiveAtDisplaySlot(server.DisplaySlotId.Sidebar, {
      objective: objective,
    });
  } catch (error) {
    log(`${COLOR}[setSidebar] ${COLOR_ERROR}Error: §r` + error);
  }
}

function incrementTicks() {
  try {
    log(`${COLOR}[incrementTicks#0]`);

    const players = server.world.getAllPlayers();

    log(`${COLOR}[incrementTicks#1]`);

    for (const player of players) {
      log(`${COLOR}[incrementTicks#1a]`);

      if (!player) {
        log(`${COLOR}[incrementTicks] ${COLOR_ERROR}Player not found`);
        continue;
      }

      log(`${COLOR}[incrementTicks#1b]`);

      const playerIdentity = player.scoreboardIdentity;

      log(`${COLOR}[incrementTicks#1c]`);

      if (!playerIdentity) {
        log(`${COLOR}[incrementTicks] ${COLOR_ERROR}Player identity not found`);
        continue;
      }

      log(`${COLOR}[incrementTicks#2]`);

      const score = ticks.getScore(player) || 0;

      log(`${COLOR}[incrementTicks#3]`);

      if (score % HOUR === 0) {
        log(`${COLOR}[incrementTicks#4]`);

        const hours = score / HOUR;

        log(`${COLOR}[incrementTicks#5]`);

        hours_played.setScore(player, hours);

        log(`${COLOR}[incrementTicks#6]`);

        log(`${COLOR}[incrementTicks] ${player.name} has played for §r${hours} ${COLOR}hours!`);

        log(`${COLOR}[incrementTicks#7]`);

        ticks.setScore(player, 1);

        log(`${COLOR}[incrementTicks#8]`);
      } else {
        log(`${COLOR}[incrementTicks#9]`);

        ticks.setScore(player, score + 1);

        log(`${COLOR}[incrementTicks#10]`);
      }

      log(`${COLOR}[incrementTicks#11]`);
    }

    log(`${COLOR}[incrementTicks#12]`);
  } catch (error) {
    log(`${COLOR}[incrementTicks] ${COLOR_ERROR}Error: §r` + error);
  }
}

function cycleSidebar() {
  try {
    const currentSidebarIndex = ((debug.getScore('sidebard_index') || 0) + 1) % sidebarObjectiveArray.length;

    log(`${COLOR}[cycleSidebar] currentSidebarIndex: §r${currentSidebarIndex}`);

    setSidebar(sidebarObjectiveArray[currentSidebarIndex]);
    debug.setScore('sidebard_index', currentSidebarIndex);
  } catch (error) {
    log(`${COLOR}[cycleSidebar] ${COLOR_ERROR}Error: §r` + error);
  }
}

function checkLevelUp() {
  try {
    log(`${COLOR}[checkLevelUp#0]`);

    const players = server.world.getAllPlayers();

    log(`${COLOR}[checkLevelUp#1]`);

    for (const player of players) {
      if (!player) {
        log(`${COLOR}[checkLevelUp] ${COLOR_ERROR}Player not found`);
        continue;
      }

      log(`${COLOR}[checkLevelUp#1a]`);

      const playerIdentity = player.scoreboardIdentity;

      log(`${COLOR}[checkLevelUp#1b]`);

      if (!playerIdentity) {
        log(`${COLOR}[checkLevelUp] ${COLOR_ERROR}Player identity not found`);
        continue;
      }

      log(`${COLOR}[checkLevelUp#2]`);

      const currentLevel = player.level;
      log(`${COLOR}[checkLevelUp#3]`);

      const maxLevel = max_level.getScore(player) || 0;
      log(`${COLOR}[checkLevelUp#4]`);

      if (currentLevel > maxLevel) {
        log(`${COLOR}[checkLevelUp#5]`);

        max_level.setScore(player, currentLevel);

        log(`${COLOR}[checkLevelUp#6]`);

        log(`${COLOR}[checkLevelUp] ${player.name} has reached level §r${currentLevel}!`);

        log(`${COLOR}[checkLevelUp#7]`);
      }

      log(`${COLOR}[checkLevelUp#8]`);

      current_level.setScore(player, currentLevel);

      log(`${COLOR}[checkLevelUp#9]`);
    }
  } catch (error) {
    log(`${COLOR}[checkLevelUp] ${COLOR_ERROR}Error: §r` + error);
  }
}
