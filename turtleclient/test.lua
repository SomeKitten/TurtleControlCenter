-- wget run "http://server.cutekitten.space:25566/test.lua"
old_bg = term.getBackgroundColor()
term.setBackgroundColor(colors.gray)
term.setTextColor(colors.cyan)
term.clear()

term.write("xyzabc")

sleep(1)
term.setBackgroundColor(old_bg)
term.clear()
term.setCursorPos(1, 1)
