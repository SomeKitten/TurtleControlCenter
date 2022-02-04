local u = {}

function u.strsplit(inputstr, sep)
    if sep == nil then sep = "%s" end
    local t = {}
    for str in string.gmatch(inputstr, "([^" .. sep .. "]+)") do
        table.insert(t, str)
    end
    return t
end

function u.ends_with(str, ending)
    return ending == "" or str:sub(-#ending) == ending
end

return u
