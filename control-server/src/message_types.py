class MessageTypes:
    __slots__ = tuple()

    request: int = 0
    status: int = 1
    data: int = 2
    command: int = 3


class RequestTypes:
    __slots__ = tuple()

    data: int = 1


class CommandTypes:
    __slots__ = tuple()

    move: int = 1
    rotate: int = 2


class RotationDirection:
    __slots__ = tuple()

    right: int = 1
    left: int = 2


class MotorSelection:
    __slots__ = tuple()

    first: int = 1
    second: int = 2
    first_and_second: int = 3


class MoveDirection:
    __slots__ = tuple()

    none: int = 0
    forward: int = 1
    backward: int = 2


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
