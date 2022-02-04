while true do
    pcall(function()
        shell.run(
            'wget run "http://server.cutekitten.space:25566/remote/import.lua"')
    end)
end
