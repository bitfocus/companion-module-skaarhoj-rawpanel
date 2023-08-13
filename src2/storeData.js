const { json } = require('express')
const { keyBy } = require('lodash')

exports.storeData = function (str) {
	var self = this
	data = self.data

	// Store model nr. and serial nr.
	if (str.includes('_model') || str.includes('_serial') || str.includes('_version')) {
		str_arr = str.split('\n')
		str_arr.forEach((element) => {
			x = element.split('=')
			switch (x[0]) {
				case '_model':
					this.data.model = x[1]
					this.setVariable(`model`, this.data.model)
					if (this.config.debug) {
						this.log('warn', 'Recived: ' + x[0] + ': ' + x[1])
					}
					break
				case '_serial':
					this.data.serial = x[1]
					this.setVariable(`serial_nr`, this.data.serial)
					if (this.config.debug) {
						this.log('warn', 'Recived: ' + x[0] + ': ' + x[1])
					}
					break
				case '_version':
					this.data.version = x[1]
					this.setVariable(`version`, this.data.version)
					if (this.config.debug) {
						this.log('warn', 'Recived: ' + x[0] + ': ' + x[1])
					}

					if (self.data.startupAPI == true) {
						self.satelliteAPI.bind(this)()
					}
					break
				default:
					break
			}
		})
	}

	// Update if the panel goes to sleep or wakes up
	if (str.includes('_isSleeping')) {
		if (this.config.debug) {
			this.log('warn', 'Recived: ' + str)
		}
		if (str.split('_isSleeping=') == '1') {
			data.sleep = 'True'
		} else {
			data.sleep = 'False'
		}
		this.data = data
	}

	// Update if state : reg state/changes
	if (str.includes('_state') || str.includes('State')) {
		// State: 0-9
		// REG: Master, P, Q, R, S
		if (str.includes('State')) {
			state = String(str.split('State')[1]).split('=')
			reg = state[0]
			val = state[1]

			switch (reg) {
				case 'P':
					data.state.P = val
					break
				case 'Q':
					data.state.Q = val
					break
				case 'R':
					data.state.R = val
					break
				case 'S':
					data.state.S = val
					break
				default: // Master reg
					data.state.Master = val
					break
			}
		}

		if (this.config.debug) {
			this.log('warn', 'Recived State: ' + str)
		}
		this.debug('Recived State: ' + str)
		this.data = data

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
					self.sendCommand('HWCc#' + color_key + '=128')
					if (keyData.pressed == true) {
						self.sendCommand('HWC#' + color_key + '=36') // ON
					} else {
						if (self.config.autoDim == true) {
							self.sendCommand('HWC#' + color_key + '=5') // Dimmed
						} else {
							self.sendCommand('HWC#' + color_key + '=0') // OFF
						}
					}
				} else {
					self.sendCommand('HWCc#' + color_key + '=' + keyData.color)
					if (keyData.pressed == true) {
						self.sendCommand('HWC#' + color_key + '=36') // ON
					} else {
						self.sendCommand('HWC#' + color_key + '=5') // Dimmed
					}
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
							self.sendCommand('HWCt#' + text_key + '=' + '|||' + 'Comp Key: ' + key + '|1|' + x[0] + '|' + x[1] + '|')
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
	}

	// Update if shift : reg state/changes
	if (str.includes('_shift') || str.includes('Shift')) {
		// Level: 0-10
		// REG: Master, A, B, C, D
		if (this.config.debug) {
			this.log('warn', 'Recived: ' + str)
		}
		this.debug('Shift: ' + str)

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
					self.sendCommand('HWCc#' + color_key + '=128')
					if (keyData.pressed == true) {
						self.sendCommand('HWC#' + color_key + '=36') // ON
					} else {
						if (self.config.autoDim == true) {
							self.sendCommand('HWC#' + color_key + '=5') // Dimmed
						} else {
							self.sendCommand('HWC#' + color_key + '=0') // OFF
						}
					}
				} else {
					self.sendCommand('HWCc#' + color_key + '=' + keyData.color)
					if (keyData.pressed == true) {
						self.sendCommand('HWC#' + color_key + '=36') // ON
					} else {
						self.sendCommand('HWC#' + color_key + '=5') // Dimmed
					}
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
							self.sendCommand('HWCt#' + text_key + '=' + '|||' + 'Comp Key: ' + key + '|1|' + x[0] + '|' + x[1] + '|')
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
	}

	// Update if Memory : reg state/changes
	if (str.includes('Mem')) {
		// REG: A, B, C, D, E, F, G, H, I, J, K, L
		if (this.config.debug) {
			this.log('warn', 'Recived: ' + str)
		}
		this.debug('Mem: ' + str)
	}

	// Update if Flag : reg state/changes
	if (str.includes('Flag')) {
		// NR: 0-255
		if (this.config.debug) {
			this.log('warn', 'Recived: ' + str)
		}
		this.debug('Flag: ' + str)
	}

	// check if we recieved a keypress
	if (str.substring(0, 4) === 'HWC#') {
		str = str.substring(4)
		var hwc = this.data.hwc
		hwc.id = ''
		hwc.type = ''
		hwc.side = ''
		hwc.press = ''
		hwc.val = ''

		// Button Click
		if (str.includes('Up') || str.includes('Down')) {
			hwc.id = String(str.split('HWC#')).split('=')[0]
			hwc.type = 'Button'
			hwc.press = 'false'
			if (str.includes('Down') == true) {
				hwc.press = 'true'
			}

			// 4-Way Button Click:
			if (str.includes('.')) {
				hwc.id = String(str.split('HWC#')).split('.')[0]
				hwc.type = '4-way Button'

				x = String(str.split('.')[1]).split('=')[0]
				switch (x) {
					case '1':
						hwc.side = 'Top'
						break
					case '2':
						hwc.side = 'Left'
						break
					case '4':
						hwc.side = 'Bottom'
						break
					case '8':
						hwc.side = 'Right'
						break
					default:
						break
				}
			}
		}

		// Encoder press
		else if (str.includes('Press')) {
			hwc.id = String(str.split('HWC#')).split('=')[0]
			hwc.type = 'Encoder'
			if (str.includes('Press') == true) {
				hwc.press = 'true'
			}
		}

		// Encoder turn
		else if (str.includes('Enc')) {
			hwc.id = String(str.split('HWC#')).split('=')[0]
			hwc.type = 'Encoder'
			hwc.val = parseInt(str.split('Enc:')[1])
		}

		// Fader change
		else if (str.includes('Abs')) {
			hwc.id = String(str.split('HWC#')).split('=')[0]
			hwc.type = 'Fader'

			// Parse analog value, could be used for tbar in vmix and alike
			hwc.val = parseInt(String(str.split('=')[1]).split(':')[1])
		}

		// Joystick change (speed)
		else if (str.includes('Speed')) {
			hwc.id = String(str.split('HWC#')).split('=')[0]
			hwc.type = 'Joystick'

			// Parse analog value, could be used for tbar in vmix and alike
			hwc.val = parseInt(String(str.split('=')[1]).split(':')[1])
		} else {
			hwc.type = 'Button LED Update'
		}

		// Find the HWc that got pushed/moved
		let json_hwc = {}
		for (let index = 0; index < this.json_data.hwc.length; index++) {
			if (this.json_data.hwc[index].id == hwc.id) {
				json_hwc = this.json_data.hwc[index]
			} else {
				continue
			}
		}

		// this.debug(json_hwc.type)
		// Update variables for: Faders, Joysticks and Potmeters
		if (json_hwc.type !== null && json_hwc.type !== {} && json_hwc.type !== undefined) {
			if (json_hwc.type.in === 'av') {
				if (hwc.val !== null) {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, hwc.val)
				} else {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, '0')
				}
			} else if (json_hwc.type.in === 'ah') {
				if (hwc.val !== null) {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, hwc.val)
				} else {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, '0')
				}
			} else if (json_hwc.type.in === 'ar') {
				if (hwc.val !== null) {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, hwc.val)
				} else {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, '0')
				}
			} else if (json_hwc.type.in === 'iv' || json_hwc.type.in === 'ih') {
				if (hwc.val !== null) {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, hwc.val)
				} else {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, '0')
				}
			} else if (json_hwc.type.in === 'ir') {
				if (hwc.val !== null) {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, hwc.val)
				} else {
					this.setVariable(`Hwc_${hwc.id}_${json_hwc.txt}`, '0')
				}
			}
		}

		// if (this.config.debug) {this.log('warn','Recived: HWC: ' + hwc.id + ' | Type: ' + hwc.type + ' | Side: ' + hwc.side + ' | Press: ' + hwc.press + ' | Val: ' + hwc.val + ' | CMD: HWC#' + str)}
		// self.debug('HWC: ' + hwc.id + ' | Type: ' + hwc.type + ' | Side: ' + hwc.side + ' | Press: ' + hwc.press + ' | Val: ' + hwc.val + ' | CMD: HWC#' + str)

		this.data.hwc = hwc
		this.checkFeedbacks('tieToHwc') // Update Keypress Feedback
		if (self.config.satEnable == true && self.data.satConnected == true) {
			this.hwcToSat()
		}
		if (hwc.type == 'Button' || hwc.type == '4-way Button') {
			this.checkFeedbacks('tieToHwc4Way')
		} // Update 4-Way Button Feedback
		if (hwc.type == 'Encoder' || hwc.type == '4-way Button') {
			this.checkFeedbacks('tieToHwcEncoder')
		} // Update Encoder Feedback, depending the Encoder mode it might be reported as a 4-way button
		if (hwc.type == 'Joystick') {
			this.checkFeedbacks('tieToHwcJoystick')
		} // Update Joystick Feedback
		this.updateVariableDefinitions
		var hwc = this.data.hwc
		hwc.id = ''
		hwc.type = ''
		hwc.side = ''
		hwc.press = ''
		hwc.val = ''
		this.data.hwc = hwc
	}
}
