class MessageTypes:
    __slots__ = tuple()

    request: int = 0
    status: int = 1
    data: int = 2
    command: int = 3


class RequestTypes:
    __slots__ = tuple()

    data: int = 1


class DataTypes:
    __slots__ = tuple()

    image: int = 1
    measurement: int = 2


class MeasurementType:
    __slots__ = tuple()

    rotation: int = 1
    acceleration: int = 2
    gravity: int = 3


class RotationUnit:
    __slots__ = tuple()

    quaternions: int = 1
    radians: int = 2
    degrees: int = 3


class AccelerationType:
    __slots__ = tuple()

    raw: int = 1
    relative: int = 2
    world: int = 3


class StatusTypes:
    __slots__ = tuple()

    ok: int = 1
    fail: int = 2
