#include <Arduino.h>
#include <ArduinoWebsockets.h>
#include <WiFi.h>

#include "web_client.h"
#include "esp_camera.h"
#include "message_types.h"

const char NW_SSID[] = "Artur";
const char NW_PW[] = "23D3037900C64";
const char SOCKET_URI[] = "ws://192.168.1.104:8001";

websockets::WebsocketsClient client;

void onMessageCallback(websockets::WebsocketsMessage message);
void onEventCallback(websockets::WebsocketsEvent event, String data);
bool connectToWifi();
void sendCameraCapture();
void onTextMessageCallback(const String msg);
void onBinaryMessageCallback(const byte data[], const size_t length);
void handleBinaryRequest(const byte data[], const size_t length);
void handleUnknownBinaryMessage(const byte data[], const size_t length);
void handleBinaryDataRequest(const byte data[], const size_t length);
void handleUnknownBinaryDataRequest(const byte data[], const size_t length);

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
   if (message.isEmpty())
      return;

   if (message.isBinary())
      onBinaryMessageCallback((const byte *)message.rawData().c_str(), message.length());

   else if (message.isText())
      onTextMessageCallback(message.data());

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

      const size_t msgLen = fb->len + 2;
      char msg[msgLen];

      msg[0] = MessageHeader::MessageType::Data;
      msg[1] = MessageHeader::DataType::Image;

      std::copy(fb->buf, fb->buf + fb->len, msg + 2);

      client.sendBinary(msg, msgLen);

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

void onTextMessageCallback(const String msg)
{
}

void onBinaryMessageCallback(const byte data[], const size_t length)
{
   const byte messageType = data[0];
   switch (messageType)
   {
   case MessageHeader::MessageType::Request:
      break;

   default:
      handleUnknownBinaryMessage(data, length);
   }
   if (data[0] == MessageHeader::MessageType::Request)
   {
      handleBinaryRequest(data + 1, length - 1);
   }
   else
   {
      Serial.printf("Unrecognized request: %d\n", data[0]);
   }
}

void handleBinaryRequest(const byte data[], const size_t length)
{
   const byte requestType = data[0];
   switch (requestType)
   {

   case MessageHeader::RequestType::Data:
      // TODO
      handleBinaryDataRequest(data + 1, length - 1);
      break;

   default:
      handleUnknownBinaryRequest(data, length);
      break;
   }
}

void handleBinaryDataRequest(const byte data[], const size_t length)
{
   const byte dataType = data[0];
   switch (dataType)
   {
   case MessageHeader::DataType::Image:
      handleBinaryDataImageRequest(data + 1, length - 1);
      break;

   default:
      handleUnknownBinaryDataRequest(data, length);
      break;
   }
}

void handleBinaryDataImageRequest(const byte data[], const size_t length)
{
      camera_fb_t *fb = esp_camera_fb_get();
      if (!fb)
      {
         Serial.println("Camera capture failed");
         return;
      }

      const size_t msgLen = fb->len + 2;
      char msg[msgLen];

      msg[0] = MessageHeader::MessageType::Data;
      msg[1] = MessageHeader::DataType::Image;
      std::copy(fb->buf, fb->buf + fb->len, msg + 2);

      client.sendBinary(msg, msgLen);
      esp_camera_fb_return(fb);
}

void handleUnknownBinaryMessage(const byte data[], const size_t length)
{
   Serial.printf("Received unrecognized message of type %d%n", data[0]);
}

void handleUnknownBinaryRequest(const byte data[], const size_t length)
{
   Serial.printf("Received unrecognized request of type %d%n", data[0]);
}

void handleUnknownBinaryDataRequest(const byte data[], const size_t length)
{
   Serial.printf("Received request for unrecognized type %d%n", data[0]);
}

