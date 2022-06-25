from __future__ import annotations

from typing import Callable
import websockets
import asyncio
import struct

MessageType = str | bytes
SocketType = websockets.WebSocketServerProtocol

TestType = Callable[['Connection', SocketType, MessageType], bool]
CallbackType = Callable[['Connection', SocketType, MessageType], None]


class ClientNames:
    __slots__ = tuple()

    interface: str = "interface"
    robot: str = "robot"


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


def do_nothing() -> None:
    ...


def is_binary_header(msg: MessageType, msg_type: int) -> bool:
    return len(msg) > 0 and isinstance(msg, bytes) and msg[0] == msg_type


def print_incoming_message(conn: 'Connection', msg: MessageType) -> None:
    print(f">> {conn.name}: {msg}")


def load_example_img():
    with open('cat.jpg', 'rb') as img:
        return img.read()


class Callback:
    def __init__(self,
                 condition: TestType,
                 callback: CallbackType
                 ) -> None:
        self.condition: TestType = condition
        self.callback: CallbackType = callback

    def test(self,
             connection: Connection,
             msg: MessageType
             ) -> bool:
        return self.condition(connection, msg)

    async def execute(self,
                      connection: Connection,
                      msg: MessageType
                      ) -> None:
        self.callback(connection, msg)


class Connection:
    __slots__ = ('mailbox_out', 'mailbox_in', 'name', 'ip',
                 'port', 'poll_time', 'callbacks', 'state', 'socket')

    def __init__(self,
                 name: str,
                 ip: str,
                 port: int,
                 state: dict[str, any],
                 callbacks: list[Callback],
                 poll_time: float = 0.02
                 ) -> None:

        self.mailbox_out: list[MessageType] = []
        self.mailbox_in: list[MessageType] = []

        self.name: str = name
        self.ip: str = ip
        self.port: int = port
        self.poll_time: float = poll_time

        self.callbacks: list[Callback] = callbacks
        self.state: dict[str, any] = state

        self.socket: SocketType = None

    async def start(self) -> None:
        async with websockets.serve(self._handler, self.ip, self.port):
            await asyncio.Future()

    def buffer(self, message: MessageType) -> None:
        self.mailbox_out.append(message)

    async def _handler(self, socket: SocketType) -> None:
        self.socket = socket
        print(f"Opened connection with {self.name}")

        while True:
            try:
                await self._event_frame()

            except websockets.ConnectionClosedOK:
                print(f"Connection with {self.name} closed")
                await self._on_close()
                break

    async def _event_frame(self) -> None:
        if self.mailbox_out:
            await self.socket.send(self.mailbox_out.pop())
            return

        msg = await self._get_message()
        if not msg:
            return

        if isinstance(msg, str):
            msg = msg.strip()

        await self._handle_message(msg)

    async def _get_message(self) -> MessageType | None:
        if self.mailbox_in:
            return self.mailbox_in.pop()

        try:
            return await asyncio.wait_for(self.socket.recv(), self.poll_time)

        except asyncio.TimeoutError:
            return None

    async def _handle_message(self, message: MessageType) -> None:
        for cb in self.callbacks:
            if cb.test(self, message):
                await cb.execute(self, message)

    async def _on_close(self):
        self.socket.reconnect()


def connection_factory():
    connections: dict[str, Connection] = {}
    state = {
        "waiting_for_img": False
    }

    def robot_connection_factory(
        conns: dict[str, Connection]
    ) -> Connection:
        robot_conn = Connection(
            ClientNames.robot,
            "192.168.1.104",
            8002,
            state,
            [
                Callback(
                    lambda c, m: (
                        c.state['waiting_for_img'] and
                        isinstance(m, bytes) and
                        len(m) >= 2 and
                        m[0] == MessageTypes.data and
                        m[1] == DataTypes.image
                    ),
                    lambda c, m: (
                        conns[ClientNames.interface].buffer(m)

                        if conns[ClientNames.interface].socket.open
                        else do_nothing()
                    )
                ),
                Callback(
                    lambda c, m: isinstance(m, str),
                    lambda c, m: print_incoming_message(c, m)
                ),
                Callback(
                    lambda c, m: True,
                    lambda c, m: print(f"Debug: {m}")
                ),
            ],
        )

        return robot_conn

    def interface_connection_factory(
        conns: dict[str, Connection]
    ) -> Connection:

        inter_conn = Connection(
            ClientNames.interface,
            "192.168.1.104",
            8001,
            state,
            [
                Callback(
                    lambda c, m: isinstance(m, str),
                    lambda c, m: print_incoming_message(c, m)
                ),
                Callback(
                    lambda c, m: (
                        not state['waiting_for_img'] and
                        isinstance(m, bytes) and
                        len(m) >= 2 and
                        m[0] == MessageTypes.request and
                        m[1] == RequestTypes.data and
                        m[2] == DataTypes.image
                    ),
                    lambda c, m: (
                        print("bout to request some images..."),
                        img := load_example_img(),
                        msg := struct.pack(f"!BB{len(img)}s",
                                           MessageTypes.data,
                                           DataTypes.image,
                                           img
                                           ),
                        conns[ClientNames.interface].buffer(msg)
                    )
                ),
                Callback(
                    lambda c, m: True,
                    lambda c, m: print(f"Debug: {m}")
                ),
            ],
        )

        return inter_conn

    robot_conn = robot_connection_factory(connections)
    inter_conn = interface_connection_factory(connections)

    connections[ClientNames.robot] = robot_conn
    connections[ClientNames.interface] = inter_conn

    return connections


def initiate_server():
    connections = connection_factory()

    event_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(event_loop)

    routines = [
        connections[ClientNames.robot].start(),
        connections[ClientNames.interface].start()
    ]
    try:
        event_loop.run_until_complete(asyncio.gather(*routines))
    except DeprecationWarning:
        ...


def main():
    initiate_server()


if __name__ == "__main__":
    main()
