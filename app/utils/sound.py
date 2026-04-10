import os

def play_alert(status):
    if status == "RED":
        os.system("afplay /System/Library/Sounds/Sosumi.aiff &")
