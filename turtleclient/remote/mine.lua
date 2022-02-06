local mine = {}

function mine.mine(forward, right)
    turtle.select(1)
    for x = 1, right do
        for y = 1, forward - 1 do
            if not turtle.logistics.stop then
                turtle.logging.log(turtle, math.floor(
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

    -- blocks = turtle.logistics.countAll(turtle)
    -- if turtle.logistics.reproduce then
    --     if blocks["minecraft:cobblestone"] and blocks["minecraft:iron_ore"] and
    --         blocks["minecraft:redstone"] then
    --         if blocks["minecraft:cobblestone"] >= 15 and
    --             blocks["minecraft:iron_ore"] >= 7 and
    --             blocks["minecraft:redstone"] >= 1 then
    --             print("I CAN REPRODUCE!")
    --         end
    --     end
    -- end

    -- turtle.mobility.home(turtle)
    -- turtle.mobility.turnDeg(turtle, 90)
end

return mine
