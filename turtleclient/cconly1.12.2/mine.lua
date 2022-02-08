local mine = {}

-- TODO update to be synced with turtle.mobility.pos
function mine.mine(forward, right)
    turtle.select(1)
    for x = 1, right do
        for y = 1, forward - 1 do
            if not turtle.logistics.stop then
                turtle.logging.log(turtle, "Mining: " ..
                                       math.floor(
                                           (((x - 1) * forward + y - 1) /
                                               (right * forward)) * 100) .. "%")

                turtle.mobility.forward(turtle)

                if turtle.getItemCount(14) > 0 then
                    turtle.logistics.clearWaste(turtle)

                    if turtle.getItemCount(14) > 0 then
                        return
                    end
                end
            end
        end

        if not turtle.logistics.stop then
            if x ~= tonumber(right) then
                if x % 2 == 1 then
                    turtle.mobility.turnRight(turtle)
                    turtle.mobility.forward(turtle)
                    turtle.mobility.turnRight(turtle)
                else
                    turtle.mobility.turnLeft(turtle)
                    turtle.mobility.forward(turtle)
                    turtle.mobility.turnLeft(turtle)
                end
            end
        end
    end
end

function mine.forward(turtle)
    while true do
        local success, data = turtle.inspect()
        local successUp, dataUp = turtle.inspect()
        if success and data.name == "minecraft:stone" and successUp and
            dataUp.name == "minecraft:stone" then
            turtle.mobility.digUp(turtle)
            turtle.mobility.forward(turtle)
        end
    end
end

return mine
