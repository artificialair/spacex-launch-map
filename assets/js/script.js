const searchBar = document.querySelector("#search-bar");
const searchButton = document.querySelector("#search-button");

var launchCache;
var cached = false;

function searchLaunchCache(launchToSearch) {
    for (var launch of launchCache) {
        if (launch.flight_number == launchToSearch) {
            var result = launch;
            break;
        }
    }

    console.log(JSON.stringify(result))
}

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

searchButton.addEventListener("click", function(event) {
    event.preventDefault();

    var launchToSearch = searchBar.value;
    searchBar.value = null;

    getLaunchData(launchToSearch);
})

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/0/0/0.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);