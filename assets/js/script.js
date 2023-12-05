// housekeeping
const searchBar = document.querySelector("#search-bar");
const searchButton = document.querySelector("#search-button");
var resultsContainer = document.querySelector("#results-container");
var launchCache;
var cached = false;
var searchHistory = { launch: [] };
var historyDiv = document.querySelector("#history");
// initializing map
var map = L.map("map");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// fuction to display info card to page
function displayCard(data, launchpad, landpad, payload) {
  resultsContainer.innerHTML = null;

  var cardEl = document.createElement("div");
  cardEl.classList.add(
    "card",
    "col-md-3",
    "text-white",
    "bg-secondary",
    "mx-4",
    "my-3"
  );
  cardEl.setAttribute("style", "max-width: 28rem;");

  var cardBodyEl = document.createElement("div");
  cardBodyEl.classList.add("card-body");

  var h4El = document.createElement("h4");
  h4El.classList.add("card-title");
  h4El.textContent = data.name;

  var pEl1 = document.createElement("p");
  pEl1.classList.add("card-text");
  pEl1.textContent = "Flight Number: " + data.flight_number;

  var pEl2 = document.createElement("p");
  pEl2.classList.add("card-text");
  pEl2.textContent = "Launch Date: " + data.date_utc;

  var pEl3 = document.createElement("p");
  pEl3.classList.add("card-text");
  pEl3.textContent = "Launch Pad: " + launchpad.full_name;

  var pEl4 = document.createElement("p");
  pEl4.classList.add("card-text");
  if (landpad) {
    pEl4.textContent = "Landing Pad: " + landpad.full_name;
  } else {
    pEl4.textContent = "Landing Pad: None";
  }

  var pEl5 = document.createElement("p");
  pEl5.classList.add("card-text");
  pEl5.textContent = "Payload: " + payload.type;

  var aEl = document.createElement("a");
  aEl.classList.add("btn", "btn-primary");
  aEl.textContent = "Youtube Link";
  aEl.href = data.links.webcast;
  aEl.target = "_blank";

  resultsContainer
    .appendChild(cardEl)
    .appendChild(cardBodyEl)
    .append(h4El, pEl1, pEl2, pEl3, pEl4, pEl5, aEl);

  map.setView([launchpad.latitude, launchpad.longitude], 14);
  L.marker([launchpad.latitude, launchpad.longitude])
    .addTo(map)
    .bindPopup(launchpad.full_name)
    .openPopup();
  document
    .getElementById("map-container")
    .setAttribute("style", "visibility:visible;");
}

// function to fetch launch & landing pad data from API
function getPadData(result) {
  var launchpad;
  var landpad;
  var payload;

  fetch("https://api.spacexdata.com/v4/launchpads/" + result.launchpad)
    .then((response) => response.json())
    .then((json) => {
      launchpad = json;
    })
    .then(() => {
      fetch("https://api.spacexdata.com/v4/payloads/" + result.payloads[0])
        .then((response) => response.json())
        .then((json) => {
          payload = json;
        })
        .then(() => {
          if (!result.cores[0].landpad)
            return displayCard(result, launchpad, landpad, payload);
          fetch(
            "https://api.spacexdata.com/v4/landpads/" + result.cores[0].landpad
          )
            .then((response) => response.json())
            .then((json) => {
              landpad = json;
              displayCard(result, launchpad, landpad, payload);
            });
        });
    });
}

function searchLaunchCache(launchToSearch) {
  for (var launch of launchCache) {
    if (launch.flight_number == launchToSearch) {
      var result = launch;
      break;
    }
  }

  getPadData(result);
}

// function to fetch flight data from API
function createLaunchCache(launchToSearch) {
  if (!cached) {
    fetch("https://api.spacexdata.com/v4/launches")
      .then((response) => response.json())
      .then((json) => {
        launchCache = json;
        cached = true;
        searchLaunchCache(launchToSearch);
      });
  } else {
    searchLaunchCache(launchToSearch);
  }
}

// function to load local storage
function onLoad() {
  historyDiv.innerHTML = "";
  if (localStorage.getItem("search history")) {
    searchHistory = JSON.parse(localStorage.getItem("search history"));
    for (var i = 0; i < searchHistory.launch.length; i++) {
      var btnText = searchHistory.launch[i];
      var btn = document.createElement("button");
      btn.classList.add(
        "btn",
        "btn-secondary",
        "d-grid",
        "col-10",
        "mx-auto",
        "mt-1"
      );
      btn.textContent = btnText;
      historyDiv.appendChild(btn);
    }
  }
}
onLoad();

historyDiv.addEventListener("click", function (event) {
  event.preventDefault();
  if (event.target.matches(".btn")) {
    var textContent = event.target.textContent;
    createLaunchCache(textContent);
  }
});

// function to set local storage
function addHistory(dataToSave) {
  searchHistory.launch.push(dataToSave);
  localStorage.setItem("search history", JSON.stringify(searchHistory));
}
// click event listener for search button
searchButton.addEventListener("click", function (event) {
  event.preventDefault();

  var launchToSearch = searchBar.value;

  addHistory(searchBar.value);
  // localStorage.setItem("search history", searchBar.value);
  searchBar.value = null;

  createLaunchCache(launchToSearch);
  onLoad();
});
