var columnNames =
   "name                minions power xPower xVP kill disrupt move draw xMinion xActions recycle".split(/\s+/);
var factionTable = [
  ["Robots",                 18,   40,     3,  0,   1,      0,   0,   2,      3,       0,      1],
  ["Zombies",                10,   27,     0,  0,   0,      0,   0,   1,      2,       0,      3],
  ["Pirates",                10,   30,     1,  0,   2,      1,   3,   0,      0,       0,      1],
  ["Aliens",                 10,   28,     0,  2,   1,      2,   1,   0,      1,       0,      1],
  ["Dinosaurs",              10,   34,     3,  0,   2,      0,   0,   0,      0,       0,      0],
  ["Tricksters",             10,   30,     0,  0,   1,      3,   0,   0,      2,       0,      0],
  ["Wizards",                10,   24,     0,  0,   0,      0,   0,   3,      1,       3,      0],
  ["Ninjas",                 10,   30,     0,  0,   3,      1,   1,   0,      1,       0,      0],
  ["Plants",                 10,   28,     1,  0,   1,      2,   0,   2,      2,       0,      0],
  ["Steam Punks",            10,   30,     3,  0,   0,      1,   2,   1,      0,       1,      2],
  ["Ghosts",                 10,   28,     2,  1,   2,      0,   0,   0,      1,       1,      1],
  ["Bear Cavalry",           10,   35,     1,  0,   2,      2,   1,   0,      1,       0,      0],
  ["Elder Things",           10,   37,     1,  0,   2,      2,   0,   0,      0,       1,      1],
  ["Miskatonic University",  10,   30,     2,  0,   1,      1,   0,   1,      2,       2,      0],
  ["Innsmouth",              10,   20,     2,  0,   0,      0,   1,   2,      2,       0,      2],
  ["Cthulhu Cultists",        8,   22,     1,  2,   2,      1,   0,   1,      0,       2,      1],
  ["Demons",                 10,   30,     2,  2,   2,      2,   0,   0,      1,       1,      0],
  ["Nazis",                  10,   30,     2,  0,   2,      0,   3,   1,      1,       0,      0],
  ["Women",                  10,   30,     0,  0,   1,      1,   2,   3,      1,       1,      1],
  ["Sea Creatures",          11,   33,     1,  0,   2,      1,   2,   0,      2,       1,      0],
  ["Giants",                  4,   32,     2,  0,   2,      0,   0,   0,      0,       0,      1],
  ["Minimalists",            10,   40,     1,  1,   1,      0,   1,   1,      0,       0,      0],
  ["Celestial Bodies",       10,   37,     0,  0,   1,      2,   3,   1,      0,       0,      1],
  ["Farm Animals",           10,   30,     1,  0,   1,      0,   1,   1,      2,       2,      3],
  ["Pathogens",              10,   10,     3,  0,   2,      0,   1,   2,      3,       0,      1],
  ["Bureacrats",             10,   24,     1,  0,   1,      1,   2,   3,      3,       3,      0],
  ["Porn Stars",             10,   25,     3,  0,   1,      0,   0,   0,      0,       1,      1],
  ["Special Eds",            10,   34,     0,  0,   1,      1,   1,   1,      2,       1,      0],
  ["Christians",             10,   30,     1,  2,   1,      1,   1,   2,      2,       0,      1],
  ["College of Engineering", 10,   30,     1,  0,   1,      1,   1,   1,      1,       2,      2],
];

var factions;
var included;
var chosen;
function reset() {
  factions = factionTable.map(function(row) {
    var faction = {};
    columnNames.forEach(function(columnName, i) {
      faction[columnName] = row[i];
    });
    return faction;
  });
  included = {};
  factions.forEach(function(faction) {
    included[faction.name] = true;
  });
  chosen = {};
}
reset();
loadState();

document.getElementById("generate").addEventListener("click", function() {
  var chooseFrom = factions.filter(function(faction) {
    return included[faction.name] && !chosen[faction.name];
  });
  var faction = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
  document.getElementById("faction").innerHTML = faction.name;
  chosen[faction.name] = true;
  generateList();
});
document.getElementById("start_over").addEventListener("click", function() {
  chosen = {};
  document.getElementById("faction").innerHTML = "?";
  generateList();
});
document.getElementById("reset_everything").addEventListener("click", function() {
  reset();
  document.getElementById("faction").innerHTML = "?";
  saveState();
  generateList();
});

generateList();
function generateList() {
  document.getElementById("faction_list").innerHTML = factions.map(function(faction, i) {
    return '<li>' +
      '<label'+(chosen[faction.name]?' class="chosen"':'')+'>' +
        '<input type="checkbox" id="faction_'+i+'"'+(included[faction.name]?' checked="true"':'')+'>' +
          faction.name +
        '</label>' +
      '<button id="remove_faction_'+i+'">x</button>' +
    '</li>';
  }).join("");
  factions.forEach(function(faction, i) {
    var checkbox = document.getElementById("faction_" + i);
    checkbox.addEventListener("click", function() {
      // wait for the value to change
      setTimeout(function() {
        included[faction.name] = checkbox.checked;
        saveState();
      }, 0);
    });
    document.getElementById("remove_faction_" + i).addEventListener("click", function() {
      factions.splice(i, 1);
      delete included[faction.name];
      generateList();
    });
  });
  saveState();
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
