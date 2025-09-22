import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polygon, useMap } from 'react-leaflet';
import { getWardInfo, getWardsForCity } from '../services/apiService';
import { getColor } from '../utils/utilities';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on risk level - Larger circles
const createRiskIcon = (risk) => {
  const color = getColor(risk);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color}80;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid ${color};
      box-shadow: 0 6px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      color: white;
      backdrop-filter: blur(2px);
    ">${risk === 'Critical' ? '!' : risk === 'High' ? '▲' : risk === 'Medium' ? '●' : '○'}</div>`,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });
};

// Component to fit map bounds to markers
function FitBounds({ wards }) {
  const map = useMap();

  useEffect(() => {
    if (wards.length > 0) {
      const bounds = L.latLngBounds(
        wards.map(ward => [ward.coordinates.lat, ward.coordinates.lon])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [wards, map]);

  return null;
}

// Component to zoom to selected ward
function ZoomToWard({ selectedWard }) {
  const map = useMap();

  useEffect(() => {
    if (selectedWard && selectedWard.coordinates) {
      // Zoom to the selected ward with animation
      map.flyTo(
        [selectedWard.coordinates.lat, selectedWard.coordinates.lon],
        18, // High zoom level to focus on the ward
        {
          duration: 1.5, // Animation duration in seconds
          easeLinearity: 0.25
        }
      );
    }
  }, [selectedWard, map]);

  return null;
}

function MapComponent({ selectedWardId, onWardSelect, currentRisk }) {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Balmatta center coordinates (initial location)
  const balmattaCenter = [12.871138, 74.846998];

  useEffect(() => {
    const loadWards = async () => {
      try {
        setLoading(true);
        const wardsData = await getWardsForCity('mangalore');
        setWards(wardsData);
      } catch (error) {
        console.error('Failed to load wards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWards();
  }, []);

  useEffect(() => {
    const loadSelectedWard = async () => {
      if (selectedWardId) {
        try {
          const wardData = await getWardInfo(selectedWardId);
          setSelectedWard(wardData);
        } catch (error) {
          console.error('Failed to load ward info:', error);
        }
      } else {
        setSelectedWard(null);
      }
    };

    loadSelectedWard();
  }, [selectedWardId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mangalore wards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={balmattaCenter}
        zoom={15}
        maxBounds={[
          [12.840, 74.800], // Southwest corner
          [12.930, 74.900]  // Northeast corner
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {wards.map(ward => (
          <Marker
            key={ward.id}
            position={[ward.coordinates.lat, ward.coordinates.lon]}
            icon={createRiskIcon(ward.knownRisk)}
            eventHandlers={{
              click: () => onWardSelect && onWardSelect(ward.id),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -20]}
              permanent={false}
              sticky={true}
            >
              <div className="text-center">
                <div className="font-semibold">{ward.name}</div>
                <div className="text-sm" style={{ color: getColor(ward.knownRisk) }}>
                  {ward.knownRisk || 'Low'} Risk
                </div>
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{ward.name}</h3>
                <div className="space-y-1">
                  <p><strong>Risk Level:</strong>
                    <span style={{ color: getColor(ward.knownRisk), fontWeight: 'bold' }}>
                      {' ' + (ward.knownRisk || 'Low')}
                    </span>
                  </p>
                  <p><strong>Coordinates:</strong> {ward.coordinates.lat.toFixed(4)}, {ward.coordinates.lon.toFixed(4)}</p>
                  {ward.riskNote && (
                    <p><strong>Note:</strong> {ward.riskNote}</p>
                  )}
                </div>
                <button
                  onClick={() => onWardSelect && onWardSelect(ward.id)}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}



        <FitBounds wards={wards} />
        <ZoomToWard selectedWard={selectedWard} />
      </MapContainer>

      {/* Compact Dynamic Map Legend */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-xl shadow-lg z-[1000] border border-gray-200">
        <div className="text-center mb-3">
          <div className="text-lg font-bold text-gray-800 mb-1">
            {currentRisk || 'Safe'}
          </div>
          <div className="text-xs text-gray-600">Current Risk Level</div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full border border-gray-300 mb-1" style={{ backgroundColor: getColor('Safe') }}></div>
            <span>Safe</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full border border-gray-300 mb-1" style={{ backgroundColor: getColor('Low') }}></div>
            <span>Low</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full border border-gray-300 mb-1" style={{ backgroundColor: getColor('Medium') }}></div>
            <span>Med</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full border border-gray-300 mb-1" style={{ backgroundColor: getColor('High') }}></div>
            <span>High</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full border border-gray-300 mb-1" style={{ backgroundColor: getColor('Critical') }}></div>
            <span>Crit</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mb-1"></div>
            <span className="text-gray-500">You</span>
          </div>
        </div>
      </div>

      {/* Ward Counter */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <div className="text-sm">
          <strong>{wards.length}</strong> wards loaded
        </div>
      </div>
    </div>
  );
}

export default MapComponent;
