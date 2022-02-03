local replicate = {}

function replicate.placeSetup(turtle)
    turtle.logistics.find("computercraft:disk_drive")
    turtle.logistics.place(turtle)
    turtle.logistics.find("computercraft:disk")
    turtle.drop()
    turtle.mobility.up(turtle)
    turtle.logistics.find("computercraft:turtle_normal")
    turtle.logistics.place(turtle)
    peripheral.call("front", "turnOn")
end