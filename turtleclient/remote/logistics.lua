local logistics = {}

logistics.stop = false
logistics.reproduce = false

function logistics.placeUp(turtle)
    local oldSelect = turtle.getSelectedSlot()
    while turtle.detectUp() do
        turtle.select(1)
        if not turtle.mobility.digUp(turtle) then
            turtle.select(oldSelect)
            return false
        end
    end
    turtle.select(oldSelect)
    turtle.placeUp()
    return true
end

function logistics.place(turtle)
    local oldSelect = turtle.getSelectedSlot()
    while turtle.detect() do
        turtle.select(1)
        if not turtle.mobility.dig(turtle) then
            turtle.select(oldSelect)
            return false
        end
    end
    turtle.select(oldSelect)
    turtle.place()
    return true
end

function logistics.placeDown(turtle)
    local oldSelect = turtle.getSelectedSlot()
    while turtle.detectDown() do
        turtle.select(1)
        if not turtle.mobility.digDown(turtle) then
            turtle.select(oldSelect)
            return false
        end
    end
    turtle.select(oldSelect)
    turtle.placeDown()
    return true
end

function logistics.count(turtle, type)
    local count = 0
    for i = 1, 16 do
        if turtle.getItemCount(i) ~= 0 and turtle.getItemDetail(i).name == type then
            count = count + turtle.getItemCount(i)
        end
    end
    return count
end

function logistics.countAll(turtle)
    local types = {}
    for i = 1, 16 do
        if turtle.getItemCount(i) ~= 0 and
            not types[turtle.getItemDetail(i).name] then
            types[turtle.getItemDetail(i).name] = true
        end
    end

    for type, _ in pairs(types) do
        types[type] = logistics.count(turtle, type)
    end

    return types
end

function logistics.clearWaste(turtle)
    turtle.logging.log(turtle, "Clearing inventory!")

    local oldPos = {
        turtle.mobility.pos[1], turtle.mobility.pos[2], turtle.mobility.pos[3]
    }
    local oldRot = turtle.mobility.rot

    turtle.mobility.home(turtle)

    local cobblestoneStack = false
    local redstoneStack = false
    if turtle.logistics.reproduce then
        for i = 2, 16 do
            if turtle.getItemCount(i) > 0 and
                not ((name == "minecraft:cobblestone" and not cobblestoneStack) or
                    (name == "minecraft:redstone" and not redstoneStack) or name ==
                    "minecraft:iron_ore") then
                local name = turtle.getItemDetail(i).name
                if name == "minecraft:cobblestone" or
                    turtle.getItemDetail(i, true).tags["forge:stone"] then
                    turtle.logging.log(turtle, "Trashed " .. name)
                    turtle.select(i)
                    turtle.drop()
                else
                    turtle.logging.log(turtle, "Stored " .. name)
                    turtle.select(i)
                    turtle.dropDown()
                end
            end
            if turtle.getItemCount(i) > 0 and name == "minecraft:cobblestone" then
                cobblestoneStack = true
            end
            if turtle.getItemCount(i) > 0 and name == "minecraft:redstone" then
                redstoneStack = true
            end
        end
    else
        for i = 2, 16 do
            if turtle.getItemCount(i) > 0 then
                local name = turtle.getItemDetail(i).name
                if name == "minecraft:cobblestone" or name == "minecraft:gravel" or
                    name == "minecraft:dirt" or
                    turtle.getItemDetail(i, true).tags["forge:stone"] then
                    turtle.logging.log(turtle, "Trashed " .. name)
                    turtle.select(i)
                    turtle.drop()
                else
                    turtle.logging.log(turtle, "Stored " .. name)
                    turtle.select(i)
                    turtle.dropDown()
                end
            end
        end
    end

    logistics.sort()

    turtle.mobility.moveto(turtle, oldPos)
    turtle.mobility.turnDeg(turtle, oldRot)
end

function logistics.sort()
    local emptySpaces = {}

    for i = 2, 16 do
        if turtle.getItemCount(i) == 0 then table.insert(emptySpaces, i) end
    end

    if #emptySpaces == 0 then
        turtle.logging.log(turtle, "FULL")
        turtle.logistics.stop = true
    end
    while #emptySpaces > 0 do
        if logistics.sorted(turtle) then break end

        for i = 16, 2, -1 do
            if turtle.getItemCount(i) > 0 then
                turtle.select(i)
                turtle.transferTo(emptySpaces[1])
                table.remove(emptySpaces, 1)
                break
            end
        end
    end

    turtle.select(1)
end

function logistics.deposit(turtle)
    local cobblestoneStack = false
    for i = 2, 16 do
        if turtle.getItemCount(i) > 0 and
            not ((turtle.getItemDetail(i).name == "minecraft:cobblestone" and
                not cobblestoneStack) or turtle.getItemDetail(i).name ==
                "minecraft:iron_ore" or turtle.getItemDetail(i).name ==
                "minecraft:redstone") then
            turtle.select(i)
            turtle.drop()
        end
        if turtle.getItemCount(i) > 0 and turtle.getItemDetail(i).name ==
            "minecraft:cobblestone" then cobblestoneStack = true end
    end
end

function logistics.sorted(turtle)
    local isEmpty = false
    local sorted = true
    for i = 2, 16 do
        if turtle.getItemCount(i) == 0 then isEmpty = true end
        if isEmpty and turtle.getItemCount(i) > 0 then sorted = false end
    end
    return sorted
end

function logistics.find(item)
    for i = 1, 16 do
        if turtle.getItemDetail(i) ~= nil and turtle.getItemDetail(i).name ==
            item then return i end
    end
end

function logistics.refuel()
    if turtle.getFuelLevel() == 0 and logistics.find("minecraft:coal") ~= nil then
        turtle.select(logistics.find("minecraft:coal"))
        turtle.refuel(1)
    end
    while turtle.getFuelLevel() == 0 do
        turtle.logging.log(turtle, "REFUEL ME!")

        os.queueEvent("randomEvent")
        os.pullEvent()

        if logistics.find("minecraft:coal") ~= nil then
            turtle.select(logistics.find("minecraft:coal"))
            turtle.refuel(1)
        end
    end
end

return logistics
