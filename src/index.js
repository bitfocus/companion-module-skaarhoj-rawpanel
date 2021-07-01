const instance_skel = require('../../../instance_skel')
var net = require('net')
const { executeAction, getActions, sendCommand } = require('./actions')
const { tcpClient } = require('./tcpClient')
const { storeData } = require('./storeData')
const { getConfigFields } = require('./config')
const { setFeedbacks } = require('./feedback')
// const { updateVariableDefinitions } = require('./variables')
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
			model: 'NaN',
			serial: 'NaN',
			version: 'Nan',
			sleep: 'False',
			hwc: {
				id: '',
				type: '',
				side: '',
				dir: '',
				val: '',
			},
		}

		this.clients = []

		this.config.host = this.config.host || ''
		this.config.tcpPort = this.config.tcpPort || 9923
		this.config.debug = this.config.debug || false
		this.config.apiPollInterval = this.config.apiPollInterval !== undefined ? this.config.apiPollInterval : 500

		this.storeData = storeData
		this.sendCommand = sendCommand
		// this.updateVariableDefinitions = updateVariableDefinitions
	}

    // Init module
	init() {
		this.status(1, 'Connecting')
		tcpClient.bind(this)()
		this.actions()
		this.init_feedbacks()
		// initPresets.bind(this)()
		// this.updateVariableDefinitions()
	}

    // New config saved
	updateConfig(config) {
		this.config = config
		tcpClient.bind(this)()
		this.actions()
		this.init_feedbacks()
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
		return newMin + (val - minVal) * (newMax - newMin) / (maxVal - minVal)
	};

	convertIntColorToRawPanelColor(color) {
		var simpelColor = this.rgbRev(parseInt(color))
		let r = this.normalizeBetweenTwoRanges(simpelColor.r, 0, 255, 0, 3) << 4
		let g = this.normalizeBetweenTwoRanges(simpelColor.g, 0, 255, 0, 3) << 2
		let b = this.normalizeBetweenTwoRanges(simpelColor.b, 0, 255, 0, 3)
		// this.debug((((r | g | b) + 128 + 64)).toString(2))
		return ((r | g | b) + 128 + 64)
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
