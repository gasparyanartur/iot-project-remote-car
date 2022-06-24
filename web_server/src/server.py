import websockets as ws
import asyncio

# sockets = dict()

# robot_server = None
# interface_server = None
sockets = [None, None]
robot_index = 0
interface_index = 1


class Callback:
    def __init__(self, condition, callback) -> None:
        self.condition = condition
        self.callback = callback

    def test(self, msg) -> bool:
        return self.condition(msg)

    async def execute(self, socket, msg) -> any:
        await self.callback(socket, msg)


async def handler(socket, name, socket_index, on_close, string_callbacks: list[Callback], binary_callbacks: list[Callback]):
    # TODO: Refactor handler to classes
    global sockets

    sockets[socket_index] = socket
    print(f"Client ({name}, {socket_index}) connected")

    while True:
        try:
            msg = await socket.recv()

            if isinstance(msg, str):
                msg = msg.strip()

                found = False
                for cb in string_callbacks:
                    if cb.test(msg):
                        await cb.execute(socket, msg)
                        found = True
                        break

                if found:
                    continue

                print(f">> {name}: {msg}")

            elif isinstance(msg, bytes):
                ...
                # TODO: Handle that

        except ws.ConnectionClosedOK:
            print(f"Connection with {name} closed")
            on_close()
            break


async def robot_cam_callback(socket, msg):
    await socket.send("cam")

    res = await socket.recv()

    if res == "fail":
        print("Could not receive camera frame")
        return

    elif res != "ok":
        print(f"Received invalid status message {res}")
        return

    with open('cam_img.jpg', 'wb') as file:
        file.write(await socket.recv())


async def interface_cam_callback(socket, msg):
    robot_socket = sockets[robot_index]
    if not robot_socket or robot_socket.closed:
        await socket.send("fail")
        return

    await robot_socket.send("/cam")
    resp = await socket.recv()

    if resp == "fail":
        await socket.send("fail")
        return

    else:
        socket.send("ok")

    await socket.send(await robot_socket.recv())


robot_cam_request = Callback(
    lambda msg: msg == "/cam",
    robot_cam_callback
)


interface_cam_request = Callback(
    lambda msg: msg == "/cam",
    interface_cam_callback
)

async def robot_handler(socket):
    await handler(socket, "robot", 0, None, [robot_cam_request], [])


async def interface_handler(socket):
    await handler(socket, "interface", 1, None, [interface_cam_request], [])


async def start_robot_server():
    print("Robot server running")

    async with ws.serve(robot_handler, "192.168.1.104", 8001):
        await asyncio.Future()


async def start_interface_server():
    print("Interface server running")

    async with ws.serve(interface_handler, "192.168.1.104", 8002):
        await asyncio.Future()


def start_server():
    event_loop = asyncio.get_event_loop()
    routines = [start_robot_server(), start_interface_server()]
    event_loop.run_until_complete(asyncio.gather(*routines))


if __name__ == "__main__":
    start_server()
