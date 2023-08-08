const instance_skel = require('../../../instance_skel')
var net = require('net')
const { executeAction, getActions, sendCommand } = require('./actions')
const { tcpClient } = require('./tcpClient')
const { satelliteAPI, sendAPI, hwcToSat } = require('./satelliteAPI')
const { storeData } = require('./storeData')
const { handleJSON } = require('./json')
const { bank_invalidate } = require('./getBankColor')
const { getConfigFields } = require('./config')
const { setFeedbacks } = require('./feedback')
const { updateVariableDefinitions } = require('./variables')
// const { initPresets } = require('./presets')

/**
 * Companion instance class for SKAARHOJ Raw Panel
 */
class RawPanelInstance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config)

		// Default instance state
		this.data = {
			startup: true,
			startupAPI: true,
			satConnected: false,
			model: 'NaN',
			serial: 'NaN',
			version: 'Nan',
			sleep: 'False',
			state: {
				Master: 0,
				P: 0,
				Q: 0,
				R: 0,
				S: 0,
			},
			shift: {
				Master: 0,
				A: 0,
				B: 0,
				C: 0,
				D: 0,
			},
			mem: {
				A: 0,
				B: 0,
				C: 0,
				D: 0,
				E: 0,
				F: 0,
				G: 0,
				H: 0,
				I: 0,
				J: 0,
				K: 0,
				L: 0,
			},
			hwc: {
				id: '',
				type: '',
				side: '',
				press: '',
				val: '',
			},
		}

		this.sdData = {
			keys: [],
		}
		this.json_data = {
			hwc: [],
			types: [],
		}
		this.clients = []

		this.config.host = this.config.host || ''
		this.config.tcpPort = this.config.tcpPort || 9923
		this.config.timeout = this.config.timeout !== undefined ? this.config.timeout : 5000
		this.config.refresh = this.config.refresh !== undefined ? this.config.refresh : 30000

		this.storeData = storeData
		this.handleJSON = handleJSON
		this.sendCommand = sendCommand
		this.satelliteAPI = satelliteAPI
		this.sendAPI = sendAPI
		this.hwcToSat = hwcToSat
		this.bank_invalidate = bank_invalidate
		this.system = system
		this.updateVariableDefinitions = updateVariableDefinitions
	}

	// Init module
	init() {
		this.callbacks = {}
		this.pages = {}
		this.bank_info = {}
		this.pages_getall()
		this.banks_getall()
		this.addSystemCallback('graphics_bank_invalidate', this.bank_invalidate.bind(this))

		this.status(1, 'Connecting')
		this.actions()
		this.init_feedbacks()
		tcpClient.bind(this)()
		// initPresets.bind(this)()
		this.updateVariableDefinitions()
	}

	// New config saved
	updateConfig(config) {
		this.config = config
		this.actions()
		this.init_feedbacks()

		// TODO: change to a get full key config instead at a later point
		// Remove and reconnect satellite device:
		this.sendAPI('QUIT')
		this.data.satConnected = false
		this.data.startupAPI = true
		if (this.api !== undefined) {
			this.api.destroy()
			delete this.api
		}

		tcpClient.bind(this)()
		this.updateVariableDefinitions()
		// initPresets.bind(this)()
	}

	// Set config page fields
	config_fields() {
		return getConfigFields.bind(this)()
	}

	// Instance removal clean up
	destroy() {
		// Remove TCP Client and close connection
		if (this.tcp !== undefined) {
			this.tcp.destroy()
			delete this.tcp
		}

		if (this.api !== undefined) {
			this.api.destroy()
			delete this.api
		}

		if (this.pollAPI) {
			clearInterval(this.pollAPI)
		}

		if (this.Refresh) {
			clearInterval(this.Refresh)
		}

		this.debug('destroy', this.id)
	}

	/**
	 * Normalizes a value from one range (current) to another (new).
	 *
	 * @param  { Number } val    //the current value (part of the current range).
	 * @param  { Number } minVal //the min value of the current value range.
	 * @param  { Number } maxVal //the max value of the current value range.
	 * @param  { Number } newMin //the min value of the new value range.
	 * @param  { Number } newMax //the max value of the new value range.
	 *
	 * @returns { Number } the normalized value.
	 */
	normalizeBetweenTwoRanges(val, minVal, maxVal, newMin, newMax) {
		return newMin + ((val - minVal) * (newMax - newMin)) / (maxVal - minVal)
	}

	convertIntColorToRawPanelColor(color) {
		var simpelColor = this.rgbRev(parseInt(color))
		let r = this.normalizeBetweenTwoRanges(simpelColor.r, 0, 255, 0, 3) << 4
		let g = this.normalizeBetweenTwoRanges(simpelColor.g, 0, 255, 0, 3) << 2
		let b = this.normalizeBetweenTwoRanges(simpelColor.b, 0, 255, 0, 3)
		// this.debug((((r | g | b) + 128 + 64)).toString(2))
		return (r | g | b) + 128 + 64
	}

	addSystemCallback = function (name, cb) {
		var self = this

		if (self.callbacks[name] === undefined) {
			self.callbacks[name] = cb.bind(self)
			self.system.on(name, cb)
		}
	}

	banks_getall = function () {
		var self = this

		system.emit('db_get', 'bank', function (banks) {
			self.banks = banks

			const new_values = {}

			for (var p in banks) {
				for (var b in banks[p]) {
					var tb = banks[p][b]
					var k = `${p}_${b}`
					var v = `b_text_${k}`
					if (tb.style === 'png') {
						// need a copy, not a reference
						self.bank_info[k] = JSON.parse(JSON.stringify(tb))
						new_values[v] = self.bank_info[k].text = self.check_var_recursion(v, tb.text)
						self.checkFeedbacks('tieToLcd') // Send initial LCD data to the panel
					} else {
						self.checkFeedbacks('tieToLcd') // Send initial LCD data to the panel
						new_values[v] = undefined
					}
				}
			}

			// self.setVariables(new_values)
		})
	}

	pages_getall = function () {
		var self = this

		self.system.emit('get_page', function (pages) {
			self.pages = pages
		})
	}

	check_var_recursion = function (v, realText) {
		var self = this
		var newText

		if (realText) {
			if (realText.includes(v)) {
				// recursion error:
				// button trying to include itself
				newText = '$RE'
			} else {
				system.emit('variable_parse', realText, function (str) {
					newText = str
				})
			}
		}
		return newText
	}

	// ##########################
	// #### Instance Actions ####
	// ##########################

	// Set available actions
	actions() {
		this.system.emit('instance_actions', this.id, getActions.bind(this)())
	}

	// Execute action
	action(action) {
		executeAction.bind(this)(action)
	}

	// ############################
	// #### Instance Feedbacks ####
	// ############################

	init_feedbacks = function (system) {
		this.setFeedbackDefinitions(setFeedbacks(this))
	}
}
module.exports = RawPanelInstance
