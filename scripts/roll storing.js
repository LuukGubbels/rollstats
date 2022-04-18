const blankStats = {};
for (let step = 1; step < 21; step++) {
  blankStats[step] = 0;
};

const statistics = {
	mean: 0,
  n: 0,
  nat20s: 0,
  nat1s: 0,
  MD: 0,
  SD: 0,
  lucky: 0
}

function rolld20() {
  return Math.ceil(Math.random() * 20)
}

function buttonClick() {
  const roll = rolld20();
  console.log("Eli rolls a " + roll);
}

function buttonClick1() {
  const roll = rolld20();
  console.log("The DM rolls a " + roll);
}

class rollStats {
  // Used to keep track of rolls made by actors/players
  constructor() {
    this.actors = [];
    this.rolls = [];
  }
  addActor(Actor) {
    // Add an Actor to the object
    this.actors.push(Actor);
    this.rolls.push(new actorRolls(Actor));
  }
  addRoll(Actor, roll, skill = "untyped") {
    // Add a roll to a certain actor/user or an array of actors/users
    if (!(Array.isArray(Actor))) {
      Actor = [Actor];
    }
    //Loop over all actors/users in the input array
    Actor.forEach(i =>{
      if (!(this.actors.includes(i))) {
      //add actor if not in object
      this.addActor(i);
    }
    	//add roll to actor
			var A = this.rolls.find(actor => actor.name === i);
      A.addActorRoll(roll, skill);
    });
  }
  startSession() {
    // Reset the rolls made in the previous session
    this.rolls.forEach(i => {
      i.resetSession();
    });
  }
  exportToJSON() {
    // Export data to .JSON file
    const filename = 'test.json';
    let data = JSON.stringify(this)
    return data
  }
  importFromJSON(data){
    // import data from .JSON file
    this.actors = data.actors;
    data.rolls.forEach(i => {
      this.rolls.push(new actorRolls(i.name));
      let A = this.rolls.find(actor => actor.name === i.name)
      A.importRollsFromJSON(i);
    });
  }
}

class actorRolls {
  // Used to keep track of the rolls and statistics of one certain actor/player
  // TO DO: add structure for adding skills (Atheletics, Perception etc.)
  constructor(Actor) {
    this.name = Actor;
    this.rolls = {
      session: {...blankStats},
      lifetime: {...blankStats}
    };
    this.stats = {
      session: {...statistics},
      lifetime: {...statistics}
    }
    this.skills = {
      session: {},
      lifetime: {}
    }
  }
  addActorRoll(roll, skill = "untyped") {
    //TODO: add probability of rolling the mean the actor rolled
    //        -> Use Thm1 from https://www.researchgate.net/publication/264907340_Generalized_convolution_of_uniform_distributions
    //        -> Possibly not useful to calculate the exact probability of the mean since this goes to zero for a large number of rolls
    //          -> Possible solution: binning -> Problem: how to explain this to users?
    //        -> Alternative: express how (un)lucky players are by using SD (if MD>2SD -> very (un)lucky for example)

    //Update the session statistics
    this.rolls.session[roll] += 1;
    this.stats.session.n += 1;
    if (!(this.stats.session.n === 0)) {
      this.stats.session.mean = (this.stats.session.mean*(this.stats.session.n-1) + roll)/this.stats.session.n;
      this.stats.session.MD = this.stats.session.mean - 10.5;
    }

    //Update the lifetime statistics
    this.rolls.lifetime[roll] += 1;
    this.stats.lifetime.n += 1;
    if (!(this.stats.lifetime.n === 0)) {
      this.stats.lifetime.mean = (this.stats.lifetime.mean*(this.stats.lifetime.n-1) + roll)/this.stats.lifetime.n;
      this.stats.lifetime.MD = this.stats.lifetime.mean - 10.5;
    }

    //Update skills
    if (Object.keys(this.skills.session).includes(skill)){
      this.skills.session[skill] += 1;
    } else {
      this.skills.session[skill] = 1;
    }

    if (Object.keys(this.skills.lifetime).includes(skill)){
      this.skills.lifetime[skill] += 1;
    } else {
      this.skills.lifetime[skill] = 1;
    }

    //Update nat1s and nat20s
    if (roll === 1) {
      this.stats.session.nat1s += 1;
      this.stats.lifetime.nat1s += 1;
    }
    if (roll === 20) {
      this.stats.session.nat20s += 1;
      this.stats.lifetime.nat20s += 1;
    }
    this.updateSD();

    //Update the lucky statistics
    this.stats.session.lucky = this.updateLucky(this.stats.session.MD, this.stats.session.n);
    this.stats.lifetime.lucky = this.updateLucky(this.stats.lifetime.MD, this.stats.lifetime.n);
  }
  resetSession() {
    // Reset the session variables to default / blanks
    this.rolls.session = {...blankStats};
    this.stats.session = {...statistics};
    this.skills.session = {};
  }
  updateLucky(MD,n) {
    let sigma = Math.sqrt(33.25/n) //Standard deviation for the mean of n uniformly distributed random variables
    if (Math.abs(MD) <= 1*sigma) {
      return "not lucky or unlucky";
    }
    if (MD > 1*sigma && MD <= 2*sigma) {
      return "lucky";
    }
    if (MD > 2*sigma && MD <= 3*sigma) {
      return "very lucky"
    }
    if (MD > 3*sigma) {
      return "extremely lucky"
    }
    if (MD < -1*sigma && MD >= -2*sigma) {
      return "unlucky"
    }
    if (MD < -2*sigma && MD >= -3*sigma) {
      return "very unlucky"
    }
    if (MD < -3*sigma) {
      return "extremely unlucky"
    }
  }
  updateSD(){
    let SDsession = 0;
    let SDlifetime = 0;
    if (this.stats.session.n > 1) {
      for (let i = 1; i < 21; i++) {
        SDsession += this.rolls.session[i]*Math.pow(i-this.stats.session.mean,2);
      }
      SDsession = Math.sqrt(SDsession / (this.stats.session.n-1));
    }
    if (this.stats.lifetime.n > 1) {
      for (let i = 1; i <21; i++) {
        SDlifetime += this.rolls.lifetime[i]*Math.pow(i-this.stats.lifetime.mean,2);
      }
      SDlifetime = Math.sqrt(SDlifetime / (this.stats.lifetime.n-1));
    }

    this.stats.session.SD = SDsession;
    this.stats.lifetime.SD = SDlifetime;
  }
  importRollsFromJSON(data){
    // Import data from a .JSON file
    this.name = data.name;
    this.rolls = data.rolls;
    this.stats = data.stats;
    this.skills = data.skills;
  }
}

let stats = new rollStats();
for(let i=0;i<1000;i++){
    stats.addRoll("Eli", rolld20());
}
console.log(stats.rolls[0])

let json = JSON.stringify(stats, null, 2);
let fs = require('fs').promises;
fs.writeFile('rolls.json', json, 'utf8', (err) => {
  if (err) throw err;
});

/*
TO DO: make it possible to read from file. 
The code below might work, but needs testing in FoundryVTT
-> async functions might not work, sync functions do NOT work
-> need to implement await/resolve in some way
-> fs.readfile(..., 'utf8');
-> JSON.parse(data)

/*
// Code below is used to import data from a JSON file if it exists
//
// let stats = new rollStats;
try { 
  fs.lstatSync('rolls.json').isDirectory();
  // Import .JSON to data
  // let data = fs.readFile(......); <- no idea what to do here
  // data = JSON.parse(data);
  // stats.importFromJSON(data);
} catch {}
*/