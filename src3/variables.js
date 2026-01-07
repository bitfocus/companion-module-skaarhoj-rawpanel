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

	// Detect Buttons, Faders, Joysticks and Potmeters, and generate variables for them, with their current values
	self.json_data.hwc.forEach((hwc) => {
		if (hwc.type.in !== null) {
			self.log('info', `Detected HWC Input: ID=${hwc.id}, Type=${hwc.type.in}, Text='${hwc.txt}'`)

			if (hwc.type.in === 'b') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Press`,
					variableId: `Hwc_${hwc.id}_press`,
				})
			} else if (hwc.type.in === 'b4' || hwc.type.in === 'b2v' || hwc.type.in === 'b2h') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Press`,
					variableId: `Hwc_${hwc.id}_press`,
				})
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Edge`,
					variableId: `Hwc_${hwc.id}_edge`,
				})
			} else if (hwc.type.in === 'gpi') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Press`,
					variableId: `Hwc_${hwc.id}_press`,
				})
			} else if (hwc.type.in === 'pb') {
				// encoders (pulses + button)
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Press`,
					variableId: `Hwc_${hwc.id}_press`,
				})
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Pulse`,
					variableId: `Hwc_${hwc.id}_pulse`,
				})
			} else if (hwc.type.in === 'pi') {
				// encoder with intensity mode (pulses + speed value)
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Pulse`,
					variableId: `Hwc_${hwc.id}_pulse`,
				})
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Value`,
					variableId: `Hwc_${hwc.id}_value`,
				})
			} else if (hwc.type.in === 'p') {
				// encoders (pulses, no button)
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Pulse`,
					variableId: `Hwc_${hwc.id}_pulse`,
				})
			} else if (hwc.type.in === 'av') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Value`,
					variableId: `Hwc_${hwc.id}_value`,
				})
			} else if (hwc.type.in === 'ah') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Value`,
					variableId: `Hwc_${hwc.id}_value`,
				})
			} else if (hwc.type.in === 'ar') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Value`,
					variableId: `Hwc_${hwc.id}_value`,
				})
			} else if (hwc.type.in === 'iv' || hwc.type.in === 'ih') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Value`,
					variableId: `Hwc_${hwc.id}_value`,
				})
			} else if (hwc.type.in === 'ir') {
				variables.push({
					name: `Hwc: ${hwc.id} - ${hwc.txt} - Value`,
					variableId: `Hwc_${hwc.id}_value`,
				})
			}
		}
	})

	self.setVariableDefinitions(variables)
}
