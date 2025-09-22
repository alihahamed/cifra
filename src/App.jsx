
import './App.css'
import { useState } from 'react'
import WaterloggingForm from './components/WaterloggingForm'
import MapComponent from './components/MapComponent';
import Bleh from './components/mapView';

function App() {
  const [selectedWard, setSelectedWard] = useState(null);
  const [currentRisk, setCurrentRisk] = useState('Safe');

  const handleWardSubmit = (wardId) => {
    setSelectedWard(wardId);
  };

  const handleWardSelect = (wardId) => {
    setSelectedWard(wardId);
  };

  const handleRiskChange = (risk) => {
    setCurrentRisk(risk);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            Mangalore Waterlogging Risk Monitor
          </h1>
          <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
            Real-time flood risk assessment
          </div>
        </div>
      </header>

      {/* Main Content - Flipped Layout: Dashboard on Bottom */}
      <div className="flex-1 flex flex-col">
        {/* Map Container - Now on Top */}
        <div className="flex-1 relative min-h-0 lg:min-h-[60vh]">
          <MapComponent
            selectedWardId={selectedWard}
            onWardSelect={handleWardSelect}
            currentRisk={currentRisk}
          />
        </div>

        {/* Dashboard - Now on Bottom */}
        <div className="bg-white shadow-lg border-t lg:border-t-0 lg:border-t flex flex-col max-h-96 lg:max-h-none">
          {/* Mobile: Compact header, Desktop: Full header */}
          <div className="lg:hidden p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h2 className="text-lg font-semibold">Risk Assessment Dashboard</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Desktop: Form and Details side by side */}
            <div className="hidden lg:flex">
              <div className="w-1/2 p-6 border-r">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Risk Assessment
                </h2>
                <WaterloggingForm onWardSubmit={handleWardSubmit} />
              </div>
              <div className="w-1/2 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Ward Details
                </h2>
                {selectedWard ? (
                  <Bleh wardId={selectedWard} onRiskChange={handleRiskChange} />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p>Select a ward on the map to view waterlogging risk details.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: Form first, then details */}
            <div className="lg:hidden p-4 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Risk Assessment
                </h2>
                <WaterloggingForm onWardSubmit={handleWardSubmit} />
              </div>

              {selectedWard && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Ward Details
                  </h2>
                  <Bleh wardId={selectedWard} onRiskChange={handleRiskChange} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
