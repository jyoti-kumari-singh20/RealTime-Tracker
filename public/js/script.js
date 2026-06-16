const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    },
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const markers = {};
const users = {};
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  users[id] = {
    latitude,
    longitude,
  };
  Object.keys(users).forEach((otherId) => {
    if (otherId !== id) {
      const distance = getDistance(
        latitude,
        longitude,
        users[otherId].latitude,
        users[otherId].longitude,
      );

      console.log(
        `Distance from ${id} to ${otherId}: ${distance.toFixed(2)} km`,
      );
    }
  });
  if (!window.mapInitialized) {
    map.setView([latitude, longitude], 10);
    window.mapInitialized = true;
  }
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`User ${id}`);
  }
});

socket.on("user-disconnected", (id) => {
  delete users[id];

  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

window.addEventListener("beforeunload", () => {
  socket.disconnect();
});
