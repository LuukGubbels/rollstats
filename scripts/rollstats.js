/* ----- Classes ----- */

class rollStats {
  constructor() {
    this.players = [];
    this.rolls = [];
  }
  addPlayer(Player) {
    this.players.push(Player);
    this.rolls.push(new playerRolls(Player));
  }
  addRoll(Player, roll) {
    if (!(this.players.includes(Player))) {
      // add player if not in object
      this.addPlayer(Player);
    }
    	// add roll to player
			let P = this.rolls.find(player => player.name === Player);
      P.addPlayerRoll(roll)
  }
  startSession() {
    this.rolls.forEach(n => {
      n.resetSession();
    });
  }
}

class playerRolls {
  constructor(Player) {
    this.name = Player;
    this.rolls = {
      session: {...blankStats},
      lifetime: {...blankStats}
    };
    this.stats = {
      session: {...statistics},
      lifetime: {...statistics}
    }
  }
  addPlayerRoll(roll) {
    // Update the session statistics
    this.rolls.session[roll] += 1;
    this.stats.session.N += 1;
    if (this.stats.session.N !== 0) {
      this.stats.session.mean = (this.stats.session.mean*(this.stats.session.N-1) + roll)/this.stats.session.N;
      this.stats.session.SE = this.stats.session.mean - 10.5; // this is for d20s
    }

    // Update the lifetime statistics
    this.rolls.lifetime[roll] += 1;
    this.stats.lifetime.N += 1;
    if (this.stats.lifetime.N !== 0) {
      this.stats.lifetime.mean = (this.stats.lifetime.mean*(this.stats.lifetime.N-1) + roll)/this.stats.lifetime.N;
      this.stats.lifetime.SE = this.stats.lifetime.mean - 10.5; // this is for d20s
    }
    if (roll === 1) {
      this.stats.session.nat1s += 1;
      this.stats.lifetime.nat1s += 1;
    }
    if (roll === 20) {
      this.stats.session.nat20s += 1;
      this.stats.lifetime.nat20s += 1;
    }
  }
  resetSession() {
    this.rolls.session = {...blankStats};
    this.stats.session = {...statistics};
  }
}

/* ----- Functions ----- */

const getSetting = (settingName) => {
  return game.settings.get(MODULE_ID, settingName)};

const getDieResult = (chatMessage) => { 
  let rollType = "unregistered"; // roll is a constant or manual random input (currently not handled)
  if (chatMessage.isDamageRoll) { // check if it is a damage roll (might be stored later)
    rollType = "damage"; 
  } 
  if (chatMessage.roll.dice[0].faces === 20 && chatMessage.roll.dice[0].number === 1) { // check if the die is 1d20
    rollType = "normal";
  }
//TODO: handle rolling with advantage (DnD5e)
  if (rollType !== "unregistered"){
    let rollName = [];
    let user = chatMessage.user.name;
    if (user !== "GM"){ //TODO: Check that this is indeed the user.name for GM
      if (getSetting("track_rolls") === "players" || getSetting("track_rolls") === "both") {
        rollName.push(chatMessage.user.name);
      }
      if (getSetting("track_rolls") === "character" || getSetting("track_rolls") === "both") {
        // Find the correct path for the character/actor name below
        // rollName.push(chatMessage.(actorName))
      }
    } else {
      rollName.push(user);
    };
    let dieRoll = chatMessage.roll.terms[0].results[0].result;
    console.log(rollName, dieRoll, rollType)
    return [rollName, dieRoll, rollType];
  }
};

const checkChatMessage = (chatMessage) => {
  // console.log(chatMessage);
  if (!getSetting("track_rolls") === "none") return;
  if (chatMessage.isRoll){
//TODO: handle rerolls
    let [rollName, dieRoll, rollType] = getDieResult(chatMessage);
    if (rollType === "normal"){
      stats.addRoll(rollName, dieRoll);
      console.log(stats);
    }
  }
};

/* ----- Constants and variables ----- */

const MODULE_ID = "rollstats"

const blankStats = {};
for (let step = 1; step < 21; step++) {
  blankStats[step] = 0;
};

let statistics = {
	mean: 0,
  N: 0,
  nat20s: 0,
  nat1s: 0,
  SE: 0
}

let stats = new rollStats();

/* ----- Settings ----- */

Hooks.on("init", function () {
  game.settings.register(MODULE_ID, "track_rolls", {
    name: "Enable module",
    hint: "Keep track of all new rolls appearing in the chat window",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "none": "No rolls are tracked",
      "players": "Only store rolls for players",
      "characters": "Only store rolls for characters",
      "both": "Store rolls for both players and characters"
    },
    default: "players"
    // onChange: value => {console.log(value)}
  });

  game.settings.register(MODULE_ID, "player_view_stats", {
    name: "Player view",
    hint: "Pick whether players can view everyone's statistics, their own statistics, or none. (GM can always view all statistics)",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "none": "Players can not see any statistics",
      "own": "Players can view their own statistics",
      "all": "Players can see everyone's statistics"
    },
    default: "own",
    // onChange: value => {console.log(value)}
  });
});

/* ----- Hooks ----- */

Hooks.once("setup", function(){
  Hooks.on("preCreateChatMessage", checkChatMessage)
  console.log("rollstats | initialized")
});

