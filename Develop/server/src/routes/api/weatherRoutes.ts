import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City name is required.' });
  }

  try {
    // Get weather data from city name
    const forecast = await WeatherService.getWeatherForCity(city);

    // Save city to search history
    await HistoryService.addCity(city);

    res.status(200).json(forecast);
  } catch (error) {
    console.error('Error retrieving weather data:', error);
    res.status(500).json({ error: 'Failed to retrieve weather data.' });
  }
  return res.status(500).json({ error: 'Unexpected server error.' });
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error retrieving search history:', error);
    res.status(500).json({ error: 'Failed to retrieve search history.' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'City ID is required.' });
  }

  try {
    await HistoryService.removeCity(id);
    res.status(200).json({ message: 'City deleted from search history.' });
  } catch (error) {
    console.error('Error deleting city from search history:', error);
    res.status(500).json({ error: 'Failed to delete city from search history.' });
  }
  return res.status(500).json({ error: 'Unexpected server error.' });
});

export default router;
