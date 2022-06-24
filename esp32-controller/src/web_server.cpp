/*
#include <Arduino.h>
#include <ArduinoWebsockets.h>
#include <WiFi.h>
#include <string>

#include "esp_camera.h"
#include "web_server.h"

const char NW_SSID[] = "Artur";
const char NW_PW[] = "23D3037900C64";

const char SOCKET_URI[] = "ws://192.168.1.104:8001";

namespace ws = websockets;

ws::WebsocketsServer server;
ws::WebsocketsClient websocketClient;

bool connectToWifi();
void onMessage(ws::WebsocketsClient &client, ws::WebsocketsMessage message);
void handleCamRequest(ws::WebsocketsClient &client);

void startWebServer()
{
    Serial.println("Initiating web server...");

    if (!connectToWifi())
        return;

    server.listen(8001);
}

void updateWebServer()
{
    if (!server.available())
    {
        Serial.println("Server disconnected");
        // reconnected
        return;
    }

    if (server.poll())
    {
        if (websocketClient.available())
        {
            Serial.println("Attempted to connect socket, but connection already exists.");
            return;
        }

        Serial.println("Accepting client");
        websocketClient = server.accept();
        websocketClient.onMessage(onMessage);
    }

    if (websocketClient.available())
        websocketClient.poll();
}

void onMessage(ws::WebsocketsClient &client, ws::WebsocketsMessage message)
{
    if (message.isBinary())
    {
        // TODO Implement message protocol.
        // message.rawData()
        return;
    }

    Serial.printf("Received message: %f\n", message.data());

    char *data;
    const char *delim = " ";
    std::copy(message.data().begin(), message.data().end(), data);
    auto header = strtok(data, delim);

    if (header == "cam")
    {
        handleCamRequest(client);
    }
}

void handleCamRequest(ws::WebsocketsClient &client)
{
    auto sns = esp_camera_sensor_get();
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb)
    {
        Serial.println("Camera capture failed");
        client.send("fail");
        return;
    }

    client.send("ok");
    client.sendBinary((char *)fb->buf, fb->len);

    esp_camera_fb_return(fb);
}

bool connectToWifi()
{
    WiFi.begin(NW_SSID, NW_PW);
    Serial.printf("Connecting to WIFI: %s...", NW_SSID);

    int wifiCount = 0;
    do
    {
        if (WiFi.isConnected())
            goto WIFI_CONNECTED;

        delay(500);
        Serial.print(".");
    } while (wifiCount++ < 15);

    Serial.printf("Failed to connect to wifi");
    return false;

WIFI_CONNECTED:
    Serial.printf("\nSuccessfully connected to address: %s\n", WiFi.localIP().toString());
    return true;
}
*/