const { createChart } = require('./charts.js');

async function main() {

    const uriConnectButton = document.getElementById("uri-connect-button");
    const uriInputField = document.getElementById("uri-input");

    const goForwardButton = document.getElementById("go-forward-button");
    const goBackwardButton = document.getElementById("go-backward-button");
    const rotateRightButton = document.getElementById("rotate-right-button");
    const rotateLeftButton = document.getElementById("rotate-left-button");
    const stopButton = document.getElementById("stop-button");

    const measurementBuffer = [];
    const mainloopPeriod = 300;

    async function loadMessageTypes() {
        const file = await fetch('../data/messageTypes.json');
        if (file.status === "404") {
            console.error("Failed to read file containing message types");
            return null;
        }

        return await file.json();
    }


    const messageTypes = await loadMessageTypes();

    let serverSocket = null;

    const { rotationChart, updateChart: updateRotationChart, addData: addRotationData } = await createChart('rotation-chart');
    const { accelerationChart, updateChart: updateAccelerationChart, addData: addAccelerationData } = await createChart('acceleration-chart');

    function initiate() {
        uriConnectButton.addEventListener("click", async (context) => {
            // TODO: Validate input
            const inputContent = uriInputField.value;

            serverSocket = new WebSocket(inputContent);
            serverSocket.binaryType = "arraybuffer";
            const success = await connectToServer(serverSocket, 2000);
            if (success) {
                console.log(`Successfully connected to server at URL: ${serverSocket.url}`);
                serverSocket.onmessage = handleMessage;
            }
            else
                console.log("Failed to connect");
        });

        goForwardButton.addEventListener('click', context => {
            const request = new Uint8Array([
                messageTypes.messageType.command,
                messageTypes.commandType.move,
                messageTypes.motorSelection.firstAndSecond,
                messageTypes.moveDirection.forward
            ]);
            serverSocket.send(request);
            console.log("sent request: " + request);
        });

        goBackwardButton.addEventListener('click', context => {
            const request = new Uint8Array([
                messageTypes.messageType.command,
                messageTypes.commandType.move,
                messageTypes.motorSelection.firstAndSecond,
                messageTypes.moveDirection.backward
            ]);
            serverSocket.send(request);
            console.log("sent request: " + request);
        });

        rotateLeftButton.addEventListener('click', context => {
            const request = new Uint8Array([
                messageTypes.messageType.command,
                messageTypes.commandType.rotate,
                messageTypes.rotationDirection.left
            ]);
            serverSocket.send(request);
            console.log("sent request: " + request);
        });

        rotateRightButton.addEventListener('click', context => {
            const request = new Uint8Array([
                messageTypes.messageType.command,
                messageTypes.commandType.rotate,
                messageTypes.rotationDirection.right
            ]);
            serverSocket.send(request);
            console.log("sent request: " + request);
        });

        stopButton.addEventListener('click', context => {
            const request = new Uint8Array([
                messageTypes.messageType.command,
                messageTypes.commandType.move,
                messageTypes.motorSelection.firstAndSecond,
                messageTypes.moveDirection.stop
            ]);
            serverSocket.send(request);
            console.log("sent request: " + request);
        });

        setInterval(mainloop, mainloopPeriod);
    }

    async function mainloop() {
        while (measurementBuffer.length) {
            const measurement = measurementBuffer.pop();
            if (measurement.name == "rotation") {
                await addRotationData('rotation-chart', 'rotation-x', measurement.time, measurement.payload[0]);
                await addRotationData('rotation-chart', 'rotation-y', measurement.time, measurement.payload[1]);
                await addRotationData('rotation-chart', 'rotation-z', measurement.time, measurement.payload[2]);
            }
            else if (measurement.name == "acceleration") {
                await addRotationData('acceleration-chart', 'acceleration-x', measurement.time, measurement.payload[0]);
                await addRotationData('acceleration-chart', 'acceleration-y', measurement.time, measurement.payload[1]);
                await addRotationData('acceleration-chart', 'acceleration-z', measurement.time, measurement.payload[2]);
            }
        }

        await Promise.all([updateRotationChart(), updateAccelerationChart()]);
    }

    async function connectToServer(socket, timeout = 2000) {
        const isOpen = () => (socket.readyState === WebSocket.OPEN);
        const isConnecting = () => (socket.readyState === WebSocket.CONNECTING);

        if (!isConnecting())
            return isOpen();

        else {
            const delay = 100;
            const nCycles = timeout / delay;
            for (let i = 0; i < nCycles && isConnecting(); i++)
                await new Promise(resolve => setTimeout(resolve, delay));

            return isOpen();
        }
    }

    function logInvalidMessage(message) {
        console.log(`Received invalid message ${message.data} for status {clientStatus}`);
    }

    function handleMessage(message) {
        const header = new Uint8Array(message.data, 0, 4);
        const headerBytes = parseByteVector(header, 0, 4, 'uint8');

        if (headerBytes[0] === messageTypes.messageType.data) {
            if (headerBytes[1] === messageTypes.dataType.measurement) {
                handleMeasurement(message.data);
                return;
            }
        }
        
        logInvalidMessage(message);
    }

    function parseByteVector(byteArray, startIndex, amount, dtype) {
        let funcGetter = null;
        let size = null;

        if (dtype === "float32") {
            funcGetter = "getFloat32";
            size = 4;
        }
        else if (dtype === "int32") {
            funcGetter = "getInt32";
            size = 4;
        }
        else if (dtype === "uint32") {
            funcGetter = "getUint32";
            size = 4;
        }
        else if (dtype === "int16") {
            funcGetter = "getInt16";
            size = 2;
        }
        else if (dtype === "int8") {
            funcGetter = "getInt8";
            size = 1;
        }
        else if (dtype === "uint8") {
            funcGetter = "getUint8";
            size = 1;
        }
        else {
            console.error("Attemped to parse byte vector of unrecognized type " + dtype);
            return [];
        }

        const endIndex = startIndex + size * amount;
        if (endIndex > byteArray.length) {
            console.error(
                "Attempted to get " + amount +
                " bytes from array " + byteArray +
                " with length " + byteArray.length +
                " starting at " + startIndex
            );
            return [];
        }

        const view = new DataView(byteArray.buffer);
        const floatArray = [];
        for (let i = startIndex; i < endIndex; i += size) {
            floatArray.push(view[funcGetter](i + byteArray.byteOffset, true));
        }

        return floatArray;
    }

    function handleMeasurement(message) {
        const header = new Uint8Array(message, 0, 4);
        const timeStamp = new Uint8Array(message, 4, 8);
        const payload = new Uint8Array(message, 8);
        const timeStampVector = parseByteVector(timeStamp, 0, 1, "uint32");


        if (header[2] === messageTypes.measurementType.rotation) {
            const payloadVector = parseByteVector(payload, 0, 3, "float32");

            if (measurementBuffer.length < 5000) {
                measurementBuffer.push(
                    { name: "rotation", time: timeStampVector[0], payload: payloadVector },
                );
            }
        }

        else if (header[2] === messageTypes.measurementType.acceleration) {
            const payloadVector = parseByteVector(payload, 0, 3, "int16");

            if (measurementBuffer.length < 5000) {
                measurementBuffer.push(
                    { name: "acceleration", time: timeStampVector[0], payload: payloadVector },
                );
            }
        }

    }

    initiate();
}

main();