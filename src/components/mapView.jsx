import React, {useEffect, useState} from 'react'
import { getWardInfo, getElevation, getRainfall, getWeatherForecast, getHistoricalWeather } from "../services/apiService";
import { calculateBaseRisk, calculateCurrentRisk, getColor } from "../utils/utilities";


function Bleh({ wardId, onRiskChange }) {
    const [coords, setCoords] = useState(null)
    const [elevation, setElevation] = useState(null)
    const [actualRainfall, setActualRainfall] = useState(null)
    const [simulatedRainfall, setSimulatedRainfall] = useState(0)
    const [forecast, setForecast] = useState([])
    const [historical, setHistorical] = useState([])
    const [baseRisk, setBaseRisk] = useState(null)
    const [currentRisk, setCurrentRisk] = useState(null)
    const [wardInfo, setWardInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

   useEffect(() => {
    const fetchData = async () => {
        if (!wardId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true)

            // Get ward information (includes coordinates and known risk data)
            const wardData = await getWardInfo(wardId)
            setWardInfo(wardData)

            setCoords(wardData.coordinates)

            // Use the coordinates to get elevation, rainfall, forecast and historical data
            const elevationData = await getElevation(wardData.coordinates.lat, wardData.coordinates.lon)
            const rainfallData = await getRainfall(wardData.coordinates.lat, wardData.coordinates.lon)
            const forecastData = await getWeatherForecast(wardData.coordinates.lat, wardData.coordinates.lon)
            const historicalData = await getHistoricalWeather(wardData.coordinates.lat, wardData.coordinates.lon)

            setElevation(elevationData)
            setActualRainfall(rainfallData)
            setForecast(forecastData)
            setHistorical(historicalData)

            // Initially set simulated rainfall to actual rainfall
            setSimulatedRainfall(rainfallData)

            console.log('Ward Info:', wardData);
            console.log('Elevation:', elevationData);
            console.log('Rainfall:', rainfallData);
        } catch (err) {
            setError(err.message)
            console.error('API Error:', err)
        } finally {
            setLoading(false)
        }
    }
    fetchData()
   }, [wardId])

   // Calculate risks whenever elevation or simulated rainfall changes
   useEffect(() => {
    if (!elevation || !wardInfo) return;

    let finalBaseRisk, finalCurrentRisk;

    if (simulatedRainfall > 0) {
      // It's raining - check ward vulnerabilities
      if (wardInfo.knownRisk) {
        // Use known risk level for this ward when raining
        finalBaseRisk = wardInfo.knownRisk;
        finalCurrentRisk = wardInfo.knownRisk;
        console.log('Using known risk for ward (raining):', wardInfo.name, wardInfo.knownRisk);
      } else {
        // Calculate risks using utility functions
        const calculatedBaseRisk = calculateBaseRisk(elevation);
        const calculatedCurrentRisk = calculateCurrentRisk(calculatedBaseRisk, simulatedRainfall);
        finalBaseRisk = calculatedBaseRisk;
        finalCurrentRisk = calculatedCurrentRisk;
      }
    } else {
      // No rain - no risk
      finalBaseRisk = 'Safe';
      finalCurrentRisk = 'Safe';
      console.log('No rainfall - ward risk not applicable');
    }

    setBaseRisk(finalBaseRisk);
    setCurrentRisk(finalCurrentRisk);

    // Notify parent component of risk change
    if (onRiskChange) {
      onRiskChange(finalCurrentRisk);
    }
   }, [elevation, simulatedRainfall, wardInfo])

   if (loading) return <div className="p-4">Loading API data...</div>
   if (error) return <div className="p-4 text-red-500">Error: {error}</div>

    return(
        <div className="space-y-4">
            {/* Ward Information Card */}
            {wardInfo && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-200 p-6 rounded-2xl shadow-lg border border-amber-300">
                    <h3 className="font-bold text-xl mb-2 text-amber-900">📍 {wardInfo.name}</h3>
                    {wardInfo.riskNote && (
                        <p className="text-sm text-amber-800">{wardInfo.riskNote}</p>
                    )}
                    {wardInfo.knownRisk && (
                        <div className="mt-3 inline-block bg-amber-600 text-white px-3 py-1 rounded-full">
                            <span className="text-sm font-medium">
                                Risk Level: {wardInfo.knownRisk}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Rainfall Simulation Slider */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-2xl shadow-lg border border-orange-300">
                <h3 className="font-bold text-orange-900 mb-4 text-lg">🌧️ Rainfall Simulation</h3>
                <div className="space-y-3">
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                        <label className="block text-sm font-medium text-orange-800 mb-2">
                            Simulated Rainfall: <span className="font-bold text-orange-900">{simulatedRainfall.toFixed(1)} mm</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={simulatedRainfall}
                            onChange={(e) => setSimulatedRainfall(parseFloat(e.target.value))}
                            className="w-full h-3 bg-orange-300 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-orange-700 mt-2">
                            <span>0mm (No Rain)</span>
                            <span>50mm (Heavy Rain)</span>
                            <span>100mm (Extreme)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Forecast - Limited to 3 days */}
            {forecast.length > 0 && (
                <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-6 rounded-2xl shadow-lg border border-rose-300">
                    <h3 className="font-bold text-rose-900 mb-4 text-lg">📅 3-Day Weather Forecast</h3>
                    <div className="space-y-3">
                        {forecast.slice(0, 9).filter((_, index) => index % 3 === 0).slice(0, 3).map((item, index) => (
                            <div key={index} className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                                <div className="flex justify-between items-center text-rose-900">
                                    <div>
                                        <div className="font-semibold">{item.date}</div>
                                        <div className="text-sm text-rose-700">{item.weather}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">{item.temp}°C</div>
                                        <div className="text-sm text-rose-700">{item.rain}mm rain</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historical Weather */}
            {historical.length > 0 && (
                <div className="bg-gradient-to-r from-red-100 to-pink-100 p-6 rounded-2xl shadow-lg border border-red-300">
                    <h3 className="font-bold text-red-900 mb-4 text-lg">📊 Recent Weather History</h3>
                    <div className="space-y-3">
                        {historical.slice(0, 3).map((day, index) => (
                            <div key={index} className="bg-red-50 p-4 rounded-xl border border-red-200">
                                <div className="flex justify-between items-center text-red-900">
                                    <div className="font-semibold">{day.date}</div>
                                    <div className="text-right">
                                        <div className="font-medium">{day.weather}</div>
                                        <div className="text-sm text-red-700">{day.rain.toFixed(1)}mm rain</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Assessment Section */}
            {baseRisk && currentRisk && (
                <div className="bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 p-8 rounded-3xl shadow-2xl border border-amber-300">
                    <h3 className="text-2xl font-bold mb-6 text-center text-amber-900">⚠️ Waterlogging Risk Assessment</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Base Risk */}
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-300">
                            <h4 className="font-semibold text-lg mb-3 text-center text-amber-900">Base Risk (Elevation)</h4>
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2" style={{ color: getColor(baseRisk) }}>
                                    {baseRisk}
                                </div>
                                <p className="text-sm text-amber-800">
                                    Based on {elevation}m elevation
                                </p>
                            </div>
                        </div>

                        {/* Current Risk */}
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-300">
                            <h4 className="font-semibold text-lg mb-3 text-center text-orange-900">Current Risk (Weather)</h4>
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2" style={{ color: getColor(currentRisk) }}>
                                    {currentRisk}
                                </div>
                                <p className="text-sm text-orange-800">
                                    With {simulatedRainfall.toFixed(1)}mm rainfall
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Risk Interpretation */}
                    <div className="mt-8 bg-rose-50 p-6 rounded-2xl border border-rose-300">
                        <h4 className="font-semibold mb-4 text-center text-rose-900">Risk Interpretation</h4>
                        <div className="text-center">
                            {simulatedRainfall === 0 && currentRisk === 'Safe' ? (
                                <div className="bg-blue-100 p-4 rounded-xl border border-blue-300">
                                    <p className="text-lg text-blue-900">🌤️ <strong>No Current Risk</strong></p>
                                    <p className="text-sm text-blue-800 mt-1">No rainfall detected. Ward vulnerabilities only apply during rain.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {currentRisk === 'Critical' && (
                                        <div className="bg-red-100 p-4 rounded-xl border border-red-300">
                                            <p className="text-lg font-bold text-red-900">🚨 Critical Risk</p>
                                            <p className="text-sm text-red-800">Immediate action required. High chance of waterlogging.</p>
                                        </div>
                                    )}
                                    {currentRisk === 'High' && (
                                        <div className="bg-orange-100 p-4 rounded-xl border border-orange-300">
                                            <p className="text-lg font-bold text-orange-900">⚠️ High Risk</p>
                                            <p className="text-sm text-orange-800">Prepare for potential waterlogging. Monitor weather closely.</p>
                                        </div>
                                    )}
                                    {currentRisk === 'Medium' && (
                                        <div className="bg-yellow-100 p-4 rounded-xl border border-yellow-300">
                                            <p className="text-lg font-bold text-yellow-900">🟡 Medium Risk</p>
                                            <p className="text-sm text-yellow-800">Moderate waterlogging potential. Stay alert.</p>
                                        </div>
                                    )}
                                    {currentRisk === 'Low' && (
                                        <div className="bg-green-100 p-4 rounded-xl border border-green-300">
                                            <p className="text-lg font-bold text-green-900">✅ Low Risk</p>
                                            <p className="text-sm text-green-800">Minimal waterlogging concerns.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bleh
