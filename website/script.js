import { initializeChart, updateChart } from "./chart.js";
import { fetchData, fetchCardData, setTimeRange } from "./data.js";
import { fetchNewsArticles } from "./news.js";

document.addEventListener('DOMContentLoaded', function() {
    fetchNewsArticles();
    initializeChart();
    setTimeRange('5y'); // Default to 5 years
    fetchCardData(); // Fetch card data on load
});

document.getElementById('forecastCheckbox').addEventListener('change', function() {
    fetchData(currentStartDate, currentEndDate, new Date(currentEndDate.getTime() + 7 * 24 * 60 * 60 * 1000), '1h');
});

let chart;
export { chart };
let currentStartDate;
export { currentStartDate };
let currentEndDate;
export { currentEndDate };

export { updateChart };




