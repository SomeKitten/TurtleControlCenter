local json = require("json")

local logging = {}

logging.log_latest = ""

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

function logging.log(turtle, message)
    print(message)
    turtle.logging.log_latest = "[" ..
                                    textutils.formatTime(os.time("local"), true) ..
                                    "] " .. message
    turtle.logging.update_log()
    turtle.logging.log_latest = ""
end

function logging.update_log(turtle)
    return pcall(function()
        if turtle.logging.log_latest ~= "" then
            local f = fs.open("latest.log", "a")
            f.write(turtle.logging.log_latest .. "\n")
            f.close()
            turtle.logging.log_latest = ""
        end

        info = json.encode({
            pos = turtle.mobility.pos,
            rot = turtle.mobility.rot,
            blocks = turtle.logging.getBlocks(),
            inventory = turtle.logging.getInventory(),
            log = turtle.logging.log_latest
        })

        server.send(info)
        msg, _ = server.receive()
        load(msg)()
    end)
end

return logging
