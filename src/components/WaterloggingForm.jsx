import React, { useState, useEffect } from "react";
import { getWardsForCity } from "../services/apiService";

const WaterloggingForm = ({ onWardSubmit }) => {
  const [city, setCity] = useState("");
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState("");
  const [loadingWards, setLoadingWards] = useState(false);

  // Only Mangalore available (dummy data)
  const cities = [
    { value: "mangalore", label: "Mangalore" }
  ];

  // Load wards when city changes
  useEffect(() => {
    const loadWards = async () => {
      if (city) {
        setLoadingWards(true);
        try {
          const wardsData = await getWardsForCity(city);
          setWards(wardsData);
          setSelectedWard(""); // Reset ward selection
        } catch (error) {
          console.error("Failed to load wards:", error);
          setWards([]);
        } finally {
          setLoadingWards(false);
        }
      } else {
        setWards([]);
        setSelectedWard("");
      }
    };

    loadWards();
  }, [city]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedWard) {
      // Call the parent function with the ward ID
      if (onWardSubmit) {
        onWardSubmit(selectedWard);
      }
      alert(`Checking waterlogging risk for ward: ${wards.find(w => w.id === selectedWard)?.name || selectedWard}`);
      // You can add your API call here later
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* City Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🌆 Select City
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 text-gray-700 font-medium shadow-lg"
            required
          >
            <option value="">Choose a city</option>
            {cities.map(cityOption => (
              <option key={cityOption.value} value={cityOption.value}>
                {cityOption.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ward Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            📍 Select Ward
          </label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-400 text-gray-700 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!city || loadingWards}
            required
          >
            <option value="">
              {loadingWards ? "🔄 Loading wards..." : city ? "Choose a ward" : "Select city first"}
            </option>
            {wards.map(ward => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedWard}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-500 shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          🚀 Check Waterlogging Risk
        </button>
      </form>
    </div>
  );
};

export default WaterloggingForm;
