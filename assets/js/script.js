// housekeeping
const searchBar = document.querySelector("#search-bar");
const searchButton = document.querySelector("#search-button");
var resultsContainer = document.querySelector("#results-container");
var launchCache;
var cached = false;

// fuction to display info card to page
function displayCard(data, launchPadName, landingPadName) {
  resultsContainer.innerHTML = null;

  var cardEl = document.createElement("div");
  cardEl.classList.add(
    "card",
    "col-md-3",
    "text-white",
    "bg-secondary",
    "mx-4"
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
  pEl3.textContent = "Launch Pad: " + launchPadName;

  var pEl4 = document.createElement("p");
  pEl4.classList.add("card-text");
  pEl4.textContent = "Landing Pad: " + landingPadName;

  var pEl5 = document.createElement("p");
  pEl5.classList.add("card-text");
  pEl5.textContent = "Payload: ";

  var aEl = document.createElement("a");
  aEl.classList.add("btn", "btn-primary");
  aEl.textContent = "Youtube Link";
  aEl.href = data.links.webcast;
  aEl.target = "_blank";
  
  resultsContainer
    .appendChild(cardEl)
    .appendChild(cardBodyEl)
    .append(h4El, pEl1, pEl2, pEl3, pEl4, pEl5, aEl);
}

// function to fetch launch & landing pad data from API
function getPadData(result) {
  var launchPadName;
  var landingPadName;

  fetch("https://api.spacexdata.com/v4/launchpads/" + result.launchpad)
    .then((response) => response.json())
    .then((json) => {
      launchPadName = json.full_name;
    })
    .then(() => {
      fetch("https://api.spacexdata.com/v4/landpads/" + result.cores[0].landpad)
        .then((response) => response.json())
        .then((json) => {
          landingPadName = json.full_name;
          displayCard(result, launchPadName, landingPadName);
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

// click event listener for search button
searchButton.addEventListener("click", function (event) {
  event.preventDefault();

  var launchToSearch = searchBar.value;
  searchBar.value = null;

  createLaunchCache(launchToSearch);
});

// displays map to map container from API
var map = L.map("map").setView([51.505, -0.09], 14);

L.tileLayer("https://tile.openstreetmap.org/0/0/0.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
