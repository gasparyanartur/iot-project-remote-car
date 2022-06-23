import websockets as ws
import asyncio

sockets = dict()


async def robot_handler(socket):
    global sockets
    sockets[socket] = len(sockets)

    print(f"Client connected with id: {sockets[socket]}")
    async for msg in socket:
        print("got message", list(msg))

        if msg[-1] == '\n':
            msg = msg[:-1]

        if msg[-1] == '\r':
            msg = msg[:-1]

        if msg == "cam":
            await socket.send("cam")

            resp = await socket.recv()

            if resp == "fail":
                continue

            with open('cam_img.jpg', 'wb') as file:
                file.write(await socket.recv())

        else:
            print(msg, end='' if msg[-1] == '\n' else '\n')


async def interface_handler(socket):
    ...


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
