# SKAARHOJ Raw Panel client

Made in cooperation with [SKAARHOJ Aps](https://www.skaarhoj.com/)

---

### Quick Information

This module was created as an easy way to use a SKAARHOJ panel as a streamdeck and utilize buttons that you might not currently use on your controller, or maybe you want to have actual buttons instead of those on the Streamdeck.

The main requirement for this module to connect to a SKAARHOJ panel is to have the Unisketch core "Raw Panel" installed and run in server mode, but more info about this setup process can be found below.

**Quick Note:** This is a client to the panel, so it need to be in "server mode" for this to work!

---

## Table of Content

- Quick Information
- Module Configuration
  1. IP and Port
  2. Enable Companion Satellite API v2.0
  3. Streamdeck Row's and Bank's
  4. Enable Auto Dim/Off for LED Feedbacks
  5. TCP Timeout
  6. Backup LED Refresh
- Other Notes

---

## Module Configuration

When you add this module to your setup, it will present a set of configuration settings and let's take a look at what those do:

##### 1. IP and TCP port

These are for the connection to the panel. Please use the panels IP. This will most of the time be visible on one of the displays on the panel when nothing is connected to it.

The port is set by default to **"9923"**, but you have the option to change it depending on what settings you have put on the actual panel, but **"9923"** is the default for Raw Panel.

For a very basic setup, this is all you need to configure, but you might want to use the Companion satellite API for the best experience.

##### 2. Enable Companion Satellite API v2.0

This setting does exactly that. It enables the use of the Satellite API in the module. This is used together with the "Banks 1-32" options to create a "virtual" streamdeck on your SKAARHOJ controller, and you have the total freedom of what buttons from the streamdeck you want where. This even allows for pages and feedback, just like on a native streamdeck.

##### 3. Streamdeck Row's and Bank's

These options allow you to specify what button/HWC on your panel you want to match with any button on a streamdeck XL, and it will then work just like that with page up and down colour feedback on the button as well as text support on the screen.

If you have a button that doesn't have a screen attached, you can map a separate screen on the panel to work together with any button. Use a comma to split the two entries in the text field.

When filling in your HWCs IDs. The Format: **"button_HWC, Screen_HWC"** -> **"1,10"** is used, and if there is only one number, the screen will be assumed to be on the same HWC

Shown in this picture is two different bank's one with a button that has a screen included, and on "bank 2", we have a button that uses a separate screen:

![Bank Setup](images/configuration/bank_setup.png?raw=true 'Bank Setup')

Encoders, joysticks and faders can also be mapped as a button in these fields. Just type in the HWC id for that component, but the use might be a bit limiting in some cases.

_Quick Note: **"HWC"** stands for "Hardware Component" on a SKAARHOJ panel, and you will see this ID in the WebUI for your controller. This is the unique identifier that all components have, be it a button, encoder, screen, led and so on._

##### 4. Enable Auto Dim/Off for LED Feedbacks

**Note** that changing this setting will require a restart of Companion in most cases.

If this is enabled, all HWC's with an LED will light a dim white when the button is black in companion (mimics normal SKAARHOJ behaviour). Turn this off if you want them to turn completely off. (This would be more in line with how companion does it usually)

##### 5. TCP Timeout

Usually, just leave this on its default value **"5000"** or 5 seconds, but this is how often the module will ping the panel and provide the max time before a disconnect is discovered. This setting can be set in the range: "1000 -> 300000" or "1 sec -> 5 min"

##### 6. Backup LED Refresh

Backup LED Refresh does just that. It controls how often we should send the data to the screens if nothing else has done that, so this helps eliminate a case where you would be stuck with a blank panel. But this also can affect the performance on the panel, so, therefore, it's set as default at **"30000"** or 30 seconds, but you can set it down to every 5 seconds. This might be prefered if you swap a lot around with pages on your controller.

Only really change this if you often end up with blank screens, and if that still happens, you can also use the action "refresh displays" on a button or trigger.

The total range for this option is: "5000 -> 600000" or "5 sec -> 10 min"

---

## Other Notes

If you have questions or feel that something is missing in the module, then please create an issue and take a look those already made here on [GitHub](https://github.com/bitfocus/companion-module-skaarhoj-rawpanel/issues)

