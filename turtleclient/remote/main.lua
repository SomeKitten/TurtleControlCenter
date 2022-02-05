local json = require("json")

turtle.util = require("util")

turtle.mobility = require "mobility"
turtle.logistics = require "logistics"
turtle.replicate = require "replicate"
turtle.mine = require "mine"
turtle.logging = require "logging"

turtle.packets = {}

turtle.log_latest = {}

function connection()
    print("Attempting connection...")
    server, fail_msg = http.websocket("ws://server.cutekitten.space:63617")

    if server then
        print("Connected!")

        if fs.exists("/info.txt") then
            pcall(function()
                local f = fs.open("info.txt", "r")
                turtle.mobility.rot = tonumber(f.readLine())
                turtle.mobility.pos = json.decode(f.readLine())
                f.close()
            end)
        end

        if os.getComputerLabel() then
            server.send(os.getComputerLabel())
        else
            server.send("Turtle")
        end

        msg, _ = server.receive()
        load(msg)()

        while true do
            success, err = turtle.logging.update_log(turtle)
            if not success then
                local f = fs.open("err_" .. os.epoch("utc"), "w")
                f.write(err)
                f.close()
                break
            end
        end

        server.close()

        local f = fs.open("/info.txt", "w")
        f.write(turtle.mobility.rot .. "\n")
        f.write(json.encode(turtle.mobility.pos))
        f.close()
    else
        print(fail_msg)
    end
end

while true do
    os.queueEvent("randomEvent")
    os.pullEvent()
    print(pcall(connection))
    print("Lost connection...")

    sleep(5)
end
