#include <Arduino.h>

#include "web_client.h"
#include "sensor_controller.h"
#include "motor_controller.h"

//#define _SCAN_I2C
//#include "i2c_scanner.h"



const u_long SETUP_DURATION = 10000;
const u_long MEASURE_PERIOD = 200;
u_long nextMeasurementTime = SETUP_DURATION + MEASURE_PERIOD;


void setup() 
{
  #ifdef _SCAN_I2C
  ScannerI2C::setup();
  ScannerI2C::scan();
  #endif //_SCAN_I2C

  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\nStarting setup...\n");

  startSensorController(); 

  MotorController::motorLeft.setup();
  MotorController::motorRight.setup();

  //MotorController::performMotorDemo();

  Serial.println();
  startWebClient();

  Serial.println("\nSetup complete\n");
}

void loop() {
  const auto t = millis();
  if (t < SETUP_DURATION) {
    return;
  }

  updateWebClient();
  SensorController::AttitudeController::tick();

  if (t > nextMeasurementTime)
  {
    sendMeasurements();
    nextMeasurementTime = t + MEASURE_PERIOD;
  }
};

