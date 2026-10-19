import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import redMarker from "leaflet-color-markers/img/marker-icon-2x-red.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const selectedIcon = new L.Icon({
  iconUrl: redMarker,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickToSelect({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

function LocationPicker({ latitude, longitude, onChange }) {
  const [mapReady, setMapReady] = useState(false);

  const selectedPosition = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat, lng];
    }

    return null;
  }, [latitude, longitude]);

  const defaultCenter = selectedPosition || [40.7128, -74.006];
  const mapKey = selectedPosition ? selectedPosition.join(",") : "default-map";

  useEffect(() => {
    setMapReady(true);
  }, []);

  return (
    <div className="location-picker">
      <div className="map-shell map-shell--compact">
        <div className="map-header">
          <div>
            <span className="tag">Pick location</span>
            <h2>Select a point on the map</h2>
          </div>
          <p className="muted">
            Click anywhere on the map to update the issue coordinates.
          </p>
        </div>

        {mapReady ? (
          <MapContainer
            key={mapKey}
            center={defaultCenter}
            zoom={13}
            className="location-map"
            style={{ height: "360px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ResizeMap />
            <ClickToSelect onSelect={onChange} />
            {selectedPosition && (
              <Marker position={selectedPosition} icon={selectedIcon}>
                <Popup>
                  <div className="map-popup">
                    <strong>Selected location</strong>
                    <p>
                      {selectedPosition[0].toFixed(5)},{" "}
                      {selectedPosition[1].toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="map-empty">Loading location picker...</div>
        )}
      </div>
    </div>
  );
}

export default LocationPicker;
