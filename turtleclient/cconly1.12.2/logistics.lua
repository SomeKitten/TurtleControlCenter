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
                    turtle.dropUp()
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
                    name == "minecraft:dirt" then
                    turtle.logging.log(turtle, "Trashed " .. name)
                    turtle.select(i)
                    turtle.dropUp()
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

function logistics.find(item, start)
    if start == nil then start = 1 end
    for i = start, 16 do
        if turtle.getItemCount(i) > 0 and turtle.getItemDetail(i).name == item then
            return i
        end
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

function logistics.autoSieve(turtle)
    while true do
        local dropped = false
        local found = turtle.logistics.find("minecraft:gravel")
        if not found then
            found = turtle.logistics.find("exnihilocreatio:block_dust")
        end
        if found then
            turtle.select(found)
            dropped = turtle.drop()
        end
        if not dropped then
            turtle.select(1)
            turtle.suck()
        else
            if turtle.getItemCount(2) == 0 then
                turtle.select(2)
                turtle.mobility.turnRight(turtle)
                turtle.mobility.turnRight(turtle)
                turtle.suck()
                turtle.mobility.turnRight(turtle)
                turtle.mobility.turnRight(turtle)
            end
        end
        if turtle.getItemCount(16) > 0 then
            turtle.mobility.turnRight(turtle)
            for i = 3, 16 do
                turtle.select(i)
                turtle.drop()
            end
            turtle.mobility.turnLeft(turtle)
        end
    end
end

function logistics.layRail(turtle)
    i = 0
    local slot
    while true do
        if i % 8 == 0 then
            slot = turtle.logistics.find("minecraft:redstone_torch")
            if slot then
                turtle.select(slot)
                turtle.logistics.placeUp(turtle)
            end
        end
        if i % 8 == 1 then
            slot = turtle.logistics.find("minecraft:golden_rail")
        else
            slot = turtle.logistics.find("minecraft:rail")
        end
        if not slot then break end
        turtle.select(slot)
        placed = turtle.logistics.place(turtle)
        if not placed then break end
        turtle.mobility.back(turtle)
        i = i + 1
    end
end

function logistics.layBlock(turtle, block)
    i = 0
    local slot
    while true do
        slot = turtle.logistics.find(block)
        if not slot then break end
        turtle.select(slot)
        placed = turtle.logistics.place(turtle)
        while true do
            logistics.refuel()
            if turtle.back() then break end
        end
        i = i + 1
        turtle.logging.log(turtle, "Placed: " .. i)
    end
end

function logistics.craftsetup(turtle, recipefile)
    local recipe = {}

    local file = fs.open(recipefile, "r")
    local line, split, a
    for y = 1, 3 do
        line = file.readLine()
        if line ~= nil then
            split = turtle.util.strsplit(line .. " ", ",")
            for x = 1, 3 do
                a = turtle.util.trimstring(split[x])
                if not recipe[a] then recipe[a] = {} end
                table.insert(recipe[a], {x, y})
            end
        end
    end

    local found
    for item, locations in pairs(recipe) do
        if item ~= "" then
            found = turtle.logistics.find(item)

            if not found then return false end

            turtle.select(found)
            turtle.transferTo(16)
            turtle.select(16)

            for _, location in ipairs(locations) do
                if not turtle.transferTo(location[1] + (location[2] - 1) * 4, 1) then
                    return false
                end
            end

            turtle.dropDown()
        end
    end

    for _, location in ipairs(recipe[""]) do
        turtle.select(location[1] + (location[2] - 1) * 4)
        turtle.dropDown()
    end

    for i = 1, 3 do
        turtle.select(4 + (i - 1) * 4)
        turtle.dropDown()
    end
    for i = 1, 4 do
        turtle.select(i + 12)
        turtle.dropDown()
    end

    return true
end

function logistics.craft(turtle, recipefile)
    while true do
        if not turtle.logistics.craftsetup(turtle, recipefile) then
            for i = 1, 16 do
                turtle.select(i)
                turtle.dropDown()
            end
            for i = 1, 15 do turtle.suckDown() end
        end
    end
end

return logistics
