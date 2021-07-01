exports.setFeedbacks = function (i) {
	var self = i
	var feedbacks = {}

	const HWC = {
		type: 'number',
		label: 'HWC on the panel',
		id: 'hwc',
		default: 1,
		min: 1,
		max: 254
	}

	// const fgColor = self.rgb(255, 255, 255)
	// const bgColorRed = self.rgb(255, 0, 0)
	// const bgColorGreen = self.rgb(0, 255, 0)
	// const bgColorOrange = self.rgb(255, 102, 0)

	feedbacks.tieToHwc = {
		label: 'Tie HWC Press To This Button',
		description: 'Tie a HWC Press On The Panel To This Button',
		options: [HWC],
		callback: function (feedback, bank, info) {
			var hwc = self.data.hwc
			if (hwc.type == 'Button' || hwc.type == '4-way Button') {
				if (String(feedback.options.hwc) == hwc.id) {
					// console.log(bank)
					// console.log(info)

					// Press any button on any page, that have the hwc tied to it
					self.system.emit('bank_pressed', info.page, info.bank, hwc.dir)
				}	
			}
		}
	},
	feedbacks.tieToHwcLed = {
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
		],
		callback: function (feedback, bank, info) {
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

			// console.log(b_color)
			// console.log(b_bgcolor)

			// console.log(bank)
			// console.log(feedback)
	
			// convert color
			let rgb = self.convertIntColorToRawPanelColor(color)

			// console.log(self)
			// Send button BG/FG color to remote HWC LED
			self.sendCommand('HWCc#' + feedback.options.hwc + '=' + rgb)
			if (feedback.options.autoOnOff == true) {
				if (rgb == (128 + 64)) {
					self.sendCommand('HWC#' + feedback.options.hwc + '=0')
				} else {
					self.sendCommand('HWC#' + feedback.options.hwc + '=36')
				}
			}
		}
	},
	feedbacks.tieToLcd = {
		label: 'Tie HWC LCD/OLED to this Buttons Display',
		description: 'Tie a HWC LCD/OLED On The Panel To This Buttons Display',
		options: [HWC],
		callback: function (feedback, bank, info) {
			var cmd = bank.text

			// if the title includes a variable, get it's value
			if (bank.text.includes('$(')) {
				x = String(bank.text.split('$(')[1]).split(')')[0]
				var str = x.split(':') // Split instance and variable
				var selctInstances = str[0]
				var selctVariable = str[1]
				var temp
	
				// Gets the value of the selected value
				self.system.emit('variable_get', selctInstances, selctVariable, (definitions) => (temp = definitions))
				cmd = String(bank.text.split('$(')[0]) + temp + String(bank.text.split('$(')[1]).split(')')[1]
			}

			self.sendCommand('HWCt#' + feedback.options.hwc + '=' + '|||' + 'Comp ' + info.page + ':' + info.bank + '|1|' + cmd + '||')
		}
	}

	return feedbacks
}
