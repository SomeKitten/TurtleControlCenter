local json = require("json")

turtle.util = require("util")

turtle.mobility = require "mobility"
turtle.logistics = require "logistics"
turtle.replicate = require "replicate"
turtle.mine = require "mine"
turtle.logging = require "logging"

turtle.packets = {}

local function connection()
    if fs.exists("/info.txt") then
        pcall(function()
            local f = fs.open("/info.txt", "r")
            turtle.mobility.rot = tonumber(f.readLine())
            turtle.mobility.pos = json.decode(f.readLine())
            f.close()
        end)
    end

    while true do
        a, b = pcall(function() turtle.logging.update_log(turtle) end)
        if not a then
            print(b)
            break
        end
    end

    server.close()

    turtle.logging.update_pos(turtle)
end

connection()
