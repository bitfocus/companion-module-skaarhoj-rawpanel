exports.setFeedbacks = function (i) {
	var self = i
	var feedbacks = {}

	// const buttonColor = [
	// 	{ id: '128', label: 'Default Color' },
	// 	{ id: '129', label: 'OFF' },
	// 	{ id: '130', label: 'White' },
	// 	{ id: '131', label: 'Warm White' },
	// 	{ id: '132', label: 'Red' },
	// 	{ id: '133', label: 'Rose' },
	// 	{ id: '134', label: 'Pink' },
	// 	{ id: '135', label: 'Purple' },
	// 	{ id: '136', label: 'Amber' },
	// 	{ id: '137', label: 'Yellow' },
	// 	{ id: '138', label: 'Dark blue' },
	// 	{ id: '139', label: 'Blue' },
	// 	{ id: '140', label: 'Ice' },
	// 	{ id: '141', label: 'Cyan' },
	// 	{ id: '142', label: 'Spring' },
	// 	{ id: '143', label: 'Green' },
	// 	{ id: '144', label: 'Mint' },
	// ]

	const HWC = {
		type: 'number',
		label: 'HWC on the panel',
		id: 'hwc',
		default: 1,
		min: 1,
		max: 254,
	}

	// const fgColor = self.rgb(255, 255, 255)
	// const bgColorRed = self.rgb(255, 0, 0)
	// const bgColorGreen = self.rgb(0, 255, 0)
	// const bgColorOrange = self.rgb(255, 102, 0)

	;(feedbacks.tieToHwc = {
		label: 'Generic - Tie HWC Press To This Button',
		description: 'Tie a HWC Press On The Panel To This Button',
		options: [HWC],
		callback: async function (feedback, bank, info) {
			var hwc = self.data.hwc
			if (String(feedback.options.hwc) == hwc.id) {
				if (hwc.type == 'Button' || hwc.type == '4-way Button') {
					if (hwc.press == 'true' || hwc.press == true) {
						self.system.emit('bank_pressed', info.page, info.bank, true)
					} else if (hwc.press == 'false' || hwc.press == false) {
						self.system.emit('bank_pressed', info.page, info.bank, false)
					}
				} else if (hwc.type == 'Encoder' && hwc.press == 'true') {
					self.system.emit('bank_pressed', info.page, info.bank, true)
					await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](100) // 50 mili sec
					self.system.emit('bank_pressed', info.page, info.bank, false)
				} else if (hwc.type == 'Joystick' || hwc.type == 'Fader') {
					// press if outside deadzone
					if (hwc.val <= -50 || hwc.val >= 50) {
						self.system.emit('bank_pressed', info.page, info.bank, true)
					} else {
						// Release if within dead zone
						self.system.emit('bank_pressed', info.page, info.bank, false)
					}
				}
			}
		},
	}),
		(feedbacks.tieToHwc4Way = {
			label: '4-Way/Edge Button - Tie HWC To This Button',
			description: 'Tie a HWC 4-Way Button On The Panel To This Button',
			options: [
				HWC,
				{
					type: 'dropdown',
					label: 'Select Click Type',
					id: 'cmd',
					default: 'All',
					choices: [
						{ id: 'All', label: 'Any/All (Normal Button)' },
						{ id: 'Top', label: 'Top Edge' },
						{ id: 'Bottom', label: 'Bottom Edge' },
						{ id: 'Left', label: 'Left Edge' },
						{ id: 'Right', label: 'Right Edge' },
					],
				},
			],
			callback: async function (feedback, bank, info) {
				var hwc = self.data.hwc
				if (String(feedback.options.hwc) == hwc.id) {
					if (hwc.type == 'Button' || hwc.type == '4-way Button') {
						x = feedback.options.cmd

						// Release Press
						if (hwc.press == 'false') {
							self.system.emit('bank_pressed', info.page, info.bank, false)
						}

						// ON Any Edge = Press
						else if (x == 'All') {
							self.system.emit('bank_pressed', info.page, info.bank, true)
						}

						// Only on Top or Botton or Left or Rigt Edge
						else if (x == hwc.side) {
							self.system.emit('bank_pressed', info.page, info.bank, true)
						}
					}
				}
			},
		}),
		(feedbacks.tieToHwcEncoder = {
			label: 'Encoder - Tie HWC To This Button',
			description: 'Tie a HWC Encoder On The Panel To This Button',
			options: [
				HWC,
				{
					type: 'dropdown',
					label: 'Select Click Type',
					id: 'cmd',
					default: 'Press',
					choices: [
						{ id: 'Press', label: 'Press Down' },
						{ id: 'Left', label: 'Rotate Left' },
						{ id: 'Right', label: 'Rotate Right' },
					],
				},
			],
			callback: async function (feedback, bank, info) {
				var hwc = self.data.hwc
				if (String(feedback.options.hwc) == hwc.id) {
					self.debug(hwc)
					if (hwc.type == '4-way Button') {
						x = feedback.options.cmd

						// Pressed
						if (x == 'Press' && hwc.press == 'true' && hwc.side == '') {
							self.system.emit('bank_pressed', info.page, info.bank, true)
						}

						// Release
						else if (x == 'Press' && hwc.press == 'false' && hwc.side == '') {
							self.system.emit('bank_pressed', info.page, info.bank, false)
						}
					} else if (hwc.type == 'Encoder') {
						x = feedback.options.cmd

						// Left
						if (x == 'Left' && hwc.val == -1) {
							self.system.emit('bank_pressed', info.page, info.bank, true)
							await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](100) // 50 mili sec
							self.system.emit('bank_pressed', info.page, info.bank, false)
						}

						// Right
						if (x == 'Right' && hwc.val == 1) {
							self.system.emit('bank_pressed', info.page, info.bank, true)
							await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](100) // 50 mili sec
							self.system.emit('bank_pressed', info.page, info.bank, false)
						}

						// Press
						else if (x == 'Press' && hwc.press == 'true') {
							self.system.emit('bank_pressed', info.page, info.bank, true)
							await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](100) // 50 mili sec
							self.system.emit('bank_pressed', info.page, info.bank, false)
						}
					}
				}
			},
		}),
		(feedbacks.tieToHwcJoystick = {
			label: 'Joystick - Tie HWC To This Button',
			description: 'Tie a HWC Joystick On The Panel To This Button',
			options: [
				HWC,
				{
					type: 'dropdown',
					label: 'Select Click Type',
					id: 'cmd',
					default: 'Both',
					choices: [
						{ id: 'Both', label: 'Both Up and Down' },
						{ id: 'Up', label: 'Only on Up/Right' },
						{ id: 'Down', label: 'Only on Down/Left' },
					],
				},
				{
					type: 'number',
					label: 'Deadzone (1-450, Default 50)',
					id: 'deadzone',
					default: 50,
					min: 1,
					max: 450,
				},
			],
			callback: async function (feedback, bank, info) {
				var hwc = self.data.hwc
				if (String(feedback.options.hwc) == hwc.id) {
					if (hwc.type == 'Joystick') {
						x = feedback.options.cmd
						d = feedback.options.deadzone

						// Both
						if (x == 'Both' && (hwc.val >= d || hwc.val <= d * -1)) {
							self.system.emit('bank_pressed', info.page, info.bank, true)
						}

						// Up
						else if (x == 'Up' && hwc.val >= d) {
							self.system.emit('bank_pressed', info.page, info.bank, true)
						}

						// Down
						else if (x == 'Down' && hwc.val <= d * -1) {
							self.system.emit('bank_pressed', info.page, info.bank, true)
						}

						// Release
						else if (hwc.val > d * -1 || hwc.val < d) {
							self.system.emit('bank_pressed', info.page, info.bank, false)
						}
					}
				}
			},
		}),
		(feedbacks.tieToHwcLed = {
			label: 'Tie HWC LED To This Button',
			description: 'Tie a HWC LED On The Panel To This Button',
			options: [
				HWC,
				{
					type: 'dropdown',
					label: 'Select Color',
					id: 'color',
					default: 'bg',
					choices: [
						{ id: 'bg', label: 'Bagground Color' },
						{ id: 'fg', label: 'Text Color' },
					],
				},
				{
					type: 'checkbox',
					id: 'autoOnOff',
					label: 'Auto Turn ON/OFF',
					default: true,
				},
				{
					type: 'checkbox',
					id: 'dimmed',
					label: 'Set Dimmed When OFF?',
					default: true,
				},
			],
			callback: async function (feedback, bank, info) {
				let b_color
				let b_bgcolor
				var b = self.bank_info[`${info.page}_${info.bank}`]
				if (b !== undefined) {
					b_color = b.color
					b_bgcolor = b.bgcolor
				}

				let color = b_color
				if (feedback.options.color == 'bg') {
					color = b_bgcolor
				}

				// convert color
				let rgb = self.convertIntColorToRawPanelColor(color)

				// console.log(self)
				// Send button BG/FG color to remote HWC LED
				if (feedback.options.autoOnOff == true) {
					if (rgb == 128 + 64) {
						if (feedback.options.dimmed == true) {
							self.sendCommand('HWCc#' + feedback.options.hwc + '=128')
							self.sendCommand('HWC#' + feedback.options.hwc + '=5') // Dimmed
						} else {
							self.sendCommand('HWC#' + feedback.options.hwc + '=0') // OFF
						}
					} else {
						self.sendCommand('HWCc#' + feedback.options.hwc + '=' + rgb)
						self.sendCommand('HWC#' + feedback.options.hwc + '=36') // ON
					}
				} else {
					self.sendCommand('HWCc#' + feedback.options.hwc + '=' + rgb)
				}
			},
		}),
		(feedbacks.tieToLcd = {
			label: 'Tie HWC LCD/OLED to this Buttons Display',
			description: 'Tie a HWC LCD/OLED On The Panel To This Buttons Display',
			options: [HWC],
			callback: async function (feedback, bank, info) {
				var cmd = bank.text

				// Replaces all variables with their selected values

				// if the title includes a variable, get it's value
				if (bank.text.includes('$(')) {
					// x = String(bank.text.split('$(')[1]).split(')')[0]
					// var str = x.split(':') // Split instance and variable
					// var selctInstances = str[0]
					// var selctVariable = str[1]
					// var temp

					// Gets the value of the selected value
					// self.system.emit('variable_get', selctInstances, selctVariable, (definitions) => (temp = definitions))
					// cmd = String(bank.text.split('$(')[0]) + temp + String(bank.text.split('$(')[1]).split(')')[1]
					this.parseVariables(bank.text, (temp) => {
						cmd = temp
					})
				}

				// If the text is longer that 24 characters split it up in two
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
							'HWCt#' +
								feedback.options.hwc +
								'=' +
								'|||' +
								'Comp ' +
								info.page +
								':' +
								info.bank +
								'|1|' +
								x[0] +
								'|' +
								x[1] +
								'|'
						)
					} else if (x.length == 3) {
						self.sendCommand('HWCt#' + feedback.options.hwc + '=' + '|||' + x[0] + '|1|' + x[1] + '|' + x[2] + '|')
					} else {
						cmd = cmd.split('\\n').join(' ')
						self.sendCommand(
							'HWCt#' + feedback.options.hwc + '=' + '|||' + 'Comp ' + info.page + ':' + info.bank + '|1|' + cmd + '||'
						)
					}
				} else {
					self.sendCommand(
						'HWCt#' + feedback.options.hwc + '=' + '|||' + 'Comp ' + info.page + ':' + info.bank + '|1|' + cmd + '||'
					)
				}
			},
		})

	return feedbacks
}
