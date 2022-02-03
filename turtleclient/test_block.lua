local data = turtle.getItemDetail(1)
local startlayers = 0

function spaces(i)
  local spaces = ""
  local j = 0
  while j < i do
    spaces = spaces .. " "
    j = j + 1
  end
  return spaces
end

function printTable(tbl, layers)
  for k, v in pairs(tbl) do
    if type(v) == "table" then
      print(spaces(layers) .. "--" .. k)
      printTable(v, layers + 2)
    else
      print(spaces(layers) .. k .. ", " .. tostring(v))
    end
  end
end

print("root")
print(data)
printTable(data, startlayers)
