import asyncio
import websockets as ws


async def hi():
    uri = "ws://192.168.1.104:8001"
    print("connecting")
    async for socket in  ws.connect(uri):
        print("connected")
        cmd = input("cmd: ")
        if cmd == "kitty":
            print("sending kitty")
            with open('cat.jpg', 'rb') as cat_img:
                await socket.send("cat")
                resp = await socket.recv()
                print("response")
                if resp == "ok":
                    i = 0
                    while chunk := cat_img.read(1024):
                        print("sending chunk", i)
                        i += 1
                        await socket.send(chunk)

                    await socket.send("cat done")

        else:
            await socket.send(cmd)



asyncio.run(hi())