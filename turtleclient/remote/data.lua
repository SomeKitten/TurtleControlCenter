local data = {}

function data.getInventory()
    local log = ""

    for i = 1, 16 do
        local data = turtle.getItemDetail(i)
        if data then
            log = log .. data.name .. "," .. data.count .. ","
        else
            log = log .. "minecraft:air,0,"
        end
    end
    return log:sub(1,-2)
end

function data.getPos()
    return turtle.mobility.pos[1] .. ","
        .. turtle.mobility.pos[2] .. ","
        .. turtle.mobility.pos[3]
end

function getBlock(detect)
    local isblock, data = detect()

    if isblock then
        return data.name
    else
        return "false"
    end
end

function data.getBlocks()
    return getBlock(turtle.inspectDown) .. ";"
        .. getBlock(turtle.inspect) .. ";"
        .. getBlock(turtle.inspectUp)
end

return data
