const { InstanceBase, InstanceStatus, runEntrypoint, TCPHelper, splitRgb } = require('@companion-module/base')
const { ConfigFields } = require('./config.js')
const UpgradeScripts = require('./upgrades')
const { UpdateActions, executeAction, sendCommand } = require('./actions')
const { UpdateFeedbacks } = require('./feedbacks')
const { UpdateVariableDefinitions } = require('./variables')
const { tcpClient } = require('./tcpClient')
const { satelliteAPI, sendAPI, hwcToSat } = require('./satelliteAPI')
const { storeData } = require('./storeData')
const { handleJSON } = require('./json')

class RawPanelInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

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

		// this.config.host = this.config.host || ''
		// this.config.tcpPort = this.config.tcpPort || 9923
		// this.config.timeout = this.config.timeout !== undefined ? this.config.timeout : 5000
		// this.config.refresh = this.config.refresh !== undefined ? this.config.refresh : 30000

		this.executeAction = executeAction
		this.sendCommand = sendCommand
		this.storeData = storeData
		this.handleJSON = handleJSON
		this.satelliteAPI = satelliteAPI
		this.sendAPI = sendAPI
		this.tcpClient = tcpClient
		this.hwcToSat = hwcToSat
		this.TCPHelper = TCPHelper
		this.UpdateVariableDefinitions = UpdateVariableDefinitions
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		tcpClient.bind(this)()
		this.updateVariableDefinitions() // export variable definitions
	}

	async configUpdated(config) {
		this.config = config

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks

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
		this.updateVariableDefinitions() // export variable definitions
	}

	// When module gets deleted
	async destroy() {
		// Remove TCP Client and close connection
		if (this.tcp) {
			this.tcp.destroy()
			delete this.tcp
		}

		if (this.api) {
			this.api.destroy()
			delete this.api
		}

		if (this.pollAPI) {
			clearInterval(this.pollAPI)
		}

		if (this.Refresh) {
			clearInterval(this.Refresh)
		}

		if (this.pingSatellite) {
			clearInterval(this.pingSatellite)
		}

		this.log('debug', 'destroy')
	}
	
	// Return config fields for web config
	getConfigFields() {
		return ConfigFields
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	// Helpers:

	normalizeBetweenTwoRanges(val, minVal, maxVal, newMin, newMax) {
		return newMin + ((val - minVal) * (newMax - newMin)) / (maxVal - minVal)
	}

	convertIntColorToRawPanelColor(color) {
		var simpelColor = splitRgb(parseInt(color))
		let r = this.normalizeBetweenTwoRanges(simpelColor.r, 0, 255, 0, 3) << 4
		let g = this.normalizeBetweenTwoRanges(simpelColor.g, 0, 255, 0, 3) << 2
		let b = this.normalizeBetweenTwoRanges(simpelColor.b, 0, 255, 0, 3)
		return (r | g | b) + 128 + 64
	}

}

runEntrypoint(RawPanelInstance, UpgradeScripts)