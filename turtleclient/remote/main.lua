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

    while true do turtle.logging.update_log(turtle) end

    server.close()

    local f = fs.open("/info.txt", "w")
    f.write(turtle.mobility.rot .. "\n")
    f.write(json.encode(turtle.mobility.pos))
    f.close()
end

connection()
