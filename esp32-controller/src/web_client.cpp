#include <Arduino.h>
#include <WiFi.h>
#include "web_client.h"
#include <ArduinoWebsockets.h>
#include "esp_camera.h"
#include <bitset>

const char NW_SSID[] = "Artur";
const char NW_PW[] = "23D3037900C64";

const char SOCKET_URI[] = "ws://192.168.1.104:8001";

websockets::WebsocketsClient client;

void onMessageCallback(websockets::WebsocketsMessage message);
void onEventCallback(websockets::WebsocketsEvent event, String data);
bool connectToWifi();
void sendCameraCapture();
static size_t encodeJpgCallback(void *rawClient, size_t index, const void *data, size_t length);

void startWebClient()
{
   Serial.println("Initiating web client...");

   if (!connectToWifi())
      return;

   client.onEvent(onEventCallback);
   client.onMessage(onMessageCallback);

   Serial.printf("Connecting to socket at URI: %s\n", SOCKET_URI);
   client.connect(SOCKET_URI);
   Serial.println("Connected to socket");

   Serial.println("Web client initiated");
}

void updateWebClient()
{
   if (client.available())
   {
      client.poll();

      auto serialInput = Serial.readString();
      if (!serialInput.isEmpty())
      {
         Serial.printf("Sending following message: %s\n", serialInput.c_str());

         if (serialInput.charAt(0) == '%')
            client.sendBinary(serialInput.substring(1));
         else if (serialInput == "cam")
         {
            client.send("cam");
         }
         else
            client.send(serialInput);

         Serial.flush();
      }
   }
}

void onMessageCallback(websockets::WebsocketsMessage message)
{
   if (message.data() == "cam")
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
}

void onEventCallback(websockets::WebsocketsEvent event, String data)
{
   switch (event)
   {
   case websockets::WebsocketsEvent::ConnectionOpened:
      Serial.println("Connection opened");
      break;
   case websockets::WebsocketsEvent::ConnectionClosed:
      Serial.println("Connection closed");
      break;
   }
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
