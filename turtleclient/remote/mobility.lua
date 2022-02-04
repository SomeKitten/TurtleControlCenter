local mobility = {}
mobility.pos = {0, 0, 0}
mobility.rot = 90

local function report(turtle)
    if turtle.getItemCount(16) == 0 then
        local has_block, data = turtle.inspectDown()
        if has_block and
            (data.tags["forge:ores"] or string.find(data.name, "ore", 1, true)) then
            turtle.mobility.digDown(turtle)
        end

        local has_block, data = turtle.inspect()
        if has_block and
            (data.tags["forge:ores"] or string.find(data.name, "ore", 1, true)) then
            turtle.mobility.dig(turtle)
        end

        local has_block, data = turtle.inspectUp()
        if has_block and
            (data.tags["forge:ores"] or string.find(data.name, "ore", 1, true)) then
            turtle.mobility.digUp(turtle)
        end
    end

    pcall(function()
        info = turtle.mobility.rot .. ";" .. turtle.data.getPos() .. ";" ..
                   turtle.data.getBlocks() .. ";" .. turtle.data.getInventory()
        server.send(info)
        msg, _ = server.receive()
    end)
end

function mobility.turnLeft(turtle)
    turtle.turnLeft()
    mobility.rot = mobility.rot + 90
    if mobility.rot == 360 then mobility.rot = 0 end
    report(turtle)
end

function mobility.turnRight(turtle)
    turtle.turnRight()
    mobility.rot = mobility.rot - 90
    if mobility.rot == -90 then mobility.rot = 270 end
    report(turtle)
end

function mobility.turnDeg(turtle, deg)
    local delta = deg - mobility.rot
    while delta < 0 do delta = delta + 360 end
    if delta == 90 then
        mobility.turnLeft(turtle)
    else
        while mobility.rot ~= deg do mobility.turnRight(turtle) end
    end
    report(turtle)
end

function equipPick()
    if reason == "No tool to dig with" then
        turtle.select(turtle.logistics.find("minecraft:diamond_pickaxe"))
        turtle.equipRight()
        turtle.dig()
    end
end

function mobility.dig(turtle)
    local has_block, data = turtle.inspect()

    if has_block and
        (data.name == "minecraft:bedrock" or data.name ==
            "enderstorage:ender_chest" or data.name ==
            "forbidden_arcanus:stella_arcanum" or
            string.find(data.name, "computercraft", 1, true)) then
        return false
    end

    candig, reason = turtle.dig()
    if not candig then equipPick() end

    return true
end

function mobility.digUp(turtle)
    local has_block, data = turtle.inspectUp()

    if has_block and
        (data.name == "minecraft:bedrock" or data.name ==
            "enderstorage:ender_chest" or data.name ==
            "forbidden_arcanus:stella_arcanum" or
            string.find(data.name, "computercraft", 1, true)) then
        return false
    end

    candig, reason = turtle.digUp()
    if not candig then equipPick() end

    return true
end

function mobility.digDown(turtle)
    local has_block, data = turtle.inspectDown()

    if has_block and
        (data.name == "minecraft:bedrock" or data.name ==
            "enderstorage:ender_chest" or data.name ==
            "forbidden_arcanus:stella_arcanum" or
            string.find(data.name, "computercraft", 1, true)) then
        return false
    end

    candig, reason = turtle.digDown()
    if not candig then equipPick() end

    return true
end

local function forwardGPS(turtle)
    if mobility.rot == 0 then mobility.pos[1] = mobility.pos[1] + 1 end
    if mobility.rot == 90 then mobility.pos[3] = mobility.pos[3] + 1 end
    if mobility.rot == 180 then mobility.pos[1] = mobility.pos[1] - 1 end
    if mobility.rot == 270 then mobility.pos[3] = mobility.pos[3] - 1 end
end

local function backGPS(turtle)
    if mobility.rot == 0 then mobility.pos[1] = mobility.pos[1] - 1 end
    if mobility.rot == 90 then mobility.pos[3] = mobility.pos[3] - 1 end
    if mobility.rot == 180 then mobility.pos[1] = mobility.pos[1] + 1 end
    if mobility.rot == 270 then mobility.pos[3] = mobility.pos[3] + 1 end
end

local function upGPS(turtle) mobility.pos[2] = mobility.pos[2] + 1 end

local function downGPS(turtle) mobility.pos[2] = mobility.pos[2] - 1 end

function mobility.forward(turtle)
    turtle.logistics.refuel()

    while not turtle.forward() do if not mobility.dig(turtle) then return end end

    forwardGPS(turtle)

    report(turtle)
end

function mobility.back(turtle)
    turtle.logistics.refuel()

    if not turtle.back() then
        mobility.turnLeft(turtle)
        mobility.turnLeft(turtle)
        mobility.forward(turtle)
        mobility.turnLeft(turtle)
        mobility.turnLeft(turtle)
    else
        backGPS(turtle)
    end

    report(turtle)
end

function mobility.up(turtle)
    turtle.logistics.refuel()

    while not turtle.up() do if not mobility.digUp(turtle) then return end end

    upGPS(turtle)

    report(turtle)
end

function mobility.down(turtle)
    turtle.logistics.refuel()

    while not turtle.down() do
        if not mobility.digDown(turtle) then return end
    end

    downGPS(turtle)

    report(turtle)
end

function mobility.moveto(turtle, newPos)
    print("Coming from: " .. turtle.mobility.pos[1] .. "," ..
              turtle.mobility.pos[2] .. "," .. turtle.mobility.pos[3])
    if newPos[1] > mobility.pos[1] then
        while mobility.pos[1] < newPos[1] do
            mobility.turnDeg(turtle, 0)
            mobility.forward(turtle)
        end
    end
    if newPos[1] < mobility.pos[1] then
        while mobility.pos[1] > newPos[1] do
            mobility.turnDeg(turtle, 180)
            mobility.forward(turtle)
        end
    end
    if newPos[2] > mobility.pos[2] then
        while mobility.pos[2] < newPos[2] do mobility.up(turtle) end
    end
    if newPos[2] < mobility.pos[2] then
        while mobility.pos[2] > newPos[2] do mobility.down(turtle) end
    end
    if newPos[3] > mobility.pos[3] then
        while mobility.pos[3] < newPos[3] do
            mobility.turnDeg(turtle, 90)
            mobility.forward(turtle)
        end
    end
    if newPos[3] < mobility.pos[3] then
        while mobility.pos[3] > newPos[3] do
            mobility.turnDeg(turtle, 270)
            mobility.forward(turtle)
        end
    end
end

function mobility.home(turtle)
    print("Returning home!")
    mobility.moveto(turtle, {0, 0, 0})
    -- mobility.turnDeg(turtle, 90)
end

return mobility
