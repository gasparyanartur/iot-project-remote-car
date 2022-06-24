const State = {
    Entry: "entry-state",
    Active: "active-state",
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
const helloButton = document.getElementById("hello-button");
const uriConnectButton = document.getElementById("uri-connect-button");
const cameraDispay = document.getElementById("camera-display");
const uriInputField = document.getElementById("uri-input");

let currentState = State.Entry;
let serverSocket = null;
let clientStatus = ClientStatus.Idle;

function initiate() {
    Array.from(document.getElementsByClassName(ActivityStateClass)).forEach(element => {
        if (element.classList.contains(currentState))
            element.classList.remove(HiddenClass);
        else
            element.classList.add(HiddenClass);
    });
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
    /*
    serverSocket.addEventListener("message", event => {
        if (clientStatus === ClientStatus.WaitingForCamera) {

        }
    });
    */
    updateCurrentState(State.Active);
}


function logInvalidMessage(message) {
    console.log(`Received invalid message {message.data} for status {clientStatus}`);
}

function handleMessage(message) {
    console.log("Received message " + message.data);
    switch(clientStatus) {
        case ClientStatus.Idle:
            break;

        case ClientStatus.WaitingForCameraStatus:
            handleWaitingForCameraStatus(message);
            break;

        case ClientStatus.WaitingForCameraFrame:
            handleWaitingForCameraFrame(message);
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

function handleWaitingForCameraFrame(message) {
    const img = btoa(message.data);
    console.log(img);
}


uriConnectButton.addEventListener("click", async (context) => {
    // TODO: Validate input
    const inputContent = uriInputField.value;

    serverSocket = new WebSocket(inputContent);
    const success = await connectToServer(serverSocket, 2000);
    if (success) {
        console.log(`Successfully connected to server at URL: {serverSocket.url}`);
        loadActiveMenu();
        serverSocket.onmessage = handleMessage;
    }
    else
        console.log("Failed to connect");
});

camButton.addEventListener("click", (context) => {
    serverSocket.send("cam");
    globalThis.clientStatus = ClientStatus.WaitingForCameraStatus;
});

helloButton.addEventListener("click", (context) => {
    serverSocket.send("hello");
});

connectButton.addEventListener("click", (context) => {

});

initiate();