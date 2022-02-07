import asyncio
import os
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
connected_turtles = []
used_names = []
available_names = []
turtle_count = 0
commands = {}
block_index = 0

current_positions = {}

blocks = []
previnventory = {}
inventory = {}

stopping = False


async def set_block(block):
    global block_index
    for b in blocks:
        if b[0] == block[0]:
            if b[1] != block[1]:
                blocks.remove(b)
                blocks.append([block[0], "minecraft:air"])
                block_index = max(0, block_index - 1)
            else:
                return
    blocks.append(block)
    return


async def communications(websocket, path):
    try:
        global commands, blocks, block_index, positions, inventory, previnventory, turtle_count
        print(" > Client connected!")

        client_name = await websocket.recv()

        if client_name == "Controller":
            blocks = list(filter(lambda b: b[1] != "minecraft:air", blocks))
            block_index = len(blocks)
            await websocket.send(json.dumps({
                "turtles": used_names,
                "blocks": blocks,
                "pos": current_positions,
                "inventory": inventory,
            }))
            await websocket.recv()
        elif client_name == "Turtle":
            new_name = random.choice(available_names)
            available_names.remove(new_name)
            used_names.append(new_name)
            client_name = new_name
            print("New turtle's name is: " + new_name)
            await websocket.send("os.setComputerLabel('" + new_name + "')")

            current_positions[client_name] = {
                "rot": 90,
                "pos": [0, 0, 0],
            }

            connected_turtles.append(client_name)

            if not os.path.exists(client_name):
                os.mkdir(client_name)
        else:
            print("Welcome back, " + client_name + "!")
            if client_name in available_names:
                available_names.remove(client_name)
                used_names.append(client_name)

            if client_name not in current_positions:
                current_positions[client_name] = {
                    "rot": 90,
                    "pos": [0, 0, 0],
                }

            connected_turtles.append(client_name)

            await websocket.send("turtle = turtle")

            if not os.path.exists(client_name):
                os.mkdir(client_name)

        while True:
            inbound = await websocket.recv()

            if client_name == "Controller":
                command = inbound.split(";")
                if len(command) == 2:
                    commands[command[0]] = command[1]
            else:
                data = json.loads(inbound)

                if "pos" in data.keys():
                    current_positions[client_name]["pos"] = data["pos"]
                if "rot" in data.keys():
                    current_positions[client_name]["rot"] = data["rot"]
                if "blocks" in data.keys():
                    await set_block([[current_positions[client_name]["pos"][0], current_positions[client_name]["pos"][1] - 1, current_positions[client_name]["pos"][2]], data["blocks"][0]])

                    if current_positions[client_name]["rot"] == 0:
                        await set_block([[current_positions[client_name]["pos"][0] + 1, current_positions[client_name]["pos"][1], current_positions[client_name]["pos"][2]], data["blocks"][1]])
                    if current_positions[client_name]["rot"] == 90:
                        await set_block([[current_positions[client_name]["pos"][0], current_positions[client_name]["pos"][1], current_positions[client_name]["pos"][2] + 1], data["blocks"][1]])
                    if current_positions[client_name]["rot"] == 180:
                        await set_block([[current_positions[client_name]["pos"][0] - 1, current_positions[client_name]["pos"][1], current_positions[client_name]["pos"][2]], data["blocks"][1]])
                    if current_positions[client_name]["rot"] == 270:
                        await set_block([[current_positions[client_name]["pos"][0], current_positions[client_name]["pos"][1], current_positions[client_name]["pos"][2] - 1], data["blocks"][1]])

                    await set_block([[current_positions[client_name]["pos"][0], current_positions[client_name]["pos"][1] + 1, current_positions[client_name]["pos"][2]], data["blocks"][2]])
                if "inventory" in data.keys():
                    inventory[client_name] = data["inventory"]
                if "log" in data.keys():
                    if data["log"] != "":
                        with open(client_name + "/latest.log", "a") as f:
                            f.write(data["log"] + "\n")

                # TODO turn into database
                with open("blocks.json", "w") as block_file:
                    data = {
                        "turtles": current_positions,
                        "blocks": list(filter(lambda b: b[1] != "minecraft:air", blocks))
                    }
                    block_file.write(json.dumps(data))
                for block in blocks:
                    if block[0] == current_positions[client_name]["pos"]:
                        await set_block([current_positions[client_name]["pos"], "minecraft:air"])

            outbound = {}

            if client_name != "Controller":
                if stopping:
                    await websocket.close()
                    connected_turtles.remove(client_name)
                    break
                outbound = "turtle = turtle"  # noop
                if len(commands) > 0:
                    if client_name in commands.keys():
                        outbound = commands[client_name]
                        del commands[client_name]
            else:
                if turtle_count < len(used_names):
                    outbound["turtles"] = used_names
                    turtle_count = len(used_names)
                while len(blocks) > block_index:
                    outbound["blocks"] = blocks[block_index:]
                    block_index = len(blocks)
                if inventory != previnventory:
                    outbound["inventory"] = inventory

                    for name in inventory:
                        previnventory[name] = inventory[name]
                outbound["pos"] = current_positions

                outbound = json.dumps(outbound)

            await websocket.send(outbound)
    except websockets.exceptions.ConnectionClosed as e:
        print(e)
        print("> Client disconnected!")
        if client_name != "Controller":
            connected_turtles.remove(client_name)
        pass


async def main():
    global stopping
    while True:
        command = await aioconsole.ainput("")
        if command == "stop":
            stopping = True
        while stopping:
            await asyncio.sleep(0.1)
            if len(connected_turtles) == 0:
                print("No turtles connected!\nClosing server...")
                return


def start():
    global available_names, blocks, positions, current_positions, block_index

    available_names = turtle_names

    try:
        with open("blocks.json", "r") as block_file:
            data = json.loads(block_file.read())
            current_positions = data["turtles"]
            blocks = data["blocks"]
            for block in blocks:
                if block[1] == "minecraft:air" or str.startswith(block[1], "computercraft:"):
                    blocks.remove(block)
            block_index = len(blocks)
    except FileNotFoundError:
        pass

    start_server = websockets.serve(
        communications, None, 63617, compression=None)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_until_complete(main())


start()
