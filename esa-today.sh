#!/bin/bash
chown -R $(whoami) /dev/usb/lp0
/home/pi/git/png2pos/print.py esa-winter.png > /dev/usb/lp0
node esa-main.js

