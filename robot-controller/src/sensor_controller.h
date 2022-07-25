#pragma once

#include "message_types.h"

void startSensorController();

namespace SensorController
{
    namespace AttitudeController
    {
        void setup();
        void tick();

        namespace Measurement
        {

            union DataType
            {
                float EulerAngle[3];
                Quaternion Quaternion;
                VectorInt16 Acceleration;
                VectorFloat Gravity;
            };

            DataType* getMeasurement(byte msgType, byte msgSpecifier);
        }

    }
}
