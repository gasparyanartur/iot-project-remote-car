const { Chart } = require('chart.js');

function getCurrentMillis() {
    const date = new Date();
    return date.getMilliseconds();
}

const datasetIndexes = {
    "rotation-x": 0,
    "rotation-y": 1,
    "rotation-z": 2
};

const labels = [];
for (let i = 0; i < 10000; i++)
    labels.push(i);


let updateTime = {
    "rotation-chart": 0,
};

const configs = {
    "rotation-chart": {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'x-rotation [degree]',
                backgroundColor: 'rgb(255, 0, 0)',
                data: [],
            },
            {
                label: 'y-rotation [degree]',
                backgroundColor: 'rgb(0, 255, 0)',
                data: [],
            },
            {
                label: 'z-rotation [degree]',
                backgroundColor: 'rgb(0, 0, 255)',
                data: [],
            }],

        },
        options: {
            responsive: true,
            scales: {
                x: {
                    min: 0,
                    max: 9999,
                    ticks: {
                        stepSize: 100
                    },
                    title: {
                        display: true,
                        text: (ctx) => 'Time [ms]',
                    }
                },
                y: {
                    min: -360,
                    max: 360,
                    ticks: {
                        stepSize: 90
                    }
                },
            },
        }
    }
};

const createChart = async (chartName) => {
    const name = chartName;
    const config = configs[chartName];
    const chartElement = document.getElementById(chartName);
    const chart = new Chart(chartElement, config);

    function updateTime() {
        updateChart[name] = getCurrentMillis();
    }

    function updateChart() {
        chart.update();
        updateTime();
    }

    function addData(chartName, datasetName, data) {
        const conf = configs[chartName];
        if (conf === undefined) {
            console.error(`Could not find chart with name ${chartName}`);
            return null;
        }

        const datasetIndex = datasetIndexes[datasetName];
        if (datasetIndex === undefined) {
            console.log(`Could not find dataset with name ${datasetName}`);
            return null;
        }

        const dataset = configs[chartName].data.datasets[datasetIndex];

        dataset.data.push(data);
    }

    updateTime();
    return { chart, updateChart, addData };
};

module.exports = { createChart };