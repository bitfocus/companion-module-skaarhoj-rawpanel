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
                    label: `Hwc ${hwc.id} Slider/Fader`,
                    name: `hwc_${hwc.id}_fader`,
                })
            } else if (hwc.type.in === 'ah') {
                variables.push({
                    label: `Hwc ${hwc.id} Potentiometer`,
                    name: `hwc_${hwc.id}_potentiometer`,
                })
            } else if (hwc.type.in === 'ar') {
                variables.push({
                    label: `Hwc ${hwc.id} Absolute rotation`,
                    name: `hwc_${hwc.id}_a_rotation`,
                })
            } else if (hwc.type.in === 'iv' || hwc.type.in === 'ih') {
                variables.push({
                    label: `Hwc ${hwc.id} Joystick`,
                    name: `hwc_${hwc.id}_joystick`,
                })
            } else if (hwc.type.in === 'ir') {
                variables.push({
                    label: `Hwc ${hwc.id} Intensity rotation`,
                    name: `hwc_${hwc.id}_i_rotation`,
                })
            }
        }
    })

    this.setVariableDefinitions(variables)
}
