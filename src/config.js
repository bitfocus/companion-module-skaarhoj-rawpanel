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
		{
			type: 'text',
			id: 'modelInfo',
			width: 12,
			label: 'SKAARHOJ Panel',
			value: 'Please Select the SKAARHOJ model you have or feel leave it on auto. This only affects the avaliable variables',
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'Select Your SKAARHOJ Panel',
			width: 12,
			default: 'Auto',
			choices: MODELS,
			minChoicesForSearch: 5,
		},
		{
			type: 'text',
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'number',
			label: 'TCP Timeout (1 sec -> 5 min, default 5 sec = 5000)',
			id: 'timeout',
			width: 12,
			default: 5000,
			min: 1000,
			max: 300000
		},
		{
			type: 'number',
			label: 'Backup LCD Refresh (5 sec -> 10 min, default 30 sec = 30000)',
			id: 'refresh',
			width: 12,
			default: 30000,
			min: 5000,
			max: 600000
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
				'Requires Companion to be restarted. But this will allow you the see what is being sent from the module and what is being received from the camera.',
		},
	]
}
