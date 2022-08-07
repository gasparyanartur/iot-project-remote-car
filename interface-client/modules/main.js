const { createMap } = require('./map.js');
const { createChart } = require('./charts.js');

async function main() {
    const State = {
        Entry: "entry-state",
        Active: "active-state",
    }

    const ActiveMenu = {
        Camera: "camera-menu",
        Map: "map-menu",
        Measurements: "measurements-menu"
    }

    const ClientStatus = {
        Idle: 0,
        WaitingForCameraStatus: 1,
        WaitingForCameraFrame: 2,
    }

    const ActivityStateClass = "activity-state";
    const HiddenClass = "hidden";

    const connectButton = document.getElementById("connect-button");
    const camButton = document.getElementById("cam-button");
    const mapButton = document.getElementById("map-button");
    const measurementsButton = document.getElementById("measurements-button");
    const helloButton = document.getElementById("hello-button");
    const uriConnectButton = document.getElementById("uri-connect-button");
    const cameraDispay = document.getElementById("camera-display");
    const uriInputField = document.getElementById("uri-input");
    const rotationDegreesText = document.getElementById("rotation-degrees-text");
    const rotationDegreesButton = document.getElementById("rotation-degrees-button");

    const goForwardButton = document.getElementById("go-forward-button");
    const goBackwardButton = document.getElementById("go-backward-button");
    const rotateRightButton = document.getElementById("rotate-right-button");
    const rotateLeftButton = document.getElementById("rotate-left-button");
    const stopButton = document.getElementById("stop-button");

    const sideBar = document.getElementById("sidebar");
    const stateCheatList = document.getElementById("menu-state-cheatlist");
    const captureButton = document.getElementById("capture-button");

    const measurementBuffer = [];
    const mainloopPeriod = 1000;

    const startTime = new Date().getTime();

    async function loadMessageTypes() {
        const file = await fetch('../data/messageTypes.json');
        if (file.status === "404") {
            console.error("Failed to read file containing message types");
            return null;
        }

        return await file.json();
    }


    const messageTypes = await loadMessageTypes();

    let currentState = State.Entry;
    let currentActiveMenu = ActiveMenu.Camera;
    let serverSocket = null;
    let clientStatus = ClientStatus.Idle;

    let currentImageURL = null;

    const { rotationChart, updateChart, addData } = await createChart('rotation-chart');

    function getElapsedTime() {
        return new Date().getTime() - startTime;
    }

    function initiate() {
        uriConnectButton.addEventListener("click", async (context) => {
            // TODO: Validate input
            const inputContent = uriInputField.value;

            serverSocket = new WebSocket(inputContent);
            serverSocket.binaryType = "arraybuffer";
            const success = await connectToServer(serverSocket, 2000);
            if (success) {
                console.log(`Successfully connected to server at URL: ${serverSocket.url}`);
                loadActiveMenu();
                serverSocket.onmessage = handleMessage;
            }
            else
                console.log("Failed to connect");
        });

        captureButton.addEventListener("click", (context) => {
            const request = new Uint8Array([0, 1, 1]);
            serverSocket.send(request);
            globalThis.clientStatus = ClientStatus.WaitingForCameraFrame;
        });

        connectButton.addEventListener("click", (context) => {

        });

        camButton.addEventListener('click', context => {
            updateActiveMenu(ActiveMenu.Camera);
        });

        mapButton.addEventListener('click', context => {
            updateActiveMenu(ActiveMenu.Map);
        });

        measurementsButton.addEventListener('click', context => {
            updateActiveMenu(ActiveMenu.Measurements);
        });

        rotationDegreesButton.addEventListener('click', context => {
            const request = new Uint8Array([
                messageTypes.messageType.request,
                messageTypes.requestType.data,
                messageTypes.dataType.measurement,
                messageTypes.measurementType.rotation,
                messageTypes.rotationUnit.degrees
            ]);
            serverSocket.send(request);
            console.log("sent request: " + request);

            globalThis.clientStatus = ClientStatus.WaitingForMeasurements;
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
        //setupLayout();
    }

    function mainloop() {
        updateChart();
        while (measurementBuffer.length) {
            const measurement = measurementBuffer.pop();
            if (measurement.name == "rotation") {
                addData('rotation-chart', 'rotation-x', measurement.time, measurement.payload[0]);
                addData('rotation-chart', 'rotation-y', measurement.time, measurement.payload[1]);
                addData('rotation-chart', 'rotation-z', measurement.time, measurement.payload[2]);
            }
        }
    }

    function setupLayout() {
        Array.from(document.getElementsByClassName(ActivityStateClass)).forEach(element => {
            if (element.classList.contains(currentState))
                element.classList.remove(HiddenClass);
            else
                element.classList.add(HiddenClass);
        });

        stateCheatList.childNodes.forEach(child => {
            child.addEventListener('click', (context) => {
                const stateName = context.target.textContent;
                const state = State[stateName];
                updateCurrentState(state);
            });
        });

        updateCurrentState(State.Active);
        updateActiveMenu(ActiveMenu.Camera);
    }

    function initiateState(state) {
        switch (state) {
            default:
                break;
        }
    }

    function updateCurrentState(newState) {
        if (newState == currentState)
            return;

        Array.from(document.getElementsByClassName(currentState)).forEach(element => {
            element.classList.add(HiddenClass);
        });

        currentState = newState;

        Array.from(document.getElementsByClassName(currentState)).forEach(element => {
            element.classList.remove(HiddenClass);
        });

        initiateState(newState);
    }

    async function initateMenu(menu) {
        switch (menu) {
            case ActiveMenu.Map:
                map = await createMap();
                map.render();
            default:
                break;
        }
    }

    function updateActiveMenu(newMenu) {
        if (newMenu == currentActiveMenu)
            return;

        document.getElementById(currentActiveMenu).classList.add(HiddenClass);

        currentActiveMenu = newMenu;

        document.getElementById(currentActiveMenu).classList.remove(HiddenClass);

        initateMenu(newMenu);
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

    function loadActiveMenu() {
        updateCurrentState(State.Entry);
    }


    function logInvalidMessage(message) {
        console.log(`Received invalid message ${message.data} for status {clientStatus}`);
    }

    function handleMessage(message) {
        console.log(`Received message ${message.data}`);
        switch (globalThis.clientStatus) {
            case ClientStatus.Idle:
                break;

            case ClientStatus.WaitingForCameraStatus:
                handleWaitingForCameraStatus(message.data);
                break;

            case ClientStatus.WaitingForCameraFrame:
                handleWaitingForCameraFrame(message.data);
                break;

            case ClientStatus.WaitingForMeasurements:
                handleWaitingForMeasurements(message.data);
                break;

            default:
                console.log("Received message while in invalid status {clientStatus}. Resetting to Idle");
                clientStatus = ClientStatus.Idle;
                break;
        }

    }

    function handleWaitingForCameraStatus(message) {
        if (message === "ok")
            clientStatus = ClientStatus.WaitingForCameraFrame;

        else if (message === "fail") {
            console.log("Failed to get camera frame");
            clientStatus = ClientStatus.Idle;
        }

        else {
            logInvalidMessage(message);
        }
    }

    function cleanUpCurrentImage() {
        if (globalThis.currentImageURL !== null) {
            URL.revokeObjectURL(globalThis.currentImageURL);
            globalThis.currentImageURL = null;
        }
    }

    async function handleWaitingForCameraFrame(message) {
        const header = new Int8Array(message, 0, 2);
        const data = new Uint8Array(message, 2);
        console.log(`Header: ${header}`)

        if (header[0] == messageTypes.messageType.data && header[1] == messageTypes.dataType.image) {
            cleanUpCurrentImage();
            const blob = new Blob([data], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            console.log("Created url at ")
            const cameraImage = document.getElementById("camera-img");
            const width = cameraImage.width;
            cameraImage.src = url;
            cameraImage.width = width;
        }

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
        else {
            console.error("Attemped to parse byte vector of unrecognized type " + dtype);
            return [];
        }

        const endIndex = startIndex + size * amount;
        if (endIndex > byteArray.length) {
            console.error(
                "Attempted to get " + amount +
                " floats from array " + byteArray +
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

    function handleWaitingForMeasurements(message) {
        const header = new Uint8Array(message, 0, 4);
        const timeStamp = new Uint8Array(message, 4, 8);
        const payload = new Uint8Array(message, 8);
        const timeStampVector = parseByteVector(timeStamp, 0, 1, "uint32");

        console.log(header[0]);

        if (header[2] === messageTypes.measurementType.rotation) {
            const payloadVector = parseByteVector(payload, 0, 3, "float32");

            if (measurementBuffer.length < 5000) {
                measurementBuffer.push(
                    { name: "rotation", time: timeStampVector[0], payload: payloadVector },
                );
            }
        }

        clientStatus = ClientStatus.Idle;
    }

    initiate();
}

main();