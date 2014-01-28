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
loadState();

document.getElementById("generate").addEventListener("click", function() {
  var chooseFrom = factions.filter(function(faction) { return included[faction] && !chosen[faction]; });
  var faction = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
  document.getElementById("faction").innerHTML = faction;
  chosen[faction] = true;
  generateList();
});
document.getElementById("start_over").addEventListener("click", function() {
  chosen = {};
  document.getElementById("faction").innerHTML = "?";
  generateList();
});

generateList();
function generateList() {
  document.getElementById("faction_list").innerHTML = factions.map(function(faction, i) {
    return '<li>' +
      '<label'+(chosen[faction]?' class="chosen"':'')+'>' +
        '<input type="checkbox" id="faction_'+i+'"'+(included[faction]?' checked="true"':'')+'>' +
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
