let map;
let service;
let infowindow;
let directionsService;
let directionsRenderer;
let userMarker;
let currentPos;
let markers = [];

function initMap() {
  const initialLocation = { lat: -25.344, lng: 131.036 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: initialLocation,
  });

  infowindow = new google.maps.InfoWindow();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(currentPos);
        document.getElementById("currentLocationDisplay").innerHTML = `Таны байршил: (${currentPos.lat}, ${currentPos.lng})`;
        if (userMarker) {
          userMarker.setMap(null);
        }
        userMarker = new google.maps.Marker({
          position: currentPos,
          map: map,
          title: "Таны байршил",
        });
      },
      () => {
        handleLocationError(true, infowindow, map.getCenter());
      },
      {
        enableHighAccuracy: true, // Нарийвчлалыг нэмэгдүүлэх
        timeout: 5000, // 5 секунд хүлээх
        maximumAge: 0 // Хуучин байршлыг ашиглахгүй байх
      }
    );
  } else {
    handleLocationError(false, infowindow, map.getCenter());
  }

  document.getElementById('getAtmsBtn').addEventListener('click', () => {
    findPlaces(currentPos, 'atm');
  });

  document.getElementById('getRestaurantsBtn').addEventListener('click', () => {
    findPlaces(currentPos, 'restaurant');
  });

  document.getElementById('getStoresBtn').addEventListener('click', () => {
    findPlaces(currentPos, 'store');
  });

  document.getElementById('getHospitalsBtn').addEventListener('click', () => {
    findPlaces(currentPos, 'hospital');
  });

  document.getElementById('getDirectionsBtn').addEventListener('click', () => {
    const destination = document.getElementById('destinationInput').value;
    if (destination) {
      getDirections(destination);
    }
  });
}

function findPlaces(location, type) {
  if (!location) {
    document.getElementById("errorMessage").innerHTML = "Байршил тодорхойгүй байна.";
    return;
  }

  const request = {
    location: location,
    radius: '500',
    type: [type],
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearMarkers();
      for (let i = 0; i < results.length; i++) {
        const place = results[i];
        createMarker(place);
      }
    } else {
      document.getElementById("errorMessage").innerHTML = `Хайлт амжилтгүй болсон код: ${status}`;
    }
  });
}

function getDirections(destination) {
  if (!currentPos) {
    document.getElementById("errorMessage").innerHTML = "Байршил тодорхойгүй байна.";
    return;
  }

  const request = {
    origin: currentPos,
    destination: destination,
    travelMode: 'DRIVING',
  };
  directionsService.route(request, function (result, status) {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    } else {
      console.error("Directions request failed due to " + status);
      document.getElementById("errorMessage").innerHTML = `Зам олдсонгүй: ${status}`;
    }
  });
}

function getDirectionsToPlace(lat, lng) {
  if (!currentPos) {
    document.getElementById("errorMessage").innerHTML = "Байршил тодорхойгүй байна.";
    return;
  }

  const destination = { lat: lat, lng: lng };
  const request = {
    origin: currentPos,
    destination: destination,
    travelMode: 'DRIVING',
  };
  directionsService.route(request, function (result, status) {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    } else {
      console.error("Directions request to place failed due to " + status);
      document.getElementById("errorMessage").innerHTML = `Зам олдсонгүй: ${status}`;
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? 'Алдаа: Геолокейшн үйлчилгээ ажиллахгүй байна.'
      : "Алдаа: Таны браузер геолокейшнг дэмждэггүй байна."
  );
  infoWindow.open(map);
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });
  markers.push(marker);
  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent(place.name || "");
    infowindow.open(map, marker);
    getDirectionsToPlace(place.geometry.location.lat(), place.geometry.location.lng());
  });
}

function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}
