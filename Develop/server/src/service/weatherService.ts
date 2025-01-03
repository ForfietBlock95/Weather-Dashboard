import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  wind: number;
  humidity: number;
  date: string;

  constructor(city: string, temperature: number, description: string, icon: string, wind: number, humidity: number, date: string) {
    this.city = city;
    this.temperature = temperature;
    this.description = description;
    this.icon = icon;
    this.wind = wind;
    this.humidity = humidity;
    this.date = date;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL = 'https://api.openweathermap.org';
  private apiKey = process.env.OPEN_WEATHER_API_KEY;
  private cityName: string = "";
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    return await response.json();
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData || !locationData.lat || !locationData.lon) {
      throw new Error("Invalid or missing location data");
    }
    const { lat, lon } = locationData;
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `q=${this.cityName}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const geoQuery = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(geoQuery);
    console.log(locationData);
    if (!locationData || locationData.length == 0)
      throw new Error("There is no location data");
    return this.destructureLocationData(locationData[0]);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const response = await fetch(
      `${this.baseURL}/data/2.5/forecast?${weatherQuery}&appid=${this.apiKey}`
    );
    if (!response.ok) throw new Error("Failed to retrieve weather data");
    return response.json();

  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    if (!response || !response.list)
      throw new Error("Unable to parse current weather");
    if (response.list.length === 0) throw new Error("Weather data is empty");

    const firstElement = response.list[0];
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
console.log(formattedDate);
    const weatherData: Weather = {
      city: this.cityName,
      temperature: firstElement.main.temp,
      description: firstElement.weather[0]?.description || "",
      icon: firstElement.weather[0]?.icon || "",
      wind: firstElement.wind.speed,
      humidity: firstElement.main.humidity,
      date: formattedDate,
    };
    return weatherData;
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    let forecastArray: Weather[] = [];

    forecastArray.push(currentWeather);

    const getNextFiveDates = (): string[] => {
      const dates: string[] = [];
      const today = new Date();
      console.log(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      console.log(tomorrow);

      for (let i = 0; i < 5; i++) {
        const date = new Date(tomorrow);
        date.setDate(tomorrow.getDate() + i);
        const formattedDate = date.toLocaleDateString("en-CA"); // yyyy-mm-dd in local time
        dates.push(formattedDate);
      }
      return dates;
    };

    const next5Dates = getNextFiveDates();
    console.log(next5Dates);
    next5Dates.forEach((dateItem) => {
      const firstMatchingElement = weatherData.find(
        (item) => item.dt_txt && item.dt_txt.startsWith(dateItem)
      );
      if (firstMatchingElement) {
        const weather: Weather = {
          city: this.cityName,
          temperature: firstMatchingElement.main.temp,
          description: firstMatchingElement.weather[0]?.description || "",
          icon: firstMatchingElement.weather[0]?.icon || "",
          wind: firstMatchingElement.wind.speed,
          humidity: firstMatchingElement.main.humidity,
          date: dateItem,
        };

        forecastArray.push(weather);
      }
    });
    return forecastArray;
  }
  
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    console.log(coordinates);
    const weatherDataJson = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherDataJson);
    const forecastWeather: any[] = this.buildForecastArray(
      currentWeather,
      weatherDataJson.list
    );
    return forecastWeather;
  }
}

export default new WeatherService();
