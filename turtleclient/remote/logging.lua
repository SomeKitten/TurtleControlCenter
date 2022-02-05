local json = require("json")

local logging = {}

function logging.getInventory()
    local inv = {}

    for i = 1, 16 do
        local data = turtle.getItemDetail(i)
        if data then
            inv[i] = {name = data.name, count = data.count}
        else
            inv[i] = {name = "", count = 0}
        end
    end
    return inv
end

local function getBlock(detect)
    local isblock, data = detect()

    if isblock and not string.find(data.name, "computercraft", 1, true) then
        return data.name
    else
        return "minecraft:air"
    end
end

function logging.getBlocks()
    return {
        getBlock(turtle.inspectDown), getBlock(turtle.inspect),
        getBlock(turtle.inspectUp)
    }
end

function logging.update_log(turtle)
    return pcall(function()
        info = json.encode({
            pos = turtle.mobility.pos,
            rot = turtle.mobility.rot,
            blocks = turtle.logging.getBlocks(),
            inventory = turtle.logging.getInventory(),
            log = turtle.log_latest
        })

        local f = fs.open("latest.log", "a")
        for _, line in ipairs(turtle.log_latest) do
            f.write(
                "[" .. textutils.formatTime(os.time("local"), true) .. "] " ..
                    line .. "\n")
        end

        turtle.log_latest = {}

        server.send(info)
        msg, _ = server.receive()
        load(msg)()
    end)
end

return logging
