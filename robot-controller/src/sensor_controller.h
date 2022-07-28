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
            void getRotationDegrees(float deg[3]);
            void getRotationDegrees(char *deg);
        }

    }
}
