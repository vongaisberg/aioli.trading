import { fetchData } from './fetchData.js';
import { getChart } from './chart.js';

function setTimeRange(range) {
  let startDate = new Date();
  let endDate = new Date();
  let forecastEndDate = new Date();
  const chart = getChart();

  switch (range) {
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      forecastEndDate.setDate(endDate.getDate() + 7); // 1 week of forecasting
      chart.options.scales.x.time.displayFormats.day = 'MMM dd';
      fetchData(startDate, endDate, forecastEndDate, '1h');
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      forecastEndDate.setMonth(endDate.getMonth() + 3); // 3 months of forecasting
      chart.options.scales.x.time.displayFormats.day = 'MMM, yy';
      fetchData(startDate, endDate, forecastEndDate, '6h');
      break;
    case '5y':
      startDate.setFullYear(startDate.getFullYear() - 5);
      forecastEndDate.setMonth(endDate.getMonth() + 6); // 6 months of forecasting
      chart.options.scales.x.time.displayFormats.day = 'MMM, yy';
      fetchData(startDate, endDate, forecastEndDate, '1d');
      break;
    case 'max':
      startDate = new Date('2018-01-07');
      forecastEndDate.setMonth(endDate.getMonth() + 6);
      chart.options.scales.x.time.displayFormats.day = 'MMM, yy';
      fetchData(startDate, endDate, forecastEndDate, '1d');
      break;
  }
}

export { setTimeRange };
