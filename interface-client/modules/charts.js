const { Chart } = require('chart.js');


const createChart = async (chartName) => {
    const labels = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
    ];

    const data = {
        labels: labels,
        datasets: [{
            label: 'My First dataset',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    };

    const options = {

    };

    const config = {
        type: 'line',
        data: data,
        options: options
    };

    const chartElement = document.getElementById(chartName);
    const chart = new Chart(chartElement, config);

    return { chart };
};

module.exports = { createChart };