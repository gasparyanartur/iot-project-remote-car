const State = {
    Entry: "entry-state",
    Active: "active-state",
}

const ClientStatus = {
    Idle: 0,
    WaitingForCameraBuffer: 1,
}

const ActivityStateClass = "activity-state";
const HiddenClass = "hidden";

let currentState = State.Entry;
let serverSocket = null;
let clientStatus = ClientStatus.Idle;

Array.from(document.getElementsByClassName(ActivityStateClass)).forEach(element => {
    if (element.classList.contains(currentState)) 
        element.classList.remove(HiddenClass);
    else
        element.classList.add(HiddenClass);
});

const updateCurrentState = (newState) => {
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

const connectButton = document.getElementById("connect-button");
const camButton = document.getElementById("cam-button");
const uriConnectButton = document.getElementById("uri-connect-button");
const cameraDispay = document.getElementById("camera-display");

const uriInputField = document.getElementById("uri-input");

camButton.addEventListener("click", (context) => {
    serverSocket.send("cam");
    clientStatus = ClientStatus.WaitingForCamera;
});

connectButton.addEventListener("click", (context) => {

});

uriConnectButton.addEventListener("click", (context) => {
    // TODO: Validate input
    const inputContent = uriInputField.value;

    try {
        serverSocket = new WebSocket(inputContent);
        serverSocket.addEventListener("message", event => {
            if (clientStatus.WaitingForCamera) {
                const img = btoa(event.data);
                console.log(img);
            }
        });
        updateCurrentState(State.Active)
    }
    catch(e) {
        console.log(`Failed to connect to address {inputContent}, got error {e}`);
    }
});