-- wget run "http://server.cutekitten.space:25566/remote/import.lua"
-- turtle requirements...
-- 
DIR = "remote"

print("Installing!")
shell.run("cd /")
shell.run("rm " .. DIR)
shell.run("mkdir " .. DIR)
local files = {
    "main", "mobility", "logistics", "replicate", "logging", "util", "mine",
    "json"
}
for _, f in ipairs(files) do
    shell.run("rm " .. DIR .. "/" .. f .. ".lua")
    shell.run("wget http://server.cutekitten.space:25566/" .. DIR .. "/" .. f ..
                  ".lua " .. DIR .. "/" .. f .. ".lua")
end
shell.run("mkdir " .. "startup")
shell.run("rm startup/" .. DIR .. ".lua")
shell.run(
    "wget http://server.cutekitten.space:25566/" .. DIR .. "/startup.lua " ..
        "startup/" .. DIR .. ".lua")

shell.run("cd " .. DIR)
print("Running!")
shell.run("main.lua")
