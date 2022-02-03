import os
import turtle
from aiohttp import web
import aiohttp
import json

from click import command
from numpy import block

turtles = []
turtle_names = {}
turtle_positions = {}
turtle_items = {}
update_inventory = False
blocks = {}
blocks_update = []
commands = {}
controller = None


def process_turtle(ws, msg):
    global controller, update_inventory, blocks_update
    if len(msg) == 1:
        if msg[0] == "Controller":
            controller = ws

            for place in blocks.keys():
                blocks_update.append([json.loads(place), blocks[place]])

            return json.dumps([["blocks", blocks_update]])

        turtles.append(msg[0])
        turtle_names[ws] = msg[0]
        commands[msg[0]] = []
        print("New turtle connected")
        print("Turtles:", turtles)
        return 'print("Nothing to do...")'

    # print("Received: {}".format(msg))
    turtle_positions[turtle_names[ws]] = [msg[0] + ";" + msg[1]]

    items_old = msg[5].split(",")
    items = []
    for i in range(16):
        items.append([items_old[i * 2], items_old[i * 2 + 1]])
    if turtle_names[ws] not in turtle_items or turtle_items[turtle_names[ws]] != items:
        update_inventory = True
    turtle_items[turtle_names[ws]] = items

    pos = msg[1].split(",")

    down_pos = [int(pos[0]), int(pos[1]) - 1, int(pos[2])]
    if msg[2] != "false" and str(down_pos) not in blocks.keys():
        blocks_update.append(
            [down_pos, msg[2]])

    if msg[0] == "0":
        forward_pos = [int(pos[0]) + 1, int(pos[1]), int(pos[2])]
        if msg[3] != "false" and str(forward_pos) not in blocks.keys():
            blocks_update.append(
                [forward_pos, msg[3]])
    if msg[0] == "90":
        forward_pos = [int(pos[0]), int(pos[1]), int(pos[2]) + 1]
        if msg[3] != "false" and str(forward_pos) not in blocks.keys():
            blocks_update.append(
                [forward_pos, msg[3]])
    if msg[0] == "180":
        forward_pos = [int(pos[0]) - 1, int(pos[1]), int(pos[2])]
        if msg[3] != "false" and str(forward_pos) not in blocks.keys():
            blocks_update.append(
                [forward_pos, msg[3]])
    if msg[0] == "270":
        forward_pos = [int(pos[0]), int(pos[1]), int(pos[2]) - 1]
        if msg[3] != "false" and str(forward_pos) not in blocks.keys():
            blocks_update.append(
                [forward_pos, msg[3]])

    up_pos = [int(pos[0]), int(pos[1]) + 1, int(pos[2])]
    if msg[4] != "false" and str(up_pos) not in blocks.keys():
        blocks_update.append(
            [up_pos, msg[4]])

    for block in blocks_update:
        blocks[str(block[0])] = block[1]

    send = 'print("Nothing to do...")'
    if len(commands[turtle_names[ws]]) > 0:
        send = commands[turtle_names[ws]].pop(0)
    # print("Sending: {}".format(send))
    return send


def process_controller(ws, msg):
    global update_inventory, blocks_update
    # print("Received: {}".format(msg))

    if len(msg) > 1 and len(commands[msg[0]]) < 1:
        # print("Adding command: {}".format(msg))
        commands[msg[0]].append(msg[1])

    to_send = [
        ["turtles", turtles],
        ["pos", turtle_positions],
    ]
    if update_inventory:
        to_send.append(["inventory", turtle_items])
        update_inventory = False
    if len(blocks_update) > 0:
        to_send.append(["block", blocks_update])
        blocks_update = []
        with open("blocks.json", "w") as f:
            json.dump(blocks, f)

    send = json.dumps(to_send)
    # print("Sending: {}".format(send))
    return send


if os.path.isfile("blocks.json"):
    with open("blocks.json", "r") as f:
        blocks = json.load(f)

# turtles.remove(turtle_names[ws])
# turtle_names.pop(ws)
# print("Turtle disconnected")
# print("Turtles:", turtles)


async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            if controller == ws:
                await ws.send_str(process_controller(ws, str.split(msg.data, ';')))
            else:
                await ws.send_str(process_turtle(ws, str.split(msg.data, ';')))
        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('ws connection closed with exception %s' %
                  ws.exception())
    print('websocket connection closed')
    return ws

app = web.Application()
app.add_routes([web.get("/", websocket_handler)])

web.run_app(app, port=63617)
