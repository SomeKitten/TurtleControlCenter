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
    turtle.logging.log_latest = "[" .. os.date("%D %R") .. "] " .. message
    turtle.logging.update_log(turtle)
end

function logging.update_pos(turtle)
    local f = fs.open("/info.txt", "w")
    f.write(turtle.mobility.rot .. "\n")
    f.write(json.encode(turtle.mobility.pos))
    f.close()
end

function logging.update_log(turtle)
    if turtle.logging.log_latest ~= "" then
        local f = fs.open("latest.log", "a")
        f.write(turtle.logging.log_latest .. "\n")
        f.close()
    end

    turtle.logging.log_latest = ""

    turtle.logging.update_pos(turtle)
end

return logging
