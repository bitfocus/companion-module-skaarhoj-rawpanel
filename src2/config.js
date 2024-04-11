var { MODELS } = require('./models.js')

exports.getConfigFields = function () {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Controler IP',
			width: 5,
			// regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'tcpPort',
			label: 'TCP Port (Default: 9923)',
			width: 4,
			default: 9923,
			regex: this.REGEX_PORT,
		},
		// { // TODO: Enable when ofline programming is posible, for use at a later point
		// 	type: 'text',
		// 	id: 'modelInfo',
		// 	width: 12,
		// 	label: 'SKAARHOJ Panel',
		// 	value: 'Please Select the SKAARHOJ model you have or feel free to leave it on auto. This will only affect the available variables.',
		// },
		// {
		// 	type: 'dropdown',
		// 	id: 'model',
		// 	label: 'Select Your SKAARHOJ Panel',
		// 	width: 12,
		// 	default: 'Auto',
		// 	choices: MODELS,
		// 	minChoicesForSearch: 5,
		// },
		{
			type: 'text',
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'checkbox',
			id: 'satEnable',
			width: 1,
			label: 'Enable',
			default: true,
		},
		{
			type: 'text',
			id: 'satInfo',
			width: 11,
			label: 'Companion Satellite API v2.0',
			value:
				"Enabling the satellite API, you will gain access to all 32 buttons, just like with the normal streamdeck. It even supports going to different pages and so on. <b>BUT</b> you will only get 32 buttons in total that work like this. You can still add other buttons manually by attaching the feedbacks to specific controls and giving them the appropriate HWC ID's. But latched buttons will only have appropriate feedback with these 32 API buttons.<br/> To Use these 32 buttons. Please type what <b>HWC ID</b> you want to tie to each button below:",
		},
		{
			type: 'text',
			id: 'rowInfo',
			width: 12,
			value:
				'<b>When filling in you HWC id\'s.</b> Format: "button_HWC, Screen_HWC" -> "1,10" if there is only one number screen will be asumed to be on the same HWC',
		},
		{
			type: 'text',
			id: 'rowInfo1',
			width: 12,
			value: '<b>Streamdeck Row 1,</b> Bank 1 - 8',
		},
		{
			type: 'textinput',
			label: 'Bank 1',
			id: 'btn_1',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 2',
			id: 'btn_2',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 3',
			id: 'btn_3',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 4',
			id: 'btn_4',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 5',
			id: 'btn_5',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 6',
			id: 'btn_6',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 7',
			id: 'btn_7',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 8',
			id: 'btn_8',
			width: 3,
		},
		{
			type: 'text',
			id: 'rowInfo1',
			width: 12,
			value: '<b>Streamdeck Row 2,</b> Bank 9 - 16',
		},
		{
			type: 'textinput',
			label: 'Bank 9',
			id: 'btn_9',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 10',
			id: 'btn_10',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 11',
			id: 'btn_11',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 12',
			id: 'btn_12',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 13',
			id: 'btn_13',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 14',
			id: 'btn_14',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 15',
			id: 'btn_15',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 16',
			id: 'btn_16',
			width: 3,
		},
		{
			type: 'text',
			id: 'rowInfo1',
			width: 12,
			value: '<b>Streamdeck Row 3,</b> Bank 17 - 24',
		},
		{
			type: 'textinput',
			label: 'Bank 17',
			id: 'btn_17',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 18',
			id: 'btn_18',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 19',
			id: 'btn_19',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 20',
			id: 'btn_20',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 21',
			id: 'btn_21',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 22',
			id: 'btn_22',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 23',
			id: 'btn_23',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 24',
			id: 'btn_24',
			width: 3,
		},
		{
			type: 'text',
			id: 'rowInfo1',
			width: 12,
			value: '<b>Streamdeck Row 4,</b> Bank 25 - 32',
		},
		{
			type: 'textinput',
			label: 'Bank 25',
			id: 'btn_25',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 26',
			id: 'btn_26',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 27',
			id: 'btn_27',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 28',
			id: 'btn_28',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 29',
			id: 'btn_29',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 30',
			id: 'btn_30',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 31',
			id: 'btn_31',
			width: 3,
		},
		{
			type: 'textinput',
			label: 'Bank 32',
			id: 'btn_32',
			width: 3,
		},
		{
			type: 'text',
			id: 'dummy2',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'checkbox',
			id: 'autoDim',
			width: 1,
			label: 'Enable',
			default: true,
		},
		{
			type: 'text',
			id: 'satInfo',
			width: 11,
			label: 'LED Feedback, Auto dim or off? (Might need Companion or the module to be restarted)',
			value:
				"If this is enabled, all HWC's that has an LED will light a dim white when the button is black in companion (mimics normal SKAARHOJ behaviour). Turn this off if you want them to turn completely off. (This would be more in line with how companion does it usually)",
		},
		{
			type: 'number',
			label: 'TCP Timeout (1 sec -> 5 min, default 5 sec = 5000)',
			id: 'timeout',
			width: 12,
			default: 5000,
			min: 1000,
			max: 300000,
		},
		{
			type: 'number',
			label: 'Backup LCD Refresh (5 sec -> 10 min, default 30 sec = 30000)',
			id: 'refresh',
			width: 12,
			default: 30000,
			min: 5000,
			max: 600000,
		},
		{
			type: 'checkbox',
			id: 'debug',
			width: 1,
			label: 'Enable',
			default: false,
		},
		{
			type: 'text',
			id: 'debugInfo',
			width: 11,
			label: 'Enable Debug To Log Window',
			value:
				'Requires Companion to be restarted. But this will allow you the see what is being sent from the module and what is being received from the panel.',
		},
	]
}