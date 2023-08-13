exports.updateVariableDefinitions = function () {
	const variables = []

	variables.push({
		label: `Device Model`,
		name: `model`,
	})

	variables.push({
		label: `Serial NR.`,
		name: `serial_nr`,
	})

	variables.push({
		label: `Firmware Version`,
		name: `version`,
	})

	// Detect Faders, Joysticks and Potmeters, and generate variables for them
	this.json_data.hwc.forEach((hwc) => {
		if (hwc.type.in !== null) {
			if (hwc.type.in === 'av') {
				variables.push({
					label: `Hwc: ${hwc.id} - ${hwc.txt}`,
					name: `Hwc_${hwc.id}_${hwc.txt}`,
				})
			} else if (hwc.type.in === 'ah') {
				variables.push({
					label: `Hwc: ${hwc.id} - ${hwc.txt}`,
					name: `Hwc_${hwc.id}_${hwc.txt}`,
				})
			} else if (hwc.type.in === 'ar') {
				variables.push({
					label: `Hwc: ${hwc.id} - ${hwc.txt}`,
					name: `Hwc_${hwc.id}_${hwc.txt}`,
				})
			} else if (hwc.type.in === 'iv' || hwc.type.in === 'ih') {
				variables.push({
					label: `Hwc: ${hwc.id} - ${hwc.txt}`,
					name: `Hwc_${hwc.id}_${hwc.txt}`,
				})
			} else if (hwc.type.in === 'ir') {
				variables.push({
					label: `Hwc: ${hwc.id} - ${hwc.txt}`,
					name: `Hwc_${hwc.id}_${hwc.txt}`,
				})
			}
		}
	})

	this.setVariableDefinitions(variables)
}
