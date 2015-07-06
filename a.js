var customFactions = [
  {
    name: "Josh's Awesome Factions",
    factions: [
      {name: "Demons"},
      {name: "Giants"},
      {name: "Sea Creatures"},
    ],
  }, {
    name: "Josh's LOLWUT Factions",
    factions: [
      {name: "Bureaucrats"},
      {name: "Celestial Bodies"},
      {name: "College of Engineering"},
      {name: "Minimalists"},
      {name: "Pathogens"},
    ],
  }, {
    name: "Josh Offends Everyone",
    factions: [
      {name: "Christians"},
      {name: "Nazis"},
      {name: "Porn Stars"},
      {name: "Special Eds"},
      {name: "Women"},
    ],
  }, {
    name: "James Blows Your Mind",
    factions: [
      {name: "Red Fortress 2"},
      {name: "Blu Fortress 2"},
      {name: "Pok\u00e9mon"},
      {name: "Cowboys"},
    ],
  },
];

var factions = [];
var shouldShowFactions = false;
var expansionToFactions = {};
var included = {};
var chosen = {};
var resultsHtmlChildren = [];
var colors = [
  "chosen1",
  "chosen2",
  "chosen3",
  "chosen4",
];
var colorIndex = 0;
(function() {
  var request = new XMLHttpRequest();
  request.onreadystatechange = handleResponse;
  request.open("GET", "../factions.json");
  try {request.send();}catch(e){}

  function handleResponse() {
    if (request.readyState !== 4) return;
    if (request.status === 200) {
      loadFactionsObject(JSON.parse(request.responseText));
    } else {
      // failed to load
      if (location.protocol !== "file:") {
        // there's no excuse outside a file: url
        alert("json request failure: " + request.status);
      }
    }
    loadFactionsObject(customFactions);
    loadState();
    generateList();
  }
  function loadFactionsObject(database) {
    database.forEach(function(expansion) {
      var factionList = expansion.factions.map(function(faction) {
        return faction.name;
      });
      expansionToFactions[expansion.name] = factionList;
      Array.prototype.push.apply(factions, factionList);
    });
    factions.forEach(function(faction) {
      included[faction] = true;
    });
  }
})();
function setCurrentChoice(faction) {
  document.getElementById("choiceSpan").textContent = faction;
}
document.getElementById("generate").addEventListener("click", function() {
  var chooseFrom = factions.filter(function(faction) { return included[faction] && !chosen[faction]; });
  var faction = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
  chosen[faction] = colors[colorIndex];
  setCurrentChoice(faction);
  var child = '<li class="' + colors[colorIndex] + '">' + faction + '</li>';
  resultsHtmlChildren.push(child);
  document.getElementById("resultsList").innerHTML = resultsHtmlChildren.join("");
  generateList();
});
document.getElementById("start_over").addEventListener("click", function() {
  chosen = {};
  colorIndex = 0;
  resultsHtmlChildren = [];
  document.getElementById("resultsList").innerHTML = "";
  renderPlayerName();
  setCurrentChoice("?");
  generateList();
});
document.getElementById("change_color").addEventListener("click", function() {
  colorIndex = (colorIndex + 1) % colors.length;
  setCurrentChoice("?");
  renderPlayerName();
});
document.getElementById("showHideFactions").addEventListener("click", function() {
  shouldShowFactions = !shouldShowFactions;
  generateList();
});
document.getElementById("selectAllButton").addEventListener("click", function() {
  factions.forEach(function(faction) {
    included[faction] = true;
  });
  generateList();
});
document.getElementById("unselectAllButton").addEventListener("click", function() {
  included = {};
  generateList();
});

function renderPlayerName() {
  document.getElementById("change_color").className = "bigButton " + colors[colorIndex];
}

function generateList() {
  var i = -1;
  document.getElementById("faction_list").innerHTML = Object.keys(expansionToFactions).map(function(expansionName) {
    var subList = '<ul>' +
      expansionToFactions[expansionName].map(function(faction) {
        i++;
        var class_ = "";
        if (chosen[faction] != null) {
          class_ = ' class="' + chosen[faction] + '"';
        }
        return '<li>' +
          '<label' + class_ + '>' +
            '<input type="checkbox" id="faction_'+i+'"'+(included[faction]?' checked="true"':'')+'>' +
            faction +
          '</label>' +
        '</li>';
      }).join("") +
    '</ul>';
    return '<li>' +
      '<label>' +
        '<input type="checkbox" id="group_'+i+'" data-expansion-name="' + expansionName + '">' +
        expansionName +
      '</label>' +
      subList +
    '</li>';
  }).join("");
  var allFactionsState = null;
  factions.forEach(function(faction, i) {
    var checkbox = document.getElementById("faction_" + i);
    checkbox.addEventListener("click", function() {
      // wait for the value to change
      setTimeout(function() {
        included[faction] = checkbox.checked;
        generateList();
        saveState();
      }, 0);
    });
    var checked = checkbox.checked;
    if (allFactionsState == null) allFactionsState = checked;
    else if (allFactionsState !== checked) allFactionsState = 0.5;
    var groupCheckbox = document.getElementById("group_" + i);
    if (groupCheckbox != null) {
      groupCheckbox.checked = allFactionsState !== false;
      groupCheckbox.indeterminate = allFactionsState === 0.5;
      allFactionsState = null;
      groupCheckbox.addEventListener("click", function() {
        setTimeout(function() {
          var state = groupCheckbox.checked;
          var expansionName = groupCheckbox.getAttribute("data-expansion-name");
          expansionToFactions[expansionName].forEach(function(faction) {
            included[faction] = state;
          });
          generateList();
          saveState();
        }, 0);
      });
    }
  });
  var includedCount = 0;
  factions.forEach(function(faction) {
    if (included[faction]) includedCount += 1;
  });
  document.getElementById("factionFraction").textContent = "Using " + includedCount + "/" + factions.length + " Factions";
  document.getElementById("hideFactionDiv").style.display = shouldShowFactions ? "block" : "none";
  document.getElementById("showHideFactions").value = shouldShowFactions ? "Hide" : "Show";
  saveState();
}

function saveState() {
  localStorage.factions = JSON.stringify({
    factions: factions,
    included: included,
    showFactions: shouldShowFactions,
  });
}
function loadState() {
  var stateJson = localStorage.factions;
  if (stateJson == null) return;
  var state = JSON.parse(stateJson);
  factions = state.factions;
  included = state.included;
  shouldShowFactions = state.showFactions;
}

document.getElementById("resetButton").addEventListener("click", function() {
  delete localStorage.factions;
  location.href = location.href;
});
