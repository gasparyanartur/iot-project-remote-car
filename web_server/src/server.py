import websockets as ws
import asyncio


async def handler(socket):
    print("connected")
    async for msg in socket:
        print(msg)
        if msg == "cat":
            print("kitty time")
            await socket.send("ok")

            cat_pieces = []
            while (chunk := await socket.recv()) != "cat done":
                cat_pieces.append(chunk)
            

            with open("saved_cat.jpg", "wb") as new_cat_img:
                for pcs in cat_pieces:
                    new_cat_img.write(pcs)

        else:
            print(msg)

        #await socket.send(f"Hello, {name}")
        #print(">>> hello", name)


async def start():
    async with ws.serve(handler, "192.168.1.104", 8001):
        await asyncio.Future()


def start_server():
    asyncio.run(start())


if __name__ == "__main__":
    start_server()