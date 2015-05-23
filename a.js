var factions = [];
var expansionToFactions = {};
var included = {};
var chosen = {};
(function() {
  var request = new XMLHttpRequest();
  request.onreadystatechange = handleResponse;
  request.open("GET", "../factions.json");
  request.send();

  function handleResponse() {
    if (request.readyState !== 4) return;
    if (request.status !== 200) alert("json request failure: " + request.status);
    loadFactionsObject(JSON.parse(request.responseText));
    loadFactionsObject({
      "Josh's Awesome Factions": {
        "Demons": {},
        "Giants": {},
        "Sea Creatures": {}
      },
      "Josh's LOLWUT Factions": {
        "Bureaucrats": {},
        "Celestial Bodies": {},
        "College of Engineering": {},
        "Minimalists": {},
        "Pathogens": {}
      },
      "Josh Offends Everyone": {
        "Christians": {},
        "Nazis": {},
        "Porn Stars": {},
        "Special Eds": {},
        "Women": {}
      },
      "James Blows Your Mind": {
        "Red Fortress 2": {},
        "Blu Fortress 2": {},
        "Pok\u00e9mon": {},
        "Cowboys": {}
      }
    });
    loadState();
    generateList();
  }
  function loadFactionsObject(factionsObject) {
    for (var expansionName in factionsObject) {
      expansionToFactions[expansionName] = Object.keys(factionsObject[expansionName]);
      Array.prototype.push.apply(factions, Object.keys(factionsObject[expansionName]));
    }
    factions.forEach(function(faction) {
      included[faction] = true;
    });
  }
})();

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

function generateList() {
  var i = -1;
  document.getElementById("faction_list").innerHTML = Object.keys(expansionToFactions).map(function(expansionName) {
    var subList = '<ul>' +
      expansionToFactions[expansionName].map(function(faction) {
        i++;
        return '<li>' +
          '<label'+(chosen[faction]?' class="chosen"':'')+'>' +
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
