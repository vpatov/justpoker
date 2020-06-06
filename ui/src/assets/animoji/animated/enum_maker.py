import os

print "{"
for s in os.listdir("./"):
    if ".gif" in s:
        rmGif = s.replace(".gif", "")
        print rmGif + " = " + "'"+rmGif+"',"
print "}"