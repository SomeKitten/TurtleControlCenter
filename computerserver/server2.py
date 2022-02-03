import asyncio
import random

import websockets
import aioconsole
import json

import logging


logger = logging.getLogger('websockets')
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())


turtle_names = [
    "Cat",
    "Wyatt",
    "Fredrick III",
    "Bubbles",
    "King Henry VIII",
    "Bambi",
    "Minnie",
    "Maurice",
    "King Julian",
    "Cleveland",
    "Cream Soda",
    "Dumbo",
    "Squatch",
    "Scooby Doo",
    "Bunny: Moo",
    "ELLF: P",
    "Lamar",
    "Fresh Cut Grass",
    "Fresh Cut Hair",
    "Sylvester",
    "Stallone",
    "Snoopy",
    "COVID-19",
    "LinusTechTips",
    "Striped Sweater",
    "Christmas Sweater",
    "Ugly Sweater",
    "<insert name>",
]
used_names = []
available_names = []
turtle_count = 0
commands = {}
block_index = 0

block_set = False

# for name in turtle_names:
#     positions[name] = ["90;0,0,0"]

current_positions = {}

# for name in turtle_names:
#     current_positions[name] = "90;0,0,0"

blocks = []
previnventory = {}
inventory = {}


async def set_block(block):
    global block_index, block_set
    if block[1] != "false":
        for b in blocks:
            if b[0] == block[0]:
                if b[1] != block[1]:
                    blocks.remove(b)
                    blocks.append(block)
                    block_index = max(0, block_index - 1)

                    block_set = True
                    return
                return
        blocks.append(block)

        block_set = True
        return
    return


async def communications(websocket, path):
    try:
        global commands, blocks, block_index, positions, inventory, previnventory, turtle_count, block_set
        print(" > Client connected!")
        print("--", end="")

        client_name = await websocket.recv()

        if client_name == "Controller":
            await websocket.send(json.dumps([["turtles", used_names]]))
            await websocket.recv()

            await websocket.send(json.dumps([["block", blocks]]))
            await websocket.recv()

            await websocket.send(json.dumps([["pos", current_positions]]))
            await websocket.recv()

            await websocket.send(json.dumps([["inventory", inventory]]))
            await websocket.recv()
        elif client_name == "Turtle":
            new_name = random.choice(available_names)
            available_names.remove(new_name)
            used_names.append(new_name)
            client_name = new_name
            print("New turtle's name is: " + new_name)
            await websocket.send("os.setComputerLabel('" + new_name + "')")

            current_positions[client_name] = "90;0,0,0"
        else:
            print("Welcome back, " + client_name + "!")
            if client_name in available_names:
                available_names.remove(client_name)
                used_names.append(client_name)

            if client_name in current_positions:
                await websocket.send("turtle.mobility.rot = " + current_positions[client_name].split(";")[0])
                await websocket.recv()
                await websocket.send("turtle.mobility.pos = {" + current_positions[client_name].split(";")[1] + "}")
                await websocket.recv()
            else:
                current_positions[client_name] = "90;0,0,0"

        while True:
            outbound = []

            if client_name != "Controller":
                # print(current_positions[client_name])

                # outbound = "print('Idle...')"
                outbound = "print(turtle.data.getPos())"
                if len(commands) > 0:
                    if client_name in commands.keys():
                        outbound = commands[client_name]
                        del commands[client_name]
            else:
                if turtle_count < len(used_names):
                    print("> TURTLES")

                    outbound.append(["turtles", used_names])
                    turtle_count = len(used_names)
                if len(blocks) > block_index:
                    print("> BLOCK")

                    outbound.append(["block", [blocks[block_index]]])
                    block_index += 1
                if inventory != previnventory:
                    print("> INVENTORY")

                    outbound.append(["inventory", inventory])

                    for name in inventory:
                        previnventory[name] = inventory[name]
                outbound.append(["pos", current_positions])

                outbound = json.dumps(outbound)
                print("Sending: " + outbound)

            await websocket.send(outbound)

            inbound = await websocket.recv()

            if client_name == "Controller":
                print("Received: " + inbound)
                command = inbound.split(";")
                if len(command) == 2:
                    commands[command[0]] = command[1]
            else:
                block_data = inbound.split(";")

                current_positions[client_name] = block_data[0] + \
                    ";" + block_data[1]

                rot = int(block_data[0])
                pos = block_data[1].split(",")
                pos[0] = int(pos[0])
                pos[1] = int(pos[1])
                pos[2] = int(pos[2])

                block_set = False

                if block_data[2] != "false":
                    await set_block([[pos[0], pos[1] - 1, pos[2]], block_data[2]])
                else:
                    await set_block([[pos[0], pos[1] - 1, pos[2]], "minecraft:air"])
                if block_data[3] != "false":
                    if rot == 0:
                        await set_block([[pos[0] + 1, pos[1], pos[2]], block_data[3]])
                    if rot == 90:
                        await set_block([[pos[0], pos[1], pos[2] + 1], block_data[3]])
                    if rot == 180:
                        await set_block([[pos[0] - 1, pos[1], pos[2]], block_data[3]])
                    if rot == 270:
                        await set_block([[pos[0], pos[1], pos[2] - 1], block_data[3]])
                else:
                    if rot == 0:
                        await set_block([[pos[0] + 1, pos[1], pos[2]], "minecraft:air"])
                    if rot == 90:
                        await set_block([[pos[0], pos[1], pos[2] + 1], "minecraft:air"])
                    if rot == 180:
                        await set_block([[pos[0] - 1, pos[1], pos[2]], "minecraft:air"])
                    if rot == 270:
                        await set_block([[pos[0], pos[1], pos[2] - 1], "minecraft:air"])
                if block_data[4] != "false":
                    await set_block([[pos[0], pos[1] + 1, pos[2]], block_data[4]])
                else:
                    await set_block([[pos[0], pos[1] + 1, pos[2]], "minecraft:air"])

                inventory[client_name] = []
                for i, item in enumerate(block_data[5].split(",")):
                    if i % 2 == 0:
                        inventory[client_name].append([item])
                    else:
                        inventory[client_name][int(i/2)].append(item)

                # TODO make happen only when necessary
                with open("blocks.json", "w") as block_file:
                    data = {
                        "turtles": current_positions,
                        "blocks": blocks
                    }
                    block_file.write(json.dumps(data))
                for block in blocks:
                    if block[0] == pos:
                        await set_block([pos, "minecraft:air"])
    except websockets.exceptions.ConnectionClosed as e:
        print(e)
        print("> Client disconnected!")
        pass


async def main():
    while True:
        command = await aioconsole.ainput("--")
        if command == "stop":
            break


def start():
    global available_names
    global blocks, block_index, positions, current_positions

    available_names = turtle_names

    try:
        with open("blocks.json", "r") as block_file:
            data = json.loads(block_file.read())
            current_positions = data["turtles"]
            blocks = data["blocks"]
            block_index = len(blocks)
    except FileNotFoundError:
        pass

    start_server = websockets.serve(communications, None, 63617, compression=None)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_until_complete(main())

    # asyncio.get_event_loop().run_forever()


start()
