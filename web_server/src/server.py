import websockets as ws
import asyncio

sockets = dict()


async def handler(socket):
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


async def start():
    print("Server running")
    async with ws.serve(handler, "192.168.1.104", 8001):
        await asyncio.Future()


def start_server():
    asyncio.run(start())


if __name__ == "__main__":
    start_server()
