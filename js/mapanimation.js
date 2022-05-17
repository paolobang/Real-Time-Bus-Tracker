mapboxgl.accessToken = 'pk.eyJ1IjoicGFvbG9iYW5nIiwiYSI6ImNsMzJhaXVmdDFiMnkzam1ocmp1dWVsNmEifQ.EBuZ90AD89Lfg4YgtNV0ug';

let buses = [];
let bus = [];
let markers = [];

const refreshTime = 10000;
const counter = document.getElementById('counter');

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-71.0935323,42.35890128], 
    zoom: 13
});

// Run app 
const run = async () => {
    buses = await getBusLocations();
    buses.forEach((bus, i) => {
      bus.attributes.id = i;
      bus.attributes.coordinates = [bus.attributes.longitude,bus.attributes.latitude]; 
      const item = getMarker(bus.attributes.id);
      // check if marker was created
      if (!item) {
          createMarkers(bus, bus.attributes.id);
          createList(bus, bus.attributes.id);
      } else {
          const marker = Object.values(item)[0];
          updateMarker(marker, bus)
      }
      updateList(bus, bus.attributes.id);   
    });

    setTimeout(run, refreshTime);
    console.log(new Date())
}

// Fetch data
const getBusLocations = async () => {
  const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
  const response = await fetch(url);
  const json     = await response.json();
  return json.data;
}

// Random color generator
const randomColor = () => {
  const getRandom = (scale) => {
      return Math.floor(Math.random() * scale);
  }
  return `rgb(${getRandom(255)},${getRandom(255)},${getRandom(255)})`;
}

// Create Markers on the map
const createMarkers = (bus, id) => {
    const el = document.createElement('div');
    el.className = 'marker';  
    el.id = `marker-${id}`
    el.style.backgroundColor = randomColor();
    el.innerHTML = `<div class='bus-number'>${bus.attributes.label}</div>`;
    const marker = new mapboxgl.Marker(el)
        .setLngLat(bus.attributes.coordinates)
        .addTo(map);
    const item = {
        "marker": marker,
        "id": id, 
        "coordinates": bus.attributes.coordinates
    };
    // Create array of markers
    markers.push(item);

    // Listen to the element and when it is clicked, do three things: Fly to the point, Highlight listing in sidebar (and remove highlight for all other listings
    el.addEventListener('click', (e) => {
          // Fly to the point 
          flyToBus(bus);
          // Highlight listing in sidebar 
          const activeItem = document.getElementsByClassName('active');
              e.stopPropagation();
              if (activeItem[0]) {
              activeItem[0].classList.remove('active');
          }
          const listing = document.getElementById(
              `listing-${bus.attributes.id}`
          );
          listing.classList.add('active');
    });
}

// Create sidebar
const createList = (bus, id) => {
    const listings = document.getElementById('listings');
    const listing = listings.appendChild(document.createElement('div'));
    listing.id = `listing-${id}`;
    listing.className = 'item';
    const link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.id = `link-${id}`;
    link.innerHTML = `Bus Number: ${bus.attributes.label}`;
    const details = listing.appendChild(document.createElement('div'));
    details.id = `details-${id}`
    details.className = 'details'
    details.innerHTML = `Coordinates: ${bus.attributes.coordinates}`;

    link.addEventListener('click', function () {
      const activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');
    });

}
 
// Search an element and check if it exists
const getMarker = (busId) => {
  const result = markers.find( item => item['id'] === busId);
  return result;
}

// Update marker position
const updateMarker = (marker, bus) => {
    marker.setLngLat(bus.attributes.coordinates);

    const el = document.getElementById(`marker-${bus.attributes.id}`)
    if (el != null){
        el.addEventListener( 'click', () => {
          flyToBus(bus);
        });
        
    }
}


// Update sidebar coordinates data 
const updateList = (bus, id) => {
    const detail = document.getElementById(`details-${id}`);
    const link = document.getElementById(`link-${id}`)

    if (detail != null && link != null) {
      detail.innerHTML = `Coordinates: ${bus.attributes.coordinates}`;
          
      link.addEventListener('click', () => {
        flyToBus(bus);
      })
    }
    const d = new Date();
    counter.innerHTML = `Last updated: ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

}

const flyToBus = (currentBus) => {
  map.flyTo({
    center: currentBus.attributes.coordinates,
    zoom: 15
  });
}

run();  
      
    