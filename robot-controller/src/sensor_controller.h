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
            void getRotationDegrees(char *data);
            void getAccelerationWorld(char *data);
        }

    }
}
