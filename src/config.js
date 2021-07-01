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
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
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
		{
			type: 'text',
			id: 'apiPollInfo',
			width: 12,
			label: 'API Poll Interval warning',
			value:
				'Adjusting the API Polling Interval can impact performance. <br />' +
				'A lower invterval allows for more responsive feedback, but may impact CPU usage. <br />' +
				'See the help section for more details.',
		},
		{
			type: 'textinput',
			id: 'apiPollInterval',
			label: 'API Polling interval (ms) (default: 500, min: 250)',
			width: 12,
			default: 500,
			min: 250,
			max: 10000,
			regex: this.REGEX_NUMBER,
		},
	]
}
