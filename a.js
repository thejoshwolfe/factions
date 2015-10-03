document.getElementById("resetButton").addEventListener("click", function() {
  delete localStorage.factions;
  location.href = location.href;
});

var exampleJson = '' +
  '[\n' +
  '  {\n' +
  '    "name": "My Own Expansion",\n' +
  '    "factions": [\n' +
  '      {"name": "Faction 1"},\n' +
  '      {"name": "Faction 2"},\n' +
  '      {"name": "Faction 3"}\n' +
  '    ]\n' +
  '  }, {\n' +
  '    "name": "Some Other Expansion",\n' +
  '    "factions": [\n' +
  '      {"name": "Other Faction 1"},\n' +
  '      {"name": "Other Faction 2"},\n' +
  '      {"name": "Other Faction 3"}\n' +
  '    ]\n' +
  '  }\n' +
  ']\n';

var allSets = [];
var expansions = [];
var factions = [];
var shouldShowFactions = false;
var shouldShowCustom = false;
var factionToExpansion = {};
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
  if (loadState()) {
    generateList();
    return;
  }
  var request = new XMLHttpRequest();
  request.onreadystatechange = handleResponse;
  request.open("GET", "factions.json");
  try {request.send();}catch(e){}

  function handleResponse() {
    if (request.readyState !== 4) return;
    if (request.status === 200) {
      var officialExpansions = JSON.parse(request.responseText);

      // delete Munchkin's Monsters and Treasures
      (function() {
        for (var i = 0; i < officialExpansions.length; i++) {
          var expansionObject = officialExpansions[i];
          if (expansionObject.name !== "Smash Up: Munchkin") continue;
          for (var i = 0; i < expansionObject.factions.length; i++) {
            var factionObject = expansionObject.factions[i];
            if (factionObject.name === "Monsters" || factionObject.name === "Treasures") {
              // in-place remove
              expansionObject.factions.splice(i, 1);
              i--;
            }
          }
          return;
        }
        // no smashup munchkin
      })();

      loadSetsObject(officialExpansions);
    } else {
      // failed to load
      if (location.protocol !== "file:") {
        // there's no excuse outside a file: url
        alert("json request failure: " + request.status);
      }
    }
    generateList();
  }
})();
function loadSetsObject(setsObject) {
  Array.prototype.push.apply(allSets, setsObject);
  allSetsChanged();
  saveState();
}
function allSetsChanged() {
  expansions = [];
  factions = [];
  factionToExpansion = {};
  allSets.forEach(function(expansionObject) {
    var expansion = expansionObject.name;
    var anyFactionsHere = false;
    expansionObject.factions.forEach(function(factionObject) {
      var faction = factionObject.name;
      if (factionToExpansion[faction] != null) return; // duplicate
      factionToExpansion[faction] = expansion;
      factions.push(faction);
      anyFactionsHere = true;
    });
    if (anyFactionsHere) expansions.push(expansion);
  });
  included = {};
  factions.forEach(function(faction) {
    included[faction] = true;
  });
}
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

document.getElementById("showHideCustom").addEventListener("click", function() {
  shouldShowCustom = !shouldShowCustom;
  generateList();
});
document.getElementById("customFileInput").addEventListener("change", function() {
  var files = document.getElementById("customFileInput").files;
  var setsObjects = [];
  Array.prototype.slice.call(files).forEach(function(file, i) {
    var fileReader = new FileReader();
    fileReader.onload = onLoad;
    fileReader.readAsText(file);
    function onLoad() {
      try {
        var setsObject = JSON.parse(fileReader.result);
      } catch (e) {
        return alert(e);
      }
      setsObjects[i] = setsObject;
      if (setsObjects.filter(function(x) { return x == null; }).length === 0) done();
    }
  });
  function done() {
    setsObjects.forEach(function(setsObject) {
      loadSetsObject(setsObject);
    });
    generateList();
  }
});
document.getElementById("showExampleButton").addEventListener("click", function() {
  document.getElementById("customPasteInput").value = exampleJson;
});
document.getElementById("submitCustom").addEventListener("click", function() {
  var jsonString = document.getElementById("customPasteInput").value;
  try {
    var jsonObject = JSON.parse(jsonString);
  } catch (e) {
    alert(e);
  }
  loadSetsObject(jsonObject);
  generateList();
});

function renderPlayerName() {
  document.getElementById("change_color").className = "bigButton " + colors[colorIndex];
}

function generateList() {
  var i = -1;
  document.getElementById("faction_list").innerHTML = (function() {
    return allSets.map(function(expansionObject) {
      var subList = '<ul>' +
        expansionObject.factions.map(function(factionObject) {
          var faction = factionObject.name;
          i++;
          var class_ = "";
          if (chosen[faction] != null) {
            class_ = ' class="' + chosen[faction] + '"';
          }
          return '<li>' +
            '<label' + class_ + '>' +
              '<input type="checkbox" id="faction_'+i+'"'+(included[faction]?' checked="true"':'')+'>' +
              sanitizeHtml(faction) +
            '</label>' +
          '</li>';
        }).join("") +
      '</ul>';
      return '<li>' +
        '<label>' +
          '<input type="checkbox" id="group_'+i+'" data-expansion-name="' + sanitizeAttribute(expansionObject.name) + '">' +
          sanitizeHtml(expansionObject.name) +
        '</label>' +
        subList +
      '</li>';
    }).join("");
  })();
  var allFactionsState = null;
  factions.forEach(function(faction, i) {
    var checkbox = document.getElementById("faction_" + i);
    checkbox.addEventListener("click", function() {
      // wait for the value to change
      setTimeout(function() {
        setOrDelete(included, faction, checkbox.checked);
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
          var expansion = (function() {
            for (var i = 0; i < allSets.length; i++) {
              if (allSets[i].name === expansionName) return allSets[i];
            }
            throw null;
          })();
          expansion.factions.forEach(function(factionObject) {
            setOrDelete(included, factionObject.name, state);
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

  document.getElementById("hideCustomDiv").style.display = shouldShowCustom ? "block" : "none";
  document.getElementById("showHideCustom").value = shouldShowCustom ? "Hide" : "Show";
  saveState();
}
function setOrDelete(dict, faction, value) {
  if (value) {
    dict[faction] = true;
  } else {
    delete dict[faction];
  }
}

function sanitizeHtml(text) {
  text = text.replace("&", "&amp;");
  text = text.replace("<", "&gt;");
  return text;
}
function sanitizeAttribute(text) {
  text = text.replace("&", "&amp;");
  text = text.replace('"', "&quot;");
  return text;
}

function saveState() {
  localStorage.factions = JSON.stringify({
    allSets: allSets,
    included: included,
    showFactions: shouldShowFactions,
    showCustom: shouldShowCustom,
  });
}
function loadState() {
  var stateJson = localStorage.factions;
  if (stateJson == null) return false;
  var state = JSON.parse(stateJson);
  allSets = state.allSets;
  allSetsChanged();
  included = state.included;
  shouldShowFactions = state.showFactions;
  shouldShowCustom = state.showCustom;
  return true;
}
