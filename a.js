var columnNames =
   "name                minions power xPower xVP kill disrupt move draw xMinion xActions recycle".split(/\s+/);
var factionTable = [
  ["Aliens",                 10,   28,     0,  2,   1,      2,   1,   0,      1,       0,      1],
  ["Dinosaurs",              10,   34,     3,  0,   2,      0,   0,   0,      0,       0,      0],
  ["Ninjas",                 10,   30,     0,  0,   3,      1,   1,   0,      1,       0,      0],
  ["Pirates",                10,   30,     1,  0,   2,      1,   3,   0,      0,       0,      1],
  ["Robots",                 18,   40,     3,  0,   1,      0,   0,   2,      3,       0,      1],
  ["Tricksters",             10,   30,     0,  0,   1,      3,   0,   0,      2,       0,      0],
  ["Wizards",                10,   24,     0,  0,   0,      0,   0,   3,      1,       3,      0],
  ["Zombies",                10,   27,     0,  0,   0,      0,   0,   1,      2,       0,      3],
  ["Bear Cavalry",           10,   35,     1,  0,   2,      2,   1,   0,      1,       0,      0],
  ["Ghosts",                 10,   28,     2,  1,   2,      0,   0,   0,      1,       1,      1],
  ["Plants",                 10,   28,     1,  0,   1,      2,   0,   2,      2,       0,      0],
  ["Steam Punks",            10,   30,     3,  0,   0,      1,   2,   1,      0,       1,      2],
  ["Cthulhu Cultists",        8,   22,     1,  2,   2,      1,   0,   1,      0,       2,      1],
  ["Elder Things",           10,   37,     1,  0,   2,      2,   0,   0,      0,       1,      1],
  ["Innsmouth",              10,   20,     2,  0,   0,      0,   1,   2,      2,       0,      2],
  ["Miskatonic University",  10,   30,     2,  0,   1,      1,   0,   1,      2,       2,      0],
  ["Bureacrats",             10,   24,     1,  0,   1,      1,   2,   3,      3,       3,      0],
  ["Celestial Bodies",       10,   37,     0,  0,   1,      2,   3,   1,      0,       0,      1],
  ["Christians",             10,   30,     1,  2,   1,      1,   1,   2,      2,       0,      1],
  ["College of Engineering", 10,   30,     1,  0,   1,      1,   1,   1,      1,       2,      2],
  ["Demons",                 10,   30,     2,  2,   2,      2,   0,   0,      1,       1,      0],
  ["Farm Animals",           10,   30,     1,  0,   1,      0,   1,   1,      2,       2,      3],
  ["Giants",                  4,   32,     2,  0,   2,      0,   0,   0,      0,       0,      1],
  ["Minimalists",            10,   40,     1,  1,   1,      0,   1,   1,      0,       0,      0],
  ["Nazis",                  10,   30,     2,  0,   2,      0,   3,   1,      1,       0,      0],
  ["Pathogens",              10,   10,     3,  0,   2,      0,   1,   2,      3,       0,      1],
  ["Porn Stars",             10,   25,     3,  0,   1,      0,   0,   0,      0,       1,      1],
  ["Sea Creatures",          11,   33,     1,  0,   2,      1,   2,   0,      2,       1,      0],
  ["Special Eds",            10,   34,     0,  0,   1,      1,   1,   1,      2,       1,      0],
  ["Women",                  10,   30,     0,  0,   1,      1,   2,   3,      1,       1,      1],
];

var factions;
var sortOrder;
var nextChosenKey;
var nextIgnoredKey;
function reset() {
  // restore deleted factions
  factions = factionTable.map(function(row) {
    var faction = {};
    columnNames.forEach(function(columnName, i) {
      faction[columnName] = row[i];
    });
    return faction;
  });

  // recheck everything
  sortOrder = {};
  factions.forEach(resetDefaultSortKey);
  nextIgnoredKey = factionTable.length;

  startOver();
}
function startOver() {
  // unchoose everything
  factions.forEach(function(faction) {
    if (isChosen(faction)) {
      resetDefaultSortKey(faction);
    }
  });
  nextChosenKey = -1;
}
function resetDefaultSortKey(faction) {
  var nameColumnIndex = columnNames.indexOf("name");
  for (var i = 0; i < factionTable.length; i++) {
    var row = factionTable[i];
    var factionName = row[nameColumnIndex]
    if (factionName !== faction.name) continue;
    sortOrder[factionName] = i;
    break;
  }
}
reset();

// enable the reset button before trying to load the state
document.getElementById("reset_everything").addEventListener("click", function() {
  reset();
  saveState();
  generateList();
});
loadState();

function isChosen(faction) {
  return sortOrder[faction.name] < 0;
}
function isIncluded(faction) {
  var sortKey = sortOrder[faction.name];
  if (sortKey == null) return true; // during reset
  return sortKey < factionTable.length;
}
document.getElementById("generate").addEventListener("click", function() {
  var chooseFrom = factions.filter(function(faction) {
    return isIncluded(faction) && !isChosen(faction);
  });
  if (chooseFrom.length === 0) return;
  var faction = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
  sortOrder[faction.name] = nextChosenKey--;
  generateList();
});
document.getElementById("start_over").addEventListener("click", function() {
  startOver();
  generateList();
});


generateList();
function generateList() {
  factions.sort(function(a, b) {
    return sortOrder[a.name] - sortOrder[b.name];
  });
  document.getElementById("faction_table").innerHTML = '' +
    '<tr>' +
      columnNames.map(function(columnName) {
        var result = '<th>' + columnName + '</th>';
        if (columnName === "name") {
          // delete button
          result += '<th></th>';
        }
        return result;
      }).join("") +
    '</tr>' +
    factions.map(function(faction, i) {
      return '<tr class="'+(
          isChosen(faction)?'chosen':
          !isIncluded(faction)?'ignored':'')+ '">' +
        '<td>' +
          '<label>' +
            '<input type="checkbox" id="faction_'+i+'">' +
            faction.name +
          '</label>' +
        '</td>' +
        '<td><button id="remove_faction_'+i+'">x</button></td>' +
        columnNames.map(function(columnName) {
          if (columnName === "name") return "";
          return '<td class="centered">' + faction[columnName] + '</td>';
        }).join("") +
      '</tr>';
    }).join("");
  factions.forEach(function(faction, i) {
    var checkbox = document.getElementById("faction_" + i);
    if (isIncluded(faction)) {
      checkbox.setAttribute("checked", "true");
    }
    checkbox.addEventListener("click", function() {
      // wait for the value to change
      setTimeout(function() {
        if (checkbox.checked) {
          resetDefaultSortKey(faction);
        } else {
          sortOrder[faction.name] = nextIgnoredKey++;
        }
        saveState();
        generateList();
      }, 0);
    });
    document.getElementById("remove_faction_" + i).addEventListener("click", function() {
      factions.splice(i, 1);
      generateList();
    });
  });
  saveState();
}

function saveState() {
  localStorage.factions2 = JSON.stringify({
    factions: factions,
    sortOrder: sortOrder,
  });
}
function loadState() {
  var stateJson = localStorage.factions2;
  if (stateJson == null) return;
  var state = JSON.parse(stateJson);
  factions = state.factions;
  sortOrder = state.sortOrder;
}
