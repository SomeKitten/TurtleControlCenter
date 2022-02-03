local util = require("util")

turtle.data = require "data"
turtle.mobility = require "mobility"
turtle.logistics = require "logistics"
turtle.replicate = require "replicate"
turtle.mine = require "mine"

turtle.packets = {}

function connection()
    print("Attempting connection...")
    server, fail_msg = http.websocket("ws://server.cutekitten.space:63617")

    if server then
        print("Connected!")

        if os.getComputerLabel() then
            server.send(os.getComputerLabel())
        else
            server.send("Turtle")
        end

        while true do
            msg, _ = server.receive()

            load(msg)()

            info = turtle.mobility.rot .. ";" .. turtle.data.getPos() .. ";" ..
                       turtle.data.getBlocks() .. ";" ..
                       turtle.data.getInventory()

            server.send(info)
            -- f = io.open("turtle.info", "w")
            -- f:write(info)
            -- f:close()
        end
    else
        print(fail_msg)
    end
end

if fs.exists("turtle.info") then
    f = io.open("turtle.info", "r")
    info = f:read()
    f:close()

    infot = util.strsplit(info, ";")
    turtle.mobility.rot = tonumber(infot[1])
    turtle.mobility.pos = util.strsplit(infot[2], ",")
end

while true do
    os.queueEvent("randomEvent")
    os.pullEvent()
    print(pcall(connection))
    print("Lost connection...")

    sleep(5)
end
