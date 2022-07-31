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

const stateCheatList = document.getElementById("menu-state-cheatlist");
const captureButton = document.getElementById("capture-button");

let currentState = State.Entry;
let currentActiveMenu = ActiveMenu.Camera;
let serverSocket = null;
let clientStatus = ClientStatus.Idle;

let currentImageURL = null;

function initiate() {
    Array.from(document.getElementsByClassName(ActivityStateClass)).forEach(element => {
        if (element.classList.contains(currentState))
            element.classList.remove(HiddenClass);
        else
            element.classList.add(HiddenClass);
    });

    uriConnectButton.addEventListener("click", async (context) => {
        // TODO: Validate input
        const inputContent = uriInputField.value;

        serverSocket = new WebSocket(inputContent);
        serverSocket.binaryType = "arraybuffer";
        const success = await connectToServer(serverSocket, 2000);
        if (success) {
            console.log(`Successfully connected to server at URL: {serverSocket.url}`);
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

    helloButton.addEventListener("click", (context) => {
        serverSocket.send("hello");
    });

    connectButton.addEventListener("click", (context) => {

    });

    stateCheatList.childNodes.forEach(child => {
        child.addEventListener('click', (context) => {
            const stateName = context.target.textContent;
            const state = State[stateName];
            updateCurrentState(state);
        });
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
        const request = new Uint8Array([0, 1, 2, 1, 3]);
        serverSocket.send(request);
        console.log("sent request: " + request);

        globalThis.clientStatus = ClientStatus.WaitingForMeasurements;
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

    if (header[0] == 2 && header[1] == 1) {
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

function parseByteVector(byteArray, startIndex, nFloats, dtype) {
    let funcGetter = null;
    let size = null;

    if (dtype === "float32") {
        funcGetter = "getFloat32";
        size = 4;
    }
    else if(dtype === "int32") {
        funcGetter = "getInt32";
        size = 4;
    }
    else if(dtype === "int16") {
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

    const endIndex = startIndex + 4 * nFloats;
    if (endIndex > byteArray.length) {
        console.error(
            "Attempted to get " + nFloats +
            " floats from array " + byteArray +
            " starting at " + startIndex
        );
        return [];
    }

    const view = new DataView(byteArray.buffer);
    const floatArray = [];
    for (let i = startIndex; i < endIndex; i += size) {
        floatArray.push(view[funcGetter](i, true));
    }

    return floatArray;
}

function handleWaitingForMeasurements(message) {
    const header = new Uint8Array(message, 0, 4);
    const payload = new Uint8Array(message, 4);
    const floatVector = parseByteVector(payload, 0, 3, "float32");
    console.log("measurements", floatVector);
    clientStatus = ClientStatus.Idle;
}




initiate();