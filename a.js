var factions = [];
var expansionToFactions = {};
var included = {};
var chosen = {};
var originalFactionCount;
(function() {
  var request = new XMLHttpRequest();
  request.onreadystatechange = handleResponse;
  request.open("GET", "../factions.json");
  request.send();

  function handleResponse() {
    if (request.readyState !== 4) return;
    if (request.status !== 200) alert("json request failure: " + request.status);
    var factionsObject = JSON.parse(request.responseText);
    for (var expansionName in factionsObject) {
      expansionToFactions[expansionName] = Object.keys(factionsObject[expansionName]);
      Array.prototype.push.apply(factions, Object.keys(factionsObject[expansionName]));
    }
    factions.forEach(function(faction) {
      included[faction] = true;
    });
    originalFactionCount = factions.length;
    loadState();
    generateList();
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
          (i >= originalFactionCount ? '<button id="remove_faction_'+i+'">x</button>' : '') +
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
