const { Chart } = require('chart.js');


const configs = {
    "rotation-chart": {
        type: 'line',
        data: {
            datasets: [{
                label: 'Rotation [degree]',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [],
            }],
            labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
            ]
        },
        options: {
            scales: {
                x: {
                    min: -360,
                    max: 360

                },
                y: {
                    min: -360,
                    max: 360,
                    ticks: {
                        stepSize: 90
                    }
                },
            }
        }
    }
};

const createChart = async (chartName) => {
    const config = configs[chartName];

    const chartElement = document.getElementById(chartName);
    const chart = new Chart(chartElement, config);

    function updateChart() {
        console.log("UPDATE");
        chart.update();
    }

    function addData(setIndex, name, data) {
        config.data.labels.push(name);
        config.data.datasets[setIndex].data.push(data);
    }

    return { chart, updateChart, addData };
};

module.exports = { createChart };