exports.getActions = function () {
	const buttonLED = [
		{ id: '0', label: 'OFF' },
		{ id: '5', label: 'Dimmed' },
		{ id: '36', label: 'ON / Color (default white)' },
		{ id: '34', label: 'ON RED' },
		{ id: '35', label: 'ON Green' },
	]

	const buttonColor = [
		{ id: '128', label: 'Default Color' },
		{ id: '129', label: 'OFF' },
		{ id: '130', label: 'White' },
		{ id: '131', label: 'Warm White' },
		{ id: '132', label: 'Red' },
		{ id: '133', label: 'Rose' },
		{ id: '134', label: 'Pink' },
		{ id: '135', label: 'Purple' },
		{ id: '136', label: 'Amber' },
		{ id: '137', label: 'Yellow' },
		{ id: '138', label: 'Dark blue' },
		{ id: '139', label: 'Blue' },
		{ id: '140', label: 'Ice' },
		{ id: '141', label: 'Cyan' },
		{ id: '142', label: 'Spring' },
		{ id: '143', label: 'Green' },
		{ id: '144', label: 'Mint' },
	]

	const hwc = {
		type: 'number',
		label: 'HWC on the panel',
		id: 'hwc',
		default: 1,
		min: 1,
		max: 254,
	}

	return {
		SetButtonState: {
			label: 'Set Button LED Status On/Off/Dimmed',
			options: [
				hwc,
				{
					type: 'dropdown',
					label: 'LED Setting',
					id: 'val',
					default: '36',
					choices: buttonLED,
				},
			],
		},
		SetButtonColor: {
			label: 'Set Button LED Color',
			options: [
				hwc,
				{
					type: 'dropdown',
					label: 'Extended LED Color',
					id: 'color',
					default: '128',
					choices: buttonColor,
				},
			],
		},
		DisplayText: {
			label: 'Diplay Text on LCD',
			options: [
				hwc,
				{
					type: 'textinput',
					id: 'title',
					label: 'Title Text',
					width: 4,
					default: '',
				},
				{
					type: 'checkbox',
					id: 'isLabel',
					label: 'Title is a Label',
					default: false,
				},
				{
					type: 'textinput',
					id: 'label1',
					label: 'Label 1',
					default: '',
				},
				{
					type: 'textinput',
					id: 'label2',
					label: 'Label 2',
					default: '',
				},
			],
		},
		Clear: {
			label: 'Clear LED/Display/Both',
			options: [
				{
					type: 'dropdown',
					label: 'Command',
					id: 'cmd',
					default: 'Clear',
					choices: [
						{ id: 'Clear', label: 'Clear All' },
						{ id: 'ClearLEDs', label: 'Clear All LEDs' },
						{ id: 'ClearDisplays', label: 'Clear All Displays' },
						{ id: 'onlyDisplay', label: 'Clear Only this Displays' },
					],
				},
				hwc,
			],
		},
		PanelBrightness: {
			label: 'Panel Brightness',
			options: [
				{
					type: 'number',
					label: 'LED (1-8)',
					id: 'led',
					default: 5,
					min: 1,
					max: 8,
				},
				{
					type: 'number',
					label: 'LCD/OLED (1-8)',
					id: 'lcd',
					default: 5,
					min: 1,
					max: 8,
				},
			],
		},
		Webserver: {
			label: 'Webserver ON/OFF',
			options: [
				{
					type: 'dropdown',
					label: 'Command',
					id: 'cmd',
					default: 'Webserver=1',
					choices: [
						{ id: 'Webserver=1', label: 'ON' },
						{ id: 'Webserver=0', label: 'OFF' },
					],
				},
			],
		},
		Reboot: {
			label: 'Reboot Panel',
		},
		Refresh: {
			label: 'Refresh/Check Feedbacks',
			description: 'Refresh Feedbacks, Optional to clead Displays and Leds First',
			options: [
				{
					type: 'checkbox',
					id: 'clear',
					label: 'Clear Panel Firts?',
					default: true,
				},
			],
		},
		CustomCommand: {
			label: 'Custom Command',
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command:',
					tooltip: 'Custom rawpanel commands in string form',
					default: '',
				},
			],
		},
	}
}

exports.executeAction = function (action) {
	var self = this
	var opt = action.options

	switch (action.action) {
		case 'SetButtonState':
			this.sendCommand('HWC#' + opt.hwc + '=' + opt.val)
			break
		case 'SetButtonColor':
			this.sendCommand('HWCc#' + opt.hwc + '=' + opt.color)
			break
		case 'DisplayText':
			var isLabel = '|0|'
			var label2 = ''
			if (opt.isLabel == true) {
				isLabel = '|1|'
			}
			if (opt.label2 != '') {
				label2 = '|' + opt.label2 + '|'
			}
			this.sendCommand('HWCt#' + opt.hwc + '=' + '|||' + opt.title + isLabel + opt.label1 + label2)
			break
		case 'Clear':
			if (opt.cmd == 'onlyDisplay') {
				this.sendCommand('HWCt#' + opt.hwc + '=' + '||||||')
			} else {
				this.sendCommand(opt.cmd)
			}
			break
		case 'PanelBrightness':
			this.sendCommand('PanelBrightness=' + opt.led + ',' + opt.lcd)
			break
		case 'Reboot':
			this.sendCommand('Reboot')
			break
		case 'Refresh':
			if (opt.clear) {
				this.sendCommand('Clear')
			}

			// Check feedback, and send state to those
			this.checkFeedbacks('tieToHwcLed')
			this.checkFeedbacks('tieToLcd')

			// Send stored data to panel if a shit state is changed
			for (let index = 0; index < this.sdData.keys.length; index++) {
				let key = index + 1
				let config_key = String(self.config['btn_' + key])
				let color_key = config_key
				let text_key = config_key
				let keyData = this.sdData.keys[index]

				// skip if nothing is selected
				if (config_key == 0 || config_key == '') {
					continue
				}

				if (config_key.includes(',')) {
					config_key = config_key.split(',')
					color_key = config_key[0]
					text_key = config_key[1]
				}

				if (keyData.color !== '') {
					let rgb = keyData.color
					if (rgb == 128 + 64) {
						if (self.config.autoDim == true) {
							self.sendCommand('HWCc#' + color_key + '=128')
							self.sendCommand('HWC#' + color_key + '=5') // Dimmed
						} else {
							self.sendCommand('HWC#' + color_key + '=0') // OFF
						}
					} else {
						self.sendCommand('HWCc#' + color_key + '=' + rgb)
						self.sendCommand('HWC#' + color_key + '=36') // ON
					}
				}

				if (keyData.text !== '') {
					cmd = keyData.text

					// Check if there is a title/text on the button?
					if (cmd.length > 0) {
						if (cmd.length >= 25) {
							x = cmd.split('\\n')
							if (x.length >= 3) {
								cmd = cmd.replace(' ', '\\n')
							}

							if (x.length <= 2) {
								// cmd = cmd.substr(0, 24) + '\\n' + cmd.substr(24, cmd.length)
								y = cmd.match(/.{1,24}/g)
								// console.log(y.length)
								if (y.length <= 2) {
									cmd = y[0] + '\\n' + y[1]
								} else if (y.length >= 3) {
									cmd = y[0] + '\\n' + y[1] + '\\n' + y[2]
								}
							}
						}

						// If the text includes a line break, replace it with a space
						if (cmd.includes('\\n')) {
							x = cmd.split('\\n')
							if (x.length == 2) {
								console.log(x.length)
								self.sendCommand(
									'HWCt#' + text_key + '=' + '|||' + 'Comp Key: ' + key + '|1|' + x[0] + '|' + x[1] + '|'
								)
							} else if (x.length == 3) {
								self.sendCommand('HWCt#' + text_key + '=' + '|||' + x[0] + '|1|' + x[1] + '|' + x[2] + '|')
							} else {
								cmd = cmd.split('\\n').join(' ')
								self.sendCommand('HWCt#' + text_key + '=' + '|||' + 'Comp Key: ' + key + '|1|' + cmd + '||')
							}
						} else {
							self.sendCommand('HWCt#' + text_key + '=' + '|||' + 'Comp Key: ' + key + '|1|' + cmd + '||')
						}
					} else {
						// Send Placeholder Text to the LCD's if there is no other text
						self.sendCommand('HWCt#' + text_key + '=' + '|||' + 'Comp Key:|1|' + key + '||')
					}
				}
			}
			break

		default: // all actions, not mentioned above
			this.sendCommand(opt.cmd)
			break
	}
}

exports.sendCommand = async function (message) {
	if (message !== undefined) {
		// this.debug('sending', message, 'to', this.config.host)
		if (this.config.debug) {
			this.log('info', 'Sending: ' + message)
		}

		if (this.tcp !== undefined && this.tcp.connected) {
			this.tcp.send(message + '\n')
		} else {
			this.debug('Socket not connected :(')
		}
		await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](50) // 5 mili sec
	}
}
