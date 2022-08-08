const { Chart } = require('chart.js');

const datasetIndexes = {
    "rotation-x": 0,
    "rotation-y": 1,
    "rotation-z": 2,
    "acceleration-x": 0,
    "acceleration-y": 1,
    "acceleration-z": 2,
};

const labels = [];
for (let i = 0; i < 10000; i++)
    labels.push(i);


let baseTime = {
    "rotation-chart": 0,
};

const viewDuration = 10000;

const dataList = {
    "rotation-chart": [[], [], []],
    "acceleration-chart": [[], [], []]
}

const configs = {
    "rotation-chart": {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'x-rotation [degree]',
                backgroundColor: 'rgb(255, 0, 0)',
                data: dataList["rotation-chart"][0],
            },
            {
                label: 'y-rotation [degree]',
                backgroundColor: 'rgb(0, 255, 0)',
                data: dataList["rotation-chart"][1],
            },
            {
                label: 'z-rotation [degree]',
                backgroundColor: 'rgb(0, 0, 255)',
                data: dataList["rotation-chart"][2],
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
                    min: -180,
                    max: 180,
                    ticks: {
                        stepSize: 90
                    }
                },
            },
        }
    },
    "acceleration-chart": {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'x-acceleration [m/s^2]',
                backgroundColor: 'rgb(255, 0, 0)',
                data: dataList["rotation-chart"][0],
            },
            {
                label: 'y-acceleration [m/s^2]',
                backgroundColor: 'rgb(0, 255, 0)',
                data: dataList["rotation-chart"][1],
            },
            {
                label: 'z-acceleration [m/s^2]',
                backgroundColor: 'rgb(0, 0, 255)',
                data: dataList["rotation-chart"][2],
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
                    min: -50,
                    max: 50,
                    ticks: {
                        stepSize: 1000
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

    async function updateChart() {
        chart.update('none');
    }

    async function addData(chartName, datasetName, time, data) {
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


        if (time > baseTime[name] + viewDuration || time < baseTime[name]) {
            const newBaseTime = Math.floor(time / viewDuration) * viewDuration;

            baseTime[name] = newBaseTime;
            dataList[chartName].forEach(d => {
                d.length = 0;
            });

            for (let i = 0; i < viewDuration; i++) {
                labels[i] = newBaseTime + i;
            }

        }

        const dataset = dataList[chartName][datasetIndex];
        dataset[time - baseTime[chartName]] = data;
    }

    return { chart, updateChart, addData };
};

module.exports = { createChart };