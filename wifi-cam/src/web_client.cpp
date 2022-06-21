#include <Arduino.h>
#include <WiFi.h>
#include "web_client.h"

const char* NW_SSID = "Artur";
const char* NW_PW = "23D3037900C64";

void startWebClient() {
   Serial.println("Initiating web client...");

   WiFi.begin(NW_SSID, NW_PW);
   Serial.printf("Connecting to WIFI: %s...", NW_SSID);
   while (!WiFi.isConnected()) {
      Serial.print(".");
      delay(500);
   }
   Serial.printf("\nSuccessfully connected to address: %s\n", WiFi.localIP().toString());

   Serial.println("Web client initiated");
}