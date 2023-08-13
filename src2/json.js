const _ = require('lodash')

exports.handleJSON = function (buffer) {
	var self = this
	let json = JSON.parse(buffer.split('_panelTopology_HWC=')[1])

	const hwcData = (hwc) => {
		const data = { ...hwc.$ }

		data.id = hwc.id
		data.txt = hwc.txt

		if (hwc.type) {
			data.type = {}
			data.type.id = hwc.type

			if (json.typeIndex[hwc.type].out) {
				data.type.out = json.typeIndex[hwc.type].out
			}

			if (json.typeIndex[hwc.type].in) {
				data.type.in = json.typeIndex[hwc.type].in
			}

			if (json.typeIndex[hwc.type].disp) {
				data.type.disp = true
			}

			if (json.typeIndex[hwc.type].desc) {
				data.type.desc = json.typeIndex[hwc.type].desc
			}

			if (json.typeIndex[hwc.type].sub) {
				data.type.sub = json.typeIndex[hwc.type].sub
			}
		}

		return data
	}

	const json_data = {
		hwc: json.HWc[0] !== '' ? json.HWc.map(hwcData) : [],
		types: json.typeIndex,
	}

	// Check for changes to update feedbacks and variables
	const changes = new Set([])

	this.json_data = json_data
	// console.log(json_data.hwc)

	this.updateVariableDefinitions()
}
