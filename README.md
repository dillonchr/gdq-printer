# GDQ Schedule Printer

This is a toy project for making portable lists of games for the day. It will fetch the schedule and then print it out on a single receipt.

This is not a user-friendly app. I'd call it developer friendly. Or maybe just me-friendly. It does exactly what I need it to for my configuration.

## Things I use:
* a [thermal printer with USB connections](https://www.amazon.com/Aibecy-Portable-Wireless-Printing-Compatible/dp/B06VXPLLMQ/ref=sr_1_13?keywords=thermal+bluetooth+printer&qid=1553619080&s=gateway&sr=8-13)
* a raspberry pi zero w

I have the cheap thermal printer hooked up via USB to the only USB-in for the Pi. But I have to run this node app as `sudo` to get it to actually pipe output to the printer. I think anyway. I know for sure that with my Fedora laptop, I have to `sudo chown $(whoami) /dev/usb/lp0` before I can just pipe text to it as my current user. I'll find out and edit this paragraph later.

But that's pretty much it. Once you have those things configured and you can `echo hello > /dev/usb/lp0` then you should be good to run this app. Then set up a cron. Which I'll also paste later. Don't feel like rebuilding it now.
