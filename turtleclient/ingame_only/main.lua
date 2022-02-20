local json = require("json")

turtle.util = require("util")

turtle.mobility = require "mobility"
turtle.logistics = require "logistics"
turtle.replicate = require "replicate"
turtle.mine = require "mine"
turtle.logging = require "logging"

turtle.packets = {}

if fs.exists("/info.txt") then
    pcall(function()
        local f = fs.open("/info.txt", "r")
        turtle.mobility.rot = tonumber(f.readLine())
        turtle.mobility.pos = json.decode(f.readLine())
        f.close()
    end)
end

