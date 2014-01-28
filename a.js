var factions = [
  "Robots", "Zombies", "Pirates", "Aliens", "Dinosaurs", "Tricksters", "Wizards", "Ninjas",
  "Plants", "Steam Punks", "Ghosts", "Bear Calvary",
  "Elder Things", "Miskatonic University", "Innsmouth", "Cthulhu Cultists",
];
var included = factions.map(function() { return true; });
document.getElementById("button").addEventListener("click", function() {
  var indexes = included.map(function(_, i) { return i; }).filter(function(i) { return included[i]; });
  var index = indexes[Math.floor(Math.random() * indexes.length)];
  document.getElementById("faction").innerHTML = factions[index];
});
generateList();
function generateList() {
  document.getElementById("faction_list").innerHTML = factions.map(function(faction, i) {
    return '<li><label><input type="checkbox" id="faction_'+i+'" checked="'+included[i]+'">'+faction+'</label></li>';
  }).join("");
  factions.forEach(function(_, i) {
    var checkbox = document.getElementById("faction_" + i);
    checkbox.addEventListener("click", function() {
      // wait for the value to change
      setTimeout(function() {
        included[i] = checkbox.checked;
        console.log(factions[i] + " is now " + included[i]);
      }, 0);
    });
  });
}
