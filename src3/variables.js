exports.UpdateVariableDefinitions = async function (self) {
	const variables = []

	variables.push({
		name: `Device Model`,
		variableId: `model`,
	})

	variables.push({
		name: `Serial NR.`,
		variableId: `serial_nr`,
	})

	variables.push({
		name: `Firmware Version`,
		variableId: `version`,
	})

	// Detect Faders, Joysticks and Potmeters, and generate variables for them
	self.json_data.hwc.forEach((hwc) => {
		if (hwc.type.in !== null) {
			if (hwc.type.in === 'av') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt}`,
					variableId: `Hwc_${hwc.id}`,
				})
			} else if (hwc.type.in === 'ah') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt}`,
					variableId: `Hwc_${hwc.id}`,
				})
			} else if (hwc.type.in === 'ar') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt}`,
					variableId: `Hwc_${hwc.id}`,
				})
			} else if (hwc.type.in === 'iv' || hwc.type.in === 'ih') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt}`,
					variableId: `Hwc_${hwc.id}`,
				})
			} else if (hwc.type.in === 'ir') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt}`,
					variableId: `Hwc_${hwc.id}`,
				})
			}
		}
	})

	self.setVariableDefinitions(variables)
}
