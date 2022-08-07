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


let baseTime = {
    "rotation-chart": 0,
};

const viewDuration = 10000;

const dataList = {
    "rotation-chart": [[], [], []]
}

/*
for (let i = 0; i < viewDuration; i++) {
    dataList["rotation-chart"].forEach(li => {
       li.push(null);
    });
}
*/

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

    function updateChart() {
        chart.update();
        console.log(dataList);
    }

    function addData(chartName, datasetName, time, data) {
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


        if (time > baseTime[name] + viewDuration) {
            const newBaseTime = Math.floor(time / viewDuration) * viewDuration;

            baseTime[name] = newBaseTime;
            console.log(baseTime[name]);
            dataList[chartName].forEach(d => {
                d.length = 0;
            });

            for (let i = 0; i < viewDuration; i++) {
                labels[i] = newBaseTime + i;
            }
        }

        const dataset = dataList[chartName][datasetIndex];
        dataset[time] = data;
    }

    return { chart, updateChart, addData };
};

module.exports = { createChart };