#!/bin/bash
PRINT_PATH=/dev/usb/lp0
# chown -R $(whoami) $PRINT_PATH
/home/pi/git/png2pos/print.py gdq.png > $PRINT_PATH
node main.js > $PRINT_PATH

