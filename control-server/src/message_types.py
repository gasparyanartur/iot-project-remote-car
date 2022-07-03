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


class StatusTypes:
    __slots__ = tuple()

    ok: int = 1
    fail: int = 2