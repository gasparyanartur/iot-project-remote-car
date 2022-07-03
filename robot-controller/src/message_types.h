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
    }

    namespace RequestType
    {
        const byte Data = 1;
    }

    namespace StatusType
    {
        const byte OK = 1;
        const byte FAIL = 2;
    }

}