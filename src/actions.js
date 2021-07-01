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
		max: 254
	}

	return {
		SetButtonState: {
			label: 'Set Button Status On/Off/Dimmed',
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
					max: 8
				},
				{
					type: 'number',
					label: 'LCD/OLED (1-8)',
					id: 'lcd',
					default: 5,
					min: 1,
					max: 8
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
	var conf = self.config

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
			this.sendCommand('HWCt#' + opt.hwc + '=' + '|||' +  opt.title + isLabel + opt.label1 + label2)
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

		default: // all actions, not mentioned above
			this.sendCommand(opt.cmd)
			break
	}

}

exports.sendCommand = function(message) {
	if (message !== undefined) {

		this.debug('sending ', message, 'to', this.config.host)

		if (this.tcp !== undefined && this.tcp.connected) {
			this.tcp.send(message + '\n')
		} else {
			this.debug('Socket not connected :(')
		}
	}
}
