document.addEventListener('DOMContentLoaded', function() {
    fetchNewsArticles();
    initializeChart();
    setTimeRange('month'); // Default to month
});

let chart;
let currentStartDate;
let currentEndDate;

function initializeChart() {
    const ctx = document.getElementById('aioliChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Aioli Price Index (Historic)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Aioli Price Index (Forecast)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Olive Oil Cost (Historic)',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 5                },
                {
                    label: 'Olive Oil Cost (Forecast)',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Eggs Cost (Historic)',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Eggs Cost (Forecast)',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Garlic Cost (Historic)',
                    data: [],
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Garlic Cost (Forecast)',
                    data: [],
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Energy Cost (Historic)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Energy Cost (Forecast)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM dd, yyyy',
                        displayFormats: {
                            day: 'MMM dd, yyyy'
                        },
                        stepSize: 1,
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Price (€)'
                    }
                }
            },
        }
    });
}

function setTimeRange(range) {
    let startDate = new Date();
    let endDate = new Date();
    let forecastEndDate = new Date();

    switch (range) {
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            forecastEndDate.setDate(endDate.getDate() + 7); // 1 week of forecasting
            fetchData(startDate, endDate, forecastEndDate, '1h');
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            forecastEndDate.setMonth(endDate.getMonth() + 3); // 3 months of forecasting
            fetchData(startDate, endDate, forecastEndDate, '6h');
            break;
        case '5y':
            startDate.setFullYear(startDate.getFullYear() - 5);
            forecastEndDate.setMonth(endDate.getMonth() + 6); // 6 months of forecasting
            fetchData(startDate, endDate, forecastEndDate, '1d');
            break;
        case 'max':
            startDate = new Date('2018-01-07');
            forecastEndDate.setMonth(endDate.getMonth() + 6); // 6 months of forecasting
            fetchData(startDate, endDate, forecastEndDate, '1d');
            break;
    }
}

function fetchData(startDate, endDate, forecastEndDate, frequency) {
    currentStartDate = startDate;
    currentEndDate = endDate;

    const historicUrl = `http://localhost:5000/api/historic?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&frequency=${frequency}`;
    const forecastUrl = `http://localhost:5000/api/forecast?end_date=${forecastEndDate.toISOString()}&frequency=${frequency}`;

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

function updateChart(historicData, forecastData) {
    const historicLabels = historicData.map(item => new Date(item.date));
    const forecastLabels = forecastData.map(item => new Date(item.date));

    chart.data.datasets[0].data = historicData.map(item => ({ x: new Date(item.date), y: item.index }));
    chart.data.datasets[2].data = historicData.map(item => ({ x: new Date(item.date), y: item.olive_oil_cost }));
    chart.data.datasets[4].data = historicData.map(item => ({ x: new Date(item.date), y: item.eggs_cost }));
    chart.data.datasets[6].data = historicData.map(item => ({ x: new Date(item.date), y: item.garlic_cost }));
    chart.data.datasets[8].data = historicData.map(item => ({ x: new Date(item.date), y: item.energy_cost }));

    chart.data.datasets[1].data = forecastData.map(item => ({ x: new Date(item.date), y: item.index }));
    chart.data.datasets[3].data = forecastData.map(item => ({ x: new Date(item.date), y: item.olive_oil_cost }));
    chart.data.datasets[5].data = forecastData.map(item => ({ x: new Date(item.date), y: item.eggs_cost }));
    chart.data.datasets[7].data = forecastData.map(item => ({ x: new Date(item.date), y: item.garlic_cost }));
    chart.data.datasets[9].data = forecastData.map(item => ({ x: new Date(item.date), y: item.energy_cost }));

    chart.update('none'); // Update the chart without animation
}

function fetchNewsArticles() {
    const newsSection = document.getElementById('news-articles');
    const articles = [
        {
            title: 'Aioli Prices Soar Amid Olive Oil Shortage',
            content: 'The recent shortage of olive oil has caused a significant increase in aioli prices...'
        },
        {
            title: 'New Garlic Harvest Expected to Stabilize Aioli Prices',
            content: 'Farmers are optimistic about the upcoming garlic harvest, which is expected to stabilize aioli prices...'
        },
        {
            title: 'Energy Costs Impacting Aioli Production',
            content: 'Rising energy costs are having a direct impact on the production costs of aioli...'
        }
    ];

    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('news-article');
        articleDiv.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.content}</p>
        `;
        newsSection.appendChild(articleDiv);
    });
}