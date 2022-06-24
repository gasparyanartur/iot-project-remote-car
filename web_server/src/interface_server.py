from __future__ import annotations

from abc import abstractmethod
from typing import Callable
import websockets
import asyncio

MessageType = str | bytes
SocketType = websockets.WebSocketServerProtocol

TestType = Callable[['Connection', SocketType, MessageType], bool]
CallbackType = Callable[['Connection', SocketType, MessageType], None]


class Callback:
    def __init__(self,
                 condition: TestType,
                 callback: CallbackType
                 ) -> None:
        self.condition = condition
        self.callback = callback

    def test(self,
             connection: Connection,
             socket: SocketType,
             msg: MessageType
             ) -> bool:
        return self.condition(connection, socket, msg)

    async def execute(self,
                      connection: Connection,
                      socket: SocketType,
                      msg: MessageType
                      ) -> None:
        await self.callback(connection, socket, msg)


class Connection:
    __slots__ = ('mailbox_out', 'mailbox_in', 'name', 'ip',
                 'port', 'intra_timeout', 'callbacks', 'state')

    def __init__(self,
                 name: str,
                 ip: str,
                 port: int,
                 state: dict[str, any],
                 callbacks: list[Callback],
                 intra_timeout: float = 0.02
                 ) -> None:

        self.mailbox_out: list[MessageType] = []
        self.mailbox_in: list[MessageType] = []

        self.name: str = name
        self.ip: str = ip
        self.port: int = port
        self.intra_timeout: float = intra_timeout

        self.callbacks: list[Callback] = callbacks
        self.state: dict[str, any] = state

    async def start(self) -> None:
        async with websockets.serve(self._handler, self.ip, self.port):
            await asyncio.Future()

    async def _handler(self, socket: SocketType) -> None:
        while True:
            try:
                await self._event_frame(socket)
            except websockets.ConnectionClosedOK:
                print(f"Connection with {self.name} closed")
                await self._on_close()

    async def _event_frame(self, socket: SocketType) -> None:
        msg: MessageType

        if self.mailbox_out:
            await socket.send(self.mailbox_out.pop())
            return

        elif self.mailbox_in:
            msg = self.mailbox_in.pop()

        else:
            try:
                msg = await asyncio.wait_for(socket.recv(), self.intra_timeout)
            except asyncio.TimeoutError:
                return

        if isinstance(msg, str):
            msg = msg.strip()

        self._handle_message(socket, msg)

    async def _handle_message(self,
                              socket: SocketType,
                              message: MessageType) -> None:
        for cb in self.callbacks:
            if cb.test(self, socket, message):
                await cb.execute(self, socket, message)
                return

    @abstractmethod
    async def _on_close(self):
        ...
