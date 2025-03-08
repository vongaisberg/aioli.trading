import { initializeChart } from './chart.js';
import { setTimeRange as setTimeRangeFunction } from './timeRange.js';
import { fetchData, getCurrentDates } from './fetchData.js';
import { fetchCardData } from './cards.js';
import { fetchNewsArticles } from './news.js';

document.addEventListener('DOMContentLoaded', () => {
  fetchNewsArticles();
  initializeChart();
  setTimeRangeFunction('5y'); // Default to 5 years
  fetchCardData();
});

document.getElementById('forecastCheckbox').addEventListener('change', () => {
  const { currentStartDate, currentEndDate } = getCurrentDates();
  if (currentEndDate) {
    const forecastEndDate = new Date(currentEndDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    fetchData(currentStartDate, currentEndDate, forecastEndDate, '1h');
  }
});

// Attach setTimeRange to the window object
window.setTimeRange = setTimeRangeFunction;
