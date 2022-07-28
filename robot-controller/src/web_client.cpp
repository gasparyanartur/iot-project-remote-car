#include <Arduino.h>
#include <ArduinoWebsockets.h>
#include <WiFi.h>

#include <Esp.h>

#include "web_client.h"
#include "esp_camera.h"
#include "message_types.h"

#include "sensor_controller.h"

void onMessageCallback(websockets::WebsocketsMessage message);
void onEventCallback(websockets::WebsocketsEvent event, String data);
bool connectToWifi();
void sendCameraCapture();
inline void onTextMessageCallback(const String msg);
inline void onBinaryMessageCallback(const byte data[], const size_t length);
inline void handleBinaryRequest(const byte data[], const size_t length);
inline void handleUnknownBinaryMessage(const byte data[], const size_t length);
inline void handleBinaryDataRequest(const byte data[], const size_t length);
inline void handleBinaryDataImageRequest(const byte data[], const size_t length);
inline void handleBinaryDataMeasurementRequest(const byte data[], const size_t length);
inline void handleBinaryDataMeasurementRotationRequest(const byte data[], const size_t length);
inline void handleUnknownBinaryRequest(const byte data[], const size_t length);
inline void handleUnknownBinaryDataRequest(const byte data[], const size_t length);

const char NW_SSID[] = "Artur";
const char NW_PW[] = "23D3037900C64";
const char SOCKET_URI[] = "ws://192.168.1.104:8002";

websockets::WebsocketsClient client;

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

inline void onTextMessageCallback(const String msg)
{
}

inline void onBinaryMessageCallback(const byte data[], const size_t length)
{
   const byte messageType = data[0];
   switch (messageType)
   {
   case MessageHeader::MessageType::Request:
      handleBinaryRequest(data + 1, length - 1);
      break;

   default:
      handleUnknownBinaryMessage(data, length);
   }
}

inline void handleBinaryRequest(const byte data[], const size_t length)
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

inline void handleBinaryDataRequest(const byte data[], const size_t length)
{
   const byte dataType = data[0];
   switch (dataType)
   {
   case MessageHeader::DataType::Image:
      handleBinaryDataImageRequest(data + 1, length - 1);
      break;

   case MessageHeader::DataType::Measurement:
      handleBinaryDataMeasurementRequest(data + 1, length - 1);

   default:
      handleUnknownBinaryDataRequest(data, length);
      break;
   }
}

inline void handleBinaryDataImageRequest(const byte data[], const size_t length)
{
   Serial.println("Capturing camera frame...");
   auto sns = esp_camera_sensor_get();
   camera_fb_t *fb = esp_camera_fb_get();
   if (!fb)
   {
      Serial.println("Camera capture failed");
      return;
   }
   Serial.println("Frame captured successfully.");

   Serial.println("Packing frame...");

   char *c = new char[fb->len + 2];

   c[0] = MessageHeader::MessageType::Data;
   c[1] = MessageHeader::DataType::Image;

   std::copy(fb->buf, fb->buf + fb->len, c + 2);
   client.sendBinary(c, fb->len + 2);

   delete[] c;

   esp_camera_fb_return(fb);
}

inline void handleBinaryDataMeasurementRequest(const byte data[], const size_t length)
{
   const byte measurementType = data[0];
   switch (measurementType)
   {
   case MessageHeader::MeasurementType::Rotation:
      // TODO
      handleBinaryDataMeasurementRotationRequest(data + 1, length - 1);
      break;

   case MessageHeader::MeasurementType::Acceleration:
   {

      // DATA, MEASUREMENT, ROTATION, DEGREES, X0, X1, X2, X3, Y0, Y1, Y2, Y3, Z0, Z1, Z2, Z3

      char c[16]{MessageHeader::MessageType::Data, MessageHeader::DataType::Measurement,
                 MessageHeader::MeasurementType::Rotation, MessageHeader::RotationUnit::Degrees};

      SensorController::AttitudeController::Measurement::getRotationDegrees(c + 4);
      client.sendBinary(c, 16);
      break;
   }

   case MessageHeader::MeasurementType::Gravity:
      // TODO
      break;

   default:
      // TODO
      break;
   }
}

inline void handleBinaryDataMeasurementRotationRequest(const byte data[], const size_t length)
{
   const byte rotationUnit = data[0];
   switch (rotationUnit)
   {
   case MessageHeader::RotationUnit::Degrees:
      /* code */
      break;

   case MessageHeader::RotationUnit::Quaternions:
      break;

   case MessageHeader::RotationUnit::Radians:
      break;

   default:
      break;
   }
}

inline void handleUnknownBinaryMessage(const byte data[], const size_t length)
{
   Serial.printf("Received unrecognized message of type %d%n", data[0]);
}

inline void handleUnknownBinaryRequest(const byte data[], const size_t length)
{
   Serial.printf("Received unrecognized request of type %d%n", data[0]);
}

inline void handleUnknownBinaryDataRequest(const byte data[], const size_t length)
{
   Serial.printf("Received request for unrecognized type %d%n", data[0]);
}
