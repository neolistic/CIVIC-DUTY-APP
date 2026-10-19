import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import redMarker from "leaflet-color-markers/img/marker-icon-2x-red.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: redMarker,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map view for showing nearby civic issues on a Leaflet map.
// It uses the user's current geolocation and fetches nearby issue markers.
function Map() {
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [mapError, setMapError] = useState("");
  const navigate = useNavigate();

  // Get the user's location and load nearby issue markers from the backend.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLoadingLocation(false);
        },
        () => {
          setMapError(
            "Location access is required to show nearby civic issues on the map.",
          );
          setLoadingLocation(false);
        },
      );
    } else {
      setMapError("Geolocation is not supported in this browser.");
      setLoadingLocation(false);
    }

    const fetchMarkers = async () => {
      try {
        const response = await api.get("/issues/nearby", {
          params: {
            latitude,
            longitude,
          },
        });
        setMarkers(response.data.issues);
      } catch (error) {
        console.error("Error fetching markers:", error);
      }
    };

    if (latitude && longitude) {
      fetchMarkers();
    }
  }, [latitude, longitude]);

  // Open the full issue details page when a map marker is selected.
  const handleMarkerClick = (markerId) => {
    navigate(`/issues/${markerId}`);
  };

  return (
    <>
      {loadingLocation ? (
        <div className="map-empty">Detecting your location...</div>
      ) : mapError ? (
        <div className="map-empty">{mapError}</div>
      ) : latitude && longitude ? (
        <div className="map-shell">
          <div className="map-header">
            <div>
              <span className="tag">Nearby map</span>
              <h2>Issues near your current location</h2>
            </div>
            <div className="map-metrics">
              <div>
                <strong>{markers.length}</strong>
                <span>Nearby issues</span>
              </div>
              <div>
                <strong>500m</strong>
                <span>search radius</span>
              </div>
            </div>
          </div>

          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            style={{ height: "560px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>
                <div className="map-popup">
                  <strong>You are here</strong>
                  <p>Current location used to find nearby reports.</p>
                </div>
              </Popup>
            </Marker>
            {markers.map((marker) => (
              <Marker
                key={marker._id}
                position={marker.location.coordinates.slice().reverse()}
                icon={redIcon}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{marker.title}</strong>
                    <p>{marker.description}</p>
                    <div className="map-popup__meta">
                      <span>{marker.category}</span>
                      <span>{marker.status}</span>
                      <span>
                        {marker.upvotes.length > 0 ? marker.upvotes.length : 0}{" "}
                        upvotes
                      </span>
                    </div>
                    <button
                      className="map-action"
                      onClick={() => handleMarkerClick(marker._id)}
                    >
                      View Issue
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="map-empty">Loading map...</div>
      )}
    </>
  );
}

export default Map;
