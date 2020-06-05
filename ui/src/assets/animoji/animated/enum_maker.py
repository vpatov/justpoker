import os

print "{"
for s in os.listdir("./"):
    if ".py" not in s:
        rmGif = s.replace(".gif", "")
        print rmGif + " = " + "'"+rmGif+"',"
print "}"