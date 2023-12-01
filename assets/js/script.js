const searchBar = document.querySelector("#search-bar");
const searchButton = document.querySelector("#search-button");
var resultsContainer = document.querySelector("#results-container");
var launchCache;
var cached = false;

function searchLaunchCache(launchToSearch) {
    for (var launch of launchCache) {
        if (launch.flight_number == launchToSearch) {
            var result = launch;
            break;
        }
    }

    displayCards(result);
}



function displayCards(data) {
    resultsContainer.innerHTML = null;

    var cardEl = document.createElement('div');
    cardEl.classList.add('card', 'col-mb-3', 'text-white', 'bg-secondary', 'mx-5');
    cardEl.setAttribute('style', 'max-width: 28rem;');
    
    var cardBodyEl = document.createElement('div');
    cardBodyEl.classList.add('card-body');
    
    var h4El = document.createElement('h4');
    h4El.classList.add('card-title');
    h4El.textContent = data.name;
    
    var pEl1 = document.createElement('p');
    pEl1.classList.add('card-text');
    pEl1.textContent = data.flight_number;

    var pEl2 = document.createElement('p');
    pEl2.classList.add('card-text');
    pEl2.textContent = data.date_utc;

    var pEl3 = document.createElement('p');
    pEl3.classList.add('card-text');
    pEl3.textContent = getLaunchPadData(data.launchpad);
    
    var pEl4 = document.createElement('p');
    pEl4.classList.add('card-text');
    // pEl4.textContent = data.;
    
    var pEl5 = document.createElement('p');
    pEl5.classList.add('card-text');
    // pEl5.textContent = data.;
    
    var aEl = document.createElement('a');
    aEl.classList.add('btn', 'btn-primary');
    aEl.textContent = 'Youtube Link';
    aEl.href = data.links.webcast;
    aEl.target = "_blank";
    resultsContainer
        .appendChild(cardEl)
        .appendChild(cardBodyEl)
        .append(h4El, pEl1, pEl2, pEl3, pEl4, pEl5, aEl);
};

function getLaunchPadData(LaunchPadData) {
    fetch("https://api.spacexdata.com/v4/launchpads/" + LaunchPadData)
.then(response => response.json())
.then(json => {
  var launchPadName = json.full_name
  console.log (launchPadName)
  return launchPadName;
})
};

function getLaunchData(launchToSearch) {
    if (!cached) {
        fetch("https://api.spacexdata.com/v4/launches")
            .then(response => response.json())
            .then(json => {
                launchCache = json;
                cached = true;
                searchLaunchCache(launchToSearch);
            })
    } else {
        searchLaunchCache(launchToSearch);
    }
}

searchButton.addEventListener("click", function (event) {
    event.preventDefault();

    var launchToSearch = searchBar.value;
    searchBar.value = null;

    getLaunchData(launchToSearch);
})

var map = L.map('map').setView([51.505, -0.09], 14);

L.tileLayer('https://tile.openstreetmap.org/0/0/0.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);