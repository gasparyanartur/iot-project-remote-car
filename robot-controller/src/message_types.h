#pragma once

#include <stdint.h>

namespace MessageHeader
{

    namespace MessageType
    {
        const byte Request = 0;
        const byte Status = 1;
        const byte Data = 2;
        const byte Command = 3;
    }

    namespace DataType
    {
        const byte Image = 1;
        const byte Measurement = 2;
    }

    namespace RequestType
    {
        const byte Data = 1;
    }

    namespace CommandType
    {
        const byte Move = 1;
    }

    namespace MotorSelection 
    {
        const byte First = 1;
        const byte Second = 2;
        const byte FirstAndSecond = 3;
    }

    namespace MoveDirection 
    {
        const byte None = 0;
        const byte Forward = 1;
        const byte Backward = 2;
    }

    namespace StatusType
    {
        const byte OK = 1;
        const byte FAIL = 2;
    }

    namespace MeasurementType
    {
        const byte Rotation = 1;
        const byte Acceleration = 2;
        const byte Gravity = 3;
    }

    namespace RotationUnit
    {
        const byte Quaternions = 1;
        const byte Radians = 2;
        const byte Degrees = 3;
    }

    namespace AccelerationType
    {
        const byte Raw = 1;
        const byte Relative = 2;
        const byte World = 3;
    }

}