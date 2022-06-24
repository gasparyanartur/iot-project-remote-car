#include <Arduino.h>

#include "web_client.h"
//#include "web_server.h"
#include "sensor_controller.h"


void setup() 
{
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\nStarting setup...\n");

  startSensorController(); 
  Serial.println();
  startWebClient();
  //startWebServer();

  Serial.println("\nSetup complete\n");
}

void loop() {
  updateWebClient();
  //updateWebServer();
};

