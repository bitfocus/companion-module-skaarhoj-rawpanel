const { raw } = require('express')
var tcp = require('../../../tcp')
const { storeData } = require('./storeData')

exports.satelliteAPI = function () {
	var self = this
	var host = '127.0.0.1'
	var port = 16622 //self.config.tcpPort

	if (self.api !== undefined) {
		self.api.destroy()
		delete self.api
	}

	if (self.config.satEnable) {
		self.api = new tcp(host, port)

		self.api.on('status_change', function (status, message) {
			// self.status(status, message)
		})

		self.api.on('error', function (err) {
			self.data.satConnected = false
			self.data.startupAPI = true
			self.debug('Network error', err)
			// self.status(self.STATE_ERROR, err)
			self.log('error', 'Network error: ' + err.message)
		})

		self.api.on('connect', function () {
			self.data.startupAPI = false
		})

		self.api.on('data', function (data) {
			// self.debug('data: ' + String(data))

			let str_raw = String(data)
			let str_split = str_raw.trim() // remove new line, carage return and so on.

			str_split = str_split.split('\n')
			for (let index = 0; index < str_split.length; index++) {
				let str = str_split[index]
				// self.debug(str)

				// Create a satallite device on first connect
				if (str.includes('BEGIN CompanionVersion=') == true) {
					let s = self.data.model
					if (s.includes('SK_') == true) {
						s = s.split('SK_')[1]
					}
					self.sendAPI(
						'ADD-DEVICE DEVICEID=' +
							self.data.serial +
							' PRODUCT_NAME="SKAARHOJ ' +
							s +
							'" BITMAPS=false COLORS=true TEXT=true'
					)
					continue
				}

				// Sycceded in creating device
				if (str.includes('ADD-DEVICE OK')) {
					self.data.satConnected = true
					continue
				}

				// Respond to ping Commands
				if (str.includes('PING')) {
					self.debug('Sent Ping')
					continue
				}

				// Recieved a Brightness Command
				if (str.includes('BRIGHTNESS')) {
					let brightness = str.split('VALUE=')[1].split(' ')[0]
					brightness = Math.round(self.normalizeBetweenTwoRanges(brightness, 0, 100, 0, 8))
					self.sendCommand('PanelBrightness=' + brightness)
					self.debug('Sent Panel Brightnss: ' + brightness)
					continue
				}

				// Recieved a Clear all Command
				if (str.includes('KEY-CLEAR')) {
					self.sendCommand('Clear')
					self.debug('Sent Key Clear')
					continue
				}

				// recived a Key-State Command
				if (str.includes('KEY-STATE')) {
					self.debug('Sent Key State')
					self.debug(str)
					console.log(str)
					keyData = {
						text: '',
						color: '',
						type: '',
						pressed: false,
					}

					// TODO: Missing handler to clear buttons that was used previosly, but not with a new config

					let key = 1 + parseInt(str.split('KEY=')[1].split(' ')[0])
					let config_key = String(self.config['btn_' + key])
					let color_key = config_key
					let text_key = config_key

					// skip if nothing is selected
					if (config_key == 0 || config_key == '' || config_key == 'undefined') {
						continue
					}

					if (config_key.includes(',')) {
						config_key = config_key.split(',')
						color_key = config_key[0]
						text_key = config_key[1]
					}

					// Store Color Data
					if (str.includes('COLOR=#')) {
						let rawColor = str.split('COLOR=#')[1].split(' ')[0]
						color = parseInt(rawColor, 16)
						let rgb = self.convertIntColorToRawPanelColor(color)
						keyData.color = rgb
					}

					// Store Text Data
					if (str.includes('TEXT=')) {
						let data = str.split('TEXT=')[1].split(' ')[0]
						let buff = new Buffer.from(data, 'base64')
						let cmd = buff.toString('ascii')
						keyData.text = cmd
						// self.debug(cmd)
					}

					if (str.includes('PRESSED=')) {
						let data = str.split('PRESSED=')[1].split(' ')[0]
						if (data == 'true') {
							keyData.pressed = true
						} else {
							keyData.pressed = false
						}
						// self.debug(data)
					}

					// Store Key Type, and override color and text if needed
					if (str.includes('TYPE=')) {
						let type = str.split('TYPE=')[1].split(' ')[0]
						keyData.type = type
						if (type == 'PAGEUP') {
							keyData.text = 'Page Up'
						}
						if (type == 'PAGEDOWN') {
							keyData.text = 'Page Down'
						}
						if (type == 'PAGENUM') {
							keyData.text = 'Page Number'
						}
					}

					// Render Button Color
					if (keyData.color == 128 + 64) {
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

					// Render Button Text
					let cmd = keyData.text
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

					// Store Streamdeck Button States Internaly:
					self.sdData.keys[key - 1] = keyData
					continue
				}
			}
		})
	}
	return self
}

exports.sendAPI = async function (message) {
	if (message !== undefined) {
		if (this.api !== undefined && this.api.connected) {
			this.api.send(message + '\r\n')
		} else {
			this.debug('Socket not connected :(')
		}
		await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](100) // 5 mili sec
	}
}

exports.hwcToSat = function (message) {
	self = this
	var x = self.data.hwc

	// IF the HWC ID is 0 return
	if (x.id == '0') {
		return
	}

	// self.debug(hwc)

	// Tackle Encoders, Joysticks and Faders
	if (x.type == 'Encoder') {
		if (x.val == -1 || x.val == 1) {
			x.press = 'true'
		}
	} else if (x.type == 'Joystick') {
		let deadzone = 100

		// Press
		if (x.val >= deadzone || x.val <= deadzone * -1) {
			x.press = 'true'
		}

		// Release
		else if (x.val > deadzone * -1 || x.val < deadzone) {
			x.press = 'false'
		}
	} else if (x.type == 'Fader') {
		let center = 500
		let deadzone = 200
		let val = x.val - center

		// Press
		if (val >= deadzone || val <= deadzone * -1) {
			x.press = 'true'
		}

		// Release
		else if (val > deadzone * -1 || val < deadzone) {
			x.press = 'false'
		}
	}

	// check if it's atleast a press or a release, if not return
	if (x.press == '') {
		return
	}

	switch (x.id) {
		case String(self.config.btn_1):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=0 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=0 PRESSED=false')
			}
			break

		case String(self.config.btn_2):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=1 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=1 PRESSED=false')
			}
			break

		case String(self.config.btn_3):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=2 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=2 PRESSED=false')
			}
			break

		case String(self.config.btn_4):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=3 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=3 PRESSED=false')
			}
			break

		case String(self.config.btn_5):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=4 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=4 PRESSED=false')
			}
			break

		case String(self.config.btn_6):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=5 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=5 PRESSED=false')
			}
			break
		case String(self.config.btn_7):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=6 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=6 PRESSED=false')
			}
			break

		case String(self.config.btn_8):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=7 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=7 PRESSED=false')
			}
			break

		case String(self.config.btn_9):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=8 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=8 PRESSED=false')
			}
			break

		case String(self.config.btn_10):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=9 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=9 PRESSED=false')
			}
			break

		case String(self.config.btn_11):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=10 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=10 PRESSED=false')
			}
			break

		case String(self.config.btn_12):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=11 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=11 PRESSED=false')
			}
			break

		case String(self.config.btn_13):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=12 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=12 PRESSED=false')
			}
			break

		case String(self.config.btn_14):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=13 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=13 PRESSED=false')
			}
			break

		case String(self.config.btn_15):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=14 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=14 PRESSED=false')
			}
			break

		case String(self.config.btn_16):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=15 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=15 PRESSED=false')
			}
			break
		case String(self.config.btn_17):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=16 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=16 PRESSED=false')
			}
			break

		case String(self.config.btn_18):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=17 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=17 PRESSED=false')
			}
			break

		case String(self.config.btn_19):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=18 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=18 PRESSED=false')
			}
			break

		case String(self.config.btn_20):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=19 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=19 PRESSED=false')
			}
			break

		case String(self.config.btn_21):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=20 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=20 PRESSED=false')
			}
			break

		case String(self.config.btn_22):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=21 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=21 PRESSED=false')
			}
			break

		case String(self.config.btn_23):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=22 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=22 PRESSED=false')
			}
			break

		case String(self.config.btn_24):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=23 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=23 PRESSED=false')
			}
			break

		case String(self.config.btn_25):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=24 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=24 PRESSED=false')
			}
			break

		case String(self.config.btn_26):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=25 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=25 PRESSED=false')
			}
			break
		case String(self.config.btn_27):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=26 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=26 PRESSED=false')
			}
			break

		case String(self.config.btn_28):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=27 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=27 PRESSED=false')
			}
			break

		case String(self.config.btn_29):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=28 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=28 PRESSED=false')
			}
			break

		case String(self.config.btn_30):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=29 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=29 PRESSED=false')
			}
			break

		case String(self.config.btn_31):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=30 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=30 PRESSED=false')
			}
			break

		case String(self.config.btn_32):
			self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=31 PRESSED=' + x.press)
			if (x.type == 'Encoder') {
				self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=31 PRESSED=false')
			}
			break

		// For all other preses than those bound to one of the 32 buttons above
		default:
			break
	}
}
