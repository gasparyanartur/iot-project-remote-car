#include <Arduino.h>

#include "web_client.h"
#include "sensor_controller.h"
#include "motor_controller.h"

//#define _SCAN_I2C
//#include "i2c_scanner.h"



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
  Serial.println("LeftForward");
  MotorController::motorLeft.rotateForward();
  delay(2000);
  MotorController::motorLeft.rotateStop();
  delay(2000);
  Serial.println("LeftBack");
  MotorController::motorLeft.rotateBackward();
  delay(2000);
  Serial.println("RightForward");
  MotorController::motorLeft.rotateStop();
  delay(2000);
  MotorController::motorRight.rotateForward();
  delay(2000);
  MotorController::motorRight.rotateStop();
  delay(2000);
  Serial.println("RightBack");
  MotorController::motorRight.rotateBackward();
  delay(2000);
  MotorController::motorRight.rotateStop();
  delay(2000);

  Serial.println();
  startWebClient();

  Serial.println("\nSetup complete\n");
}

void loop() {
  updateWebClient();
  SensorController::AttitudeController::tick();
};

