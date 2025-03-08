let chart;

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
          pointHoverRadius: 5,
          legend: { display: false }
        },
        {
          label: 'Olive Oil Cost (Historic)',
          data: [],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: 'Olive Oil Cost (Forecast)',
          data: [],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.1,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 5,
          legend: { display: false }
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
          pointHoverRadius: 5,
          legend: { display: false }
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
          pointHoverRadius: 5,
          legend: { display: false }
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
          pointHoverRadius: 5,
          legend: { display: false }
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'MMM dd, yyyy',
            displayFormats: { day: 'MMM dd, yyyy' },
            stepSize: 1
          },
          title: { display: true, text: 'Date' }
        },
        y: {
          beginAtZero: true,
          min: 0,
          title: {
            display: window.innerWidth > 768,
            text: 'Price (€)'
          },
          ticks: {
            callback: function(value) {
              return window.innerWidth <= 768 && value >= 1000
                ? (value / 1000) + 'k'
                : value;
            }
          }
        }
      },
      plugins: {
        legend: { display: window.innerWidth > 768 }
      }
    }
  });
}

function updateChart(historicData, forecastData) {
  // Update historic datasets
  chart.data.datasets[0].data = historicData.map(item => ({ x: new Date(item.date), y: item.index }));
  chart.data.datasets[2].data = historicData.map(item => ({ x: new Date(item.date), y: item.olive_oil_cost }));
  chart.data.datasets[4].data = historicData.map(item => ({ x: new Date(item.date), y: item.eggs_cost }));
  chart.data.datasets[6].data = historicData.map(item => ({ x: new Date(item.date), y: item.garlic_cost }));
  chart.data.datasets[8].data = historicData.map(item => ({ x: new Date(item.date), y: item.energy_cost }));

  // Update forecast datasets
  chart.data.datasets[1].data = forecastData.map(item => ({ x: new Date(item.date), y: item.index }));
  chart.data.datasets[3].data = forecastData.map(item => ({ x: new Date(item.date), y: item.olive_oil_cost }));
  chart.data.datasets[5].data = forecastData.map(item => ({ x: new Date(item.date), y: item.eggs_cost }));
  chart.data.datasets[7].data = forecastData.map(item => ({ x: new Date(item.date), y: item.garlic_cost }));
  chart.data.datasets[9].data = forecastData.map(item => ({ x: new Date(item.date), y: item.energy_cost }));

  chart.update('none'); // Update without animation
}

function getChart() {
  return chart;
}

export { initializeChart, updateChart, getChart };
