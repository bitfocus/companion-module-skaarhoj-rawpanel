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

	const fgColor = self.rgb(255, 255, 255)
	const bgColorRed = self.rgb(255, 0, 0)
	const bgColorGreen = self.rgb(0, 255, 0)
	const bgColorOrange = self.rgb(255, 102, 0)

	feedbacks.tieToHwc = {
		label: 'Tie HWC Press To This Button',
		description: 'Tie a HWC Press On The Panel To This Button',
		options: [HWC],
		callback: function (feedback, bank, info) {
			// console.log(bank)
			// console.log(info)
			var hwc = self.data.hwc
			if (hwc.type == 'Button' || hwc.type == '4-way Button') {
				if (String(feedback.options.hwc) == hwc.id) {
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
			var hwc = self.data.hwc
			// if (String(feedback.options.hwc) == hwc.id) {
				let color = bank.color
				if (feedback.options.color == 'bg') {
					color = bank.bgcolor
				}

				// convert color
				rgb = self.convertIntColorToRawPanelColor(color)

				// Send button BG/FG color to remote HWC LED
				self.sendCommand('HWCc#' + feedback.options.hwc + '=' + rgb)
				if (feedback.options.autoOnOff == true) {
					if (rgb == 128 + 64) {
						self.sendCommand('HWC#' + feedback.options.hwc + '=0')
					} else {
						self.sendCommand('HWC#' + feedback.options.hwc + '=4')
					}
				}
			// }	
		}
	},
	feedbacks.tieToLcd = {
		label: 'Tie HWC LCD/OLED to this Buttons Display',
		description: 'Tie a HWC LCD/OLED On The Panel To This Buttons Display',
		options: [HWC],
		callback: function (feedback, bank, info) {
			// var hwc = self.data.hwc
			// if (String(feedback.options.hwc) == hwc.id) {
				// Send button text to remote HWC Screen
				self.sendCommand('HWCt#' + feedback.options.hwc + '=' + '|||' + 'Comp ' + info.page + ':' + info.bank + '|1|' + bank.text + '||')
			// }	
		}
	}

	return feedbacks
}
