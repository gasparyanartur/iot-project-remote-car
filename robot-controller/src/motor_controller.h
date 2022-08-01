#pragma once

#include <Arduino.h>

namespace MotorController
{

    class MotorDC
    {
    public:
        MotorDC(const uint8_t PIN_IN1, const uint8_t PIN_IN2) : PIN_IN1(PIN_IN1), PIN_IN2(PIN_IN2)
        {
        }

        void setup();
        void rotateForward();
        void rotateBackward();
        void rotateStop();

    private:
        const uint8_t PIN_IN1, PIN_IN2;

        inline void motorWrite(const uint8_t value1, const uint8_t value2)
        {
            digitalWrite(this->PIN_IN1, value1);
            digitalWrite(this->PIN_IN2, value2);
        }
    };

    extern MotorDC motorLeft, motorRight;

    void performMotorDemo();

}