const { currentStartDate, currentEndDate, updateChart, chart } = require("./script");

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
exports.fetchData = fetchData;function fetchCardData() {
    fetch('/api/cards')
        .then(response => response.json())
        .then(data => {
            document.getElementById('current-index').textContent = `${data.current_index.toFixed(2)} €/ton`;
            document.getElementById('monthly-change-abs').textContent = `${data.monthly_change_abs >= 0 ? '+' : ''}${data.monthly_change_abs.toFixed(2)} €/ton`;
            document.getElementById('monthly-change-rel').textContent = `${data.monthly_change_rel >= 0 ? '+' : ''}${data.monthly_change_rel.toFixed(2)}%`;
            document.getElementById('price-target').textContent = `${data.price_target.toFixed(2)} €/ton`;
        });
}
exports.fetchCardData = fetchCardData;
function setTimeRange(range) {
    let startDate = new Date();
    let endDate = new Date();
    let forecastEndDate = new Date();

    switch (range) {
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            forecastEndDate.setDate(endDate.getDate() + 7); // 1 week of forecasting
            chart.options.scales.x.time.displayFormats.day = 'MMM dd'; // Set x-axis format for month
            fetchData(startDate, endDate, forecastEndDate, '1h');
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            forecastEndDate.setMonth(endDate.getMonth() + 3); // 3 months of forecasting
            chart.options.scales.x.time.displayFormats.day = 'MMM, yy'; // Set x-axis format for other ranges
            fetchData(startDate, endDate, forecastEndDate, '6h');
            break;
        case '5y':
            startDate.setFullYear(startDate.getFullYear() - 5);
            forecastEndDate.setMonth(endDate.getMonth() + 6); // 6 months of forecasting
            chart.options.scales.x.time.displayFormats.day = 'MMM, yy'; // Set x-axis format for other ranges
            fetchData(startDate, endDate, forecastEndDate, '1d');
            break;
        case 'max':
            startDate = new Date('2018-01-07');
            forecastEndDate.setMonth(endDate.getMonth() + 6); // 6 months of forecasting
            chart.options.scales.x.time.displayFormats.day = 'MMM, yy'; // Set x-axis format for other ranges
            fetchData(startDate, endDate, forecastEndDate, '1d');
            break;
    }
}
exports.setTimeRange = setTimeRange;

