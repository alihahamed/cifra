import axios from "axios";
const API_KEY = 'b4c99eed8c3cc0eeb79aae9aa6a0dfb6'


// Dummy data for Mangalore wards with accurate coordinates
const dummyWardData = {
  mangalore: [
    {
      id: 'pumpwell',
      name: 'Pumpwell',
      coordinates: { lat: 12.868783950805664, lon: 74.86813354492188 },
      knownRisk: 'Critical',
      riskNote: 'Highest waterlogging risk in Mangalore during rains'
    },
    {
      id: 'kadri',
      name: 'Kadri',
      coordinates: { lat: 12.889729, lon: 74.850142 },
      knownRisk: 'High',
      riskNote: 'Frequent waterlogging issues during heavy rains'
    },
    {
      id: 'balmatta',
      name: 'Balmatta',
      coordinates: { lat: 12.871138, lon: 74.846998 },
      knownRisk: null,
      riskNote: null
    },
    {
      id: 'hampankatte',
      name: 'Hampankatte',
      coordinates: { lat: 12.9172, lon: 74.856 },
      knownRisk: 'Medium',
      riskNote: 'Moderate waterlogging potential'
    },
    {
      id: 'kankanadi',
      name: 'Kankanadi',
      coordinates: { lat: 12.867463, lon: 74.859909 },
      knownRisk: 'Medium',
      riskNote: 'Slightly above moderate waterlogging risk'
    },
    {
      id: 'kulshekar',
      name: 'Kulshekar',
      coordinates: { lat: 12.8851339, lon: 74.878575 },
      knownRisk: null,
      riskNote: null
    }
  ]
};

// Get wards for Mangalore (dummy data)
export const getWardsForCity = async (city) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (city.toLowerCase() === 'mangalore') {
    return dummyWardData.mangalore;
  }

  throw new Error(`No ward data available for city: ${city}`);
};

// Get ward information for a specific ward (dummy data)
export const getWardInfo = async (wardId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find ward in Mangalore data
  const ward = dummyWardData.mangalore.find(w => w.id === wardId);

  if (ward) {
    return ward;
  }

  throw new Error(`Ward not found: ${wardId}`);
};

// Fallback function for general coordinates (OpenStreetMap)
export const getCoordinates = async (location) => {
  const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${location}&format=json`);
  if (res.data.length > 0) {
    return {
        lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon)
     };
  }
  return null;
};

export const getElevation = async  (lat, lon) => {
    const res = await axios.get(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`)
    return res.data.results[0].elevation
    
}

export const getRainfall = async (lat, lon) => {
  const res = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  return res.data.rain ? res.data.rain["1h"] : 0;
};

// Get weather forecast for next 5 days
export const getWeatherForecast = async (lat, lon) => {
  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    // Extract next 5 days forecast, focusing on rain
    const forecast = res.data.list.slice(0, 40); // Next 5 days (8 readings per day)

    return forecast.map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString(),
      time: new Date(item.dt * 1000).toLocaleTimeString(),
      rain: item.rain ? item.rain["3h"] : 0,
      weather: item.weather[0].main,
      temp: item.main.temp
    }));
  } catch (error) {
    console.error('Forecast API error:', error);
    return [];
  }
};

// Get historical weather data (last 5 days)
export const getHistoricalWeather = async (lat, lon) => {
  try {
    // Note: OpenWeatherMap historical API requires paid plan
    // For demo, we'll simulate historical data
    const mockHistorical = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockHistorical.push({
        date: date.toLocaleDateString(),
        rain: Math.random() * 10, // Random rain amount
        weather: Math.random() > 0.7 ? 'Rain' : 'Clear'
      });
    }
    return mockHistorical;
  } catch (error) {
    console.error('Historical weather API error:', error);
    return [];
  }
};
