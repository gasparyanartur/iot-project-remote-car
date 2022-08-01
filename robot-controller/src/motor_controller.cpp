#include "motor_controller.h"

void MotorController::MotorDC::setup()
{
    pinMode(this->PIN_IN1, OUTPUT);
    pinMode(this->PIN_IN2, OUTPUT);
}

void MotorController::MotorDC::rotateForward()
{
    motorWrite(HIGH, LOW);
}

void MotorController::MotorDC::rotateBackward()
{
    motorWrite(LOW, HIGH);
}

void MotorController::MotorDC::rotateStop()
{
    motorWrite(LOW, LOW);
}

void MotorController::performMotorDemo()
{
    Serial.println("LeftForward");
    motorLeft.rotateForward();
    delay(2000);
    motorLeft.rotateStop();
    delay(2000);
    Serial.println("LeftBack");
    motorLeft.rotateBackward();
    delay(2000);
    Serial.println("RightForward");
    motorLeft.rotateStop();
    delay(2000);
    motorRight.rotateForward();
    delay(2000);
    motorRight.rotateStop();
    delay(2000);
    Serial.println("RightBack");
    motorRight.rotateBackward();
    delay(2000);
    motorRight.rotateStop();
    delay(2000);
}

namespace MotorController
{
    MotorDC motorLeft{26, 27};
    MotorDC motorRight{19, 18};
}