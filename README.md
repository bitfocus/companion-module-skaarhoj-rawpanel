# companion-module-skaarhoj-rawpanel

This module will connect to a SKAARHOJ Unisketch panel running in "Raw Panel" mode.
For more info on how to use the module, please take a look at the file [help.md](https://github.com/bitfocus/companion-module-skaarhoj-rawpanel/blob/main/companion/HELP.md)

For info about the module's [license, please look at the License file](https://github.com/bitfocus/companion-module-skaarhoj-rawpanel/blob/main/LICENSE)

Things to fix:
 - Add support for encoders on one hwc, same way as it's used on the StreamDeck+
 - Look into adding feedback functions back or the same functionality in another way

# Path Notes

**V2.2.1**
 - Cleanup leftover logs

**V2.2.0**
 - Add Variabled for all components, that provide either, pressed state, Pulsed value or speed/position
 - Add Support for parsing variable in all input fields that can take text inputs

**V2.1.1**
 - Add ability to disable the title prefix "Comp Key: X", via a config toogle

**V2.1.0**
 - Fix connection issues when connecting via the SKAARHOJ Rawpanel Server core
 - Update companion module base and tools

**V2.0.1**
 - Fix Compile Issues

**V2.0.0**

- Ported module to Companion v3.x
- Added Satellite connection support on Companion 3.x
- Added Actions support on Companion 3.x
- Added Variable support on Companion 3.x
- Old Feedbacks setups from Companion 2.x are currently not supported

**V1.0.3**

- Bug fix: Fix version locked to only work with Companion V2.2.0, now works with all version of companion 2.X.X

**V1.0.2**

- Updated images to match current Blue Pill Development
- Fixed images not loading correctly in the Help.md file

**V1.0.1**

- Added support for latched buttons with "Companion Satellite API" buttons

**V1.0.0**

- Initial Release
