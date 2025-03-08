import { updateChart } from './chart.js';

let currentStartDate;
let currentEndDate;

function fetchData(startDate, endDate, forecastEndDate, frequency) {
  currentStartDate = startDate;
  currentEndDate = endDate;

  const historicUrl = `/api/historic?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&frequency=${frequency}`;
  const forecastUrl = `/api/forecast?end_date=${forecastEndDate.toISOString()}&frequency=${frequency}`;

  const showForecast = document.getElementById('forecastCheckbox').checked;

  if (showForecast) {
    Promise.all([
      fetch(historicUrl).then(response => response.json()),
      fetch(forecastUrl).then(response => response.json())
    ]).then(([historicData, forecastData]) => {
      updateChart(historicData, forecastData);
    });
  } else {
    fetch(historicUrl)
      .then(response => response.json())
      .then(historicData => {
        updateChart(historicData, []);
      });
  }
}

function getCurrentDates() {
  return { currentStartDate, currentEndDate };
}

export { fetchData, getCurrentDates };
