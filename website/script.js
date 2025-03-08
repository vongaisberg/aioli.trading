const { initializeChart, updateChart } = require("./chart");
const { fetchData, fetchCardData, setTimeRange } = require("./data");
const { fetchNewsArticles } = require("./news");

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
exports.chart = chart;
let currentStartDate;
exports.currentStartDate = currentStartDate;
let currentEndDate;
exports.currentEndDate = currentEndDate;

exports.updateChart = updateChart;




