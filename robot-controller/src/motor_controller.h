#pragma once

#include <Arduino.h>

namespace MotorController
{

    class MotorDC
    {
    public:
        inline MotorDC(const uint8_t PIN_IN1, const uint8_t PIN_IN2) : PIN_IN1(PIN_IN1), PIN_IN2(PIN_IN2)
        {
        }

        void setup()
        {
            pinMode(this->PIN_IN1, OUTPUT);
            pinMode(this->PIN_IN2, OUTPUT);
        }

        inline void rotateForward()
        {
            motorWrite(HIGH, LOW);
        }

        inline void rotateBackward()
        {
            motorWrite(LOW, HIGH);
        }

        inline void rotateStop()
        {
            motorWrite(LOW, LOW);
        }

    private:
        const uint8_t PIN_IN1, PIN_IN2;

        inline void motorWrite(const uint8_t value1, const uint8_t value2)
        {
            digitalWrite(this->PIN_IN1, value1);
            digitalWrite(this->PIN_IN2, value2);
        }
    } motorLeft{26, 27}, motorRight{19, 18};

    void performMotorDemo()
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
}