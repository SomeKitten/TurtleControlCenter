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

function logging.update_log(turtle)
    if turtle.logging.log_latest ~= "" then
        local f = fs.open("latest.log", "a")
        f.write(turtle.logging.log_latest .. "\n")
        f.close()
    end

    info = json.encode({
        pos = turtle.mobility.pos,
        rot = turtle.mobility.rot,
        blocks = turtle.logging.getBlocks(),
        inventory = turtle.logging.getInventory(),
        log = turtle.logging.log_latest
    })

    turtle.logging.log_latest = ""

    local msg, _

    local a = pcall(function()
        server.send(info)
        msg, _ = server.receive()
    end)
    local connected = a

    if msg == nil then
        if server then server.close() end
        a = false
    end

    if not a then server = false end
    while not a do
        repeat
            sleep(1)
            print("Attempting connection...")
            os.queueEvent("randomEvent")
            os.pullEvent()
            server, fail_msg = http.websocket(
                                   "ws://server.cutekitten.space:63617")
        until server
        a = pcall(function()
            if os.getComputerLabel() then
                server.send(os.getComputerLabel())
            else
                server.send("Turtle")
            end

            msg, _ = server.receive()
        end)
        if msg == nil then a = false end
    end

    if not connected then print("Connected to server.") end

    load(msg)()
end

return logging
