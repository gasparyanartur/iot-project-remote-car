import websockets as ws
import asyncio

# sockets = dict()

# robot_server = None
# interface_server = None
sockets = [None, None]
robot_index = 0
interface_index = 1

timeout = 0.02

mailbox_out = {
    robot_index: [],
    interface_index: [],
}

mailbox_in = {
    robot_index: [],
    interface_index: [],
}

state = {
    "waiting_for_image": False
}


class Callback:
    def __init__(self, condition, callback) -> None:
        self.condition = condition
        self.callback = callback

    def test(self, socket, state, msg) -> bool:
        return self.condition(socket, state, msg)

    async def execute(self, socket, msg) -> any:
        await self.callback(socket, msg)


async def handler(socket, name, socket_index, on_close, string_callbacks: list[Callback], binary_callbacks: list[Callback]):
    # TODO: Refactor handler to classes
    global sockets
    global mailbox_out
    global state

    sockets[socket_index] = socket
    mb_out = mailbox_out[socket_index]
    mb_in = mailbox_in[socket_index]

    print(f"Client ({name}, {socket_index}) connected")

    while True:
        # TODO: Dear god please refactor
        try:
            if mb_out:
                await socket.send(mb_out.pop())
                continue

            if mb_in:
                msg = mb_in.pop()

            else:
                try:
                    msg = await asyncio.wait_for(socket.recv(), timeout)
                except asyncio.TimeoutError:
                    continue

            if isinstance(msg, str):
                msg = msg.strip()

                found = False
                for cb in string_callbacks:
                    if cb.test(socket, state, msg):
                        await cb.execute(socket, msg)
                        found = True
                        break

                if found:
                    continue

                print(f">> {name}: {msg}")

            elif isinstance(msg, bytes):
                for cb in binary_callbacks:
                    if cb.test(msg):
                        await cb.execute(socket, msg)
                        break

                ...
                # TODO: Handle that

        except ws.ConnectionClosedOK:
            print(f"Connection with {name} closed")
            on_close()
            break


async def robot_img_callback(socket, msg):
    print("Received image, storing to files")
    with open('cam_img.jpg', 'wb') as file:
        file.write(msg[1:])


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


async def robot_img_test(socket, state, msg):
    return state["waiting_for_image"] and msg[0] == 2


async def interface_cam_test(socket, state, msg):
    return msg == "/cam"


robot_cam_request = Callback(
    interface_cam_test,
    robot_img_callback
)


interface_cam_request = Callback(
    lambda msg: msg == "/cam",
    interface_cam_callback
)


async def robot_handler(socket):
    await handler(socket, "robot", 0, None, [], [robot_cam_request])


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
