local mine = {}

local function mineForward(turtle, forward, right, x, y, z)
    if not turtle.logistics.stop then
        turtle.logging.log(turtle,
                           "Mining: " ..
                               math.floor(
                                   (((y - 1) * right * forward + (x - 1) *
                                       forward + z) / (right * forward)) * 100) ..
                               "%")

        turtle.mobility.forward(turtle, true)

        if turtle.getItemCount(14) > 0 then
            turtle.logistics.clearWaste(turtle)

            if turtle.getItemCount(14) > 0 then return end
        end
    end
end

local function mineTurn(turtle, right, x)
    if not turtle.logistics.stop then
        if x % 2 == 0 then
            turtle.mobility.turnRight(turtle)
            turtle.mobility.forward(turtle, true)
            turtle.mobility.turnRight(turtle)
        else
            turtle.mobility.turnLeft(turtle)
            turtle.mobility.forward(turtle, true)
            turtle.mobility.turnLeft(turtle)
        end
        turtle.mobility.forward(turtle, true)
    end
end

local function mineUp(turtle, forward, right)
    if right % 2 == 1 then
        turtle.mobility.turnRight(turtle)
        turtle.mobility.turnRight(turtle)
    else
        for _ = 1, forward do
            print("x")
            turtle.mobility.back(turtle)
        end
    end
    print("y")
    turtle.mobility.up(turtle)
end

-- TODO update to be synced with turtle.mobility.pos
function mine.mine(turtle, a, b, c) -- a = right/right, b = forward/up, c = nil/forward
    local forward, up, right
    if c == nil then
        right = a
        up = 1
        forward = b
    else
        right = a
        up = b
        forward = c
    end

    local r = true

    turtle.select(1)

    if turtle.mobility.rot == 90 then
        startX = turtle.mobility.pos[1]
        startY = turtle.mobility.pos[2]
        startZ = turtle.mobility.pos[3]

        while turtle.mobility.pos[2] < startY + up do
            local lastUp = turtle.mobility.pos[2]
            while (r and turtle.mobility.pos[1] < startX + right) or
                ((not r) and turtle.mobility.pos[1] >= startX) do
                local lastRight = turtle.mobility.pos[1]

                while (turtle.mobility.rot == 90 and turtle.mobility.pos[3] <
                    startZ + forward - 1) or
                    (turtle.mobility.rot ~= 90 and turtle.mobility.pos[3] >
                        startZ) do
                    local x = turtle.mobility.pos[1] - startX
                    local y = turtle.mobility.pos[2] - startY
                    local z = turtle.mobility.pos[3] - startZ
                    turtle.logging.log(turtle,
                                       math.floor(
                                           100 *
                                               (z + x * forward + y * forward *
                                                   right) /
                                               (forward * right * up)) .. "%")
                    turtle.mobility.forward(turtle, true)
                    -- if turtle.getItemCount(14) > 0 then
                    --     turtle.logistics.clearWaste(turtle)

                    --     if turtle.getItemCount(14) > 0 then
                    --         return
                    --     end
                    -- end
                end

                local x = turtle.mobility.pos[1] - startX

                if (r and turtle.mobility.pos[1] < startX + right - 1) or
                    ((not r) and turtle.mobility.pos[1] > startX) then
                    if (r and x % 2 == 0) or
                        ((not r) and (right - x - 1) % 2 == 1) then
                        turtle.mobility.turnRight(turtle)
                        turtle.mobility.forward(turtle, true)
                        turtle.mobility.turnRight(turtle)
                    else
                        turtle.mobility.turnLeft(turtle)
                        turtle.mobility.forward(turtle, true)
                        turtle.mobility.turnLeft(turtle)
                    end
                end

                if turtle.mobility.pos[1] == lastRight then break end
            end

            local y = turtle.mobility.pos[2] - startY
            if y < up - 1 then
                if right % 2 == 0 then
                    turtle.mobility.turnRight(turtle)
                    turtle.mobility.turnRight(turtle)
                else
                    for _ = 1, forward - 1 do
                        turtle.mobility.back(turtle)
                    end
                end
                turtle.mobility.up(turtle)
            end

            if turtle.mobility.pos[2] == lastUp then break end

            r = not r
        end
    end
end

function mine.forward(turtle)
    while true do
        local success, data = turtle.inspect()
        if not success or data.name == "minecraft:stone" then
            turtle.mobility.forward(turtle)
        end
    end
end

return mine
