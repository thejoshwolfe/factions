var factions = [
  "Robots", "Zombies", "Pirates", "Aliens", "Dinosaurs", "Tricksters", "Wizards", "Ninjas",
  "Plants", "Steam Punks", "Ghosts", "Bear Calvary",
  "Elder Things", "Miskatonic University", "Innsmouth", "Cthulhu Cultists",
];
var included = {};
factions.forEach(function(faction) {
  included[faction] = true;
});
var chosen = {};
var originalFactionCount = factions.length;
var playerCount = 1;
var MAX_PLAYER_COUNT = 7;
loadState();

document.getElementById("generate").addEventListener("click", function() {
  var chooseFrom = factions.filter(function(faction) { return included[faction] && !(faction in chosen); });
  if (chooseFrom.length >= playerCount)
  {
    var chosenValues = [];
    var factionTag = document.getElementById("faction");
    var chosenValue = Math.floor(Math.random() * chooseFrom.length);
    var faction = chooseFrom[chosenValue];
    factionTag.innerHTML = faction;
    chosenValues.push(chosenValue);
    chosen[faction] = 1;
    for (var i = playerCount; i > 1; i--) {
      chosenValue = Math.floor(Math.random() * chooseFrom.length);
      while(chosenValues.indexOf(chosenValue) > -1)
      {
        chosenValue = Math.floor(Math.random() * chooseFrom.length);
      }
      chosenValues.push(chosenValue);
      faction = chooseFrom[chosenValue];
      factionTag.innerHTML += ", " + faction;
      chosen[faction] = i;
    };
    generateList();
  }
  else
  {
    document.getElementById("faction").innerHTML = "Not enough factions for the number of players";
  }
});
document.getElementById("start_over").addEventListener("click", function() {
  chosen = {};
  document.getElementById("faction").innerHTML = "?";
  updatePlayerCountLabel(0);
  generateList();
});

generateList();
function generateList() {
  document.getElementById("faction_list").innerHTML = factions.map(function(faction, i) {
    return '<li>' +
      '<label'+((chosen[faction] > 0)?' class="chosen' + chosen[faction] + '"':'')+'>' +
        '<input type="checkbox" id="faction_'+i+'"'+((included[faction])?' checked="true"':'')+'>' +
          faction +
        '</label>' +
      (i >= originalFactionCount ? '<button id="remove_faction_'+i+'">x</button>' : '') +
    '</li>';
  }).join("");
  factions.forEach(function(faction, i) {
    var checkbox = document.getElementById("faction_" + i);
    checkbox.addEventListener("click", function() {
      // wait for the value to change
      setTimeout(function() {
        included[faction] = checkbox.checked;
        saveState();
      }, 0);
    });
    if (i >= originalFactionCount) {
      document.getElementById("remove_faction_" + i).addEventListener("click", function() {
        factions.splice(i, 1);
        delete included[faction];
        generateList();
      });
    }
  });
  saveState();
}

var newFactionTextbox = document.getElementById("new_faction");
newFactionTextbox.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    // Enter
    addNewFaction();
  }
  if (event.keyCode === 27) {
    // Escape
    newFactionTextbox.value = "";
  }
  var flag = false;
  for (x in factions)
  {
    if (factions[x].toLowerCase() === (newFactionTextbox.value + String.fromCharCode(event.keyCode)).toLowerCase())
    {
      flag = true;
      console.log("should disable");
      break;
    }
  };
  document.getElementById("add_new_faction").disabled = flag;
});
document.getElementById("add_new_faction").addEventListener("click", addNewFaction);
function addNewFaction() {
  var text = newFactionTextbox.value.trim();
  if (text !== "" && factions.indexOf(text) === -1) {
    factions.push(text);
    included[text] = true;
    generateList();
    newFactionTextbox.value = "";
  }
  newFactionTextbox.focus();
};

var playerCounter = document.getElementById("number_of_players");
updatePlayerCountLabel(playerCount);

document.getElementById("increment_players").addEventListener("click", function() {
  updatePlayerCountLabel(++playerCount);
});

document.getElementById("decrement_players").addEventListener("click", function() {
  updatePlayerCountLabel(--playerCount);
});

function updatePlayerCountLabel(count)
{
  if (count < 1)
  {
    playerCount = 1;
    playerCounter.innerHTML = playerCount;
  }
  else if (count > MAX_PLAYER_COUNT)
  {
    playerCount = MAX_PLAYER_COUNT;
    playerCounter.innerHTML = playerCount;
  }
  else
  {
    playerCounter.innerHTML = count;
  }
}

function saveState() {
  localStorage.factions = JSON.stringify({
    factions: factions,
    included: included,
  });
}
function loadState() {
  var stateJson = localStorage.factions;
  if (stateJson == null) return;
  var state = JSON.parse(stateJson);
  factions = state.factions;
  included = state.included;
}
