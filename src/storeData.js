const { keyBy } = require("lodash")

exports.storeData = function (str) {
	var self = this
    data = self.data

    // Store model nr. and serial nr.
    if (str.includes('_model')) {
        str_arr = str.split('\n')
        str_arr.forEach(element => {
            x = element.split('=')
            switch (x[0]) {
                case '_model':
                    data.model = x[1]
                    break;
                case '_serial':
                    data.serial = x[1]
                    break;
                case '_version':
                    data.version = x[1]
                    break;        
                default:
                    break;
            }
        });
        this.data = data
    }

    // Update if the panel goes to sleep or wakes up
    if (str.includes('_isSleeping')) {
        if (str.split('_isSleeping=') == '1') {
            data.sleep = 'True'
        } else {
            data.sleep = 'False'
        }
        this.data = data
    }

    // Update if state : reg changes
    if (str.includes('_state')) {
        // State: 0-9
        // REG: Master, P, Q, R, S
        console.log(str)
    }

    // Update if shift : reg changes
    if (str.includes('_shift')) {
        // Level: 0-10
        // REG: Master, A, B, C, D
        console.log(str)
    }

    // check if we recieved a keypress
    if (str.substring(0, 4) === 'HWC#') {
        str = str.substring(4)
        var hwc = this.data.hwc
        hwc.id = ''
        hwc.type = ''
        hwc.side = ''
        hwc.val = 0

        // Button Click
        if (str.includes('Up') || str.includes('Down')) {
            hwc.id = String(str.split('HWC#')).split('=')[0]
            hwc.type = 'Button'
            hwc.dir = str.includes('Down')

            // 4-Way Button Click:
            if (str.includes('.')) {
                hwc.id = String(str.split('HWC#')).split('.')[0]
                hwc.type = '4-way Button'

                x = String(str.split('.')[1]).split('=')[0]
                switch (x) {
                    case '1': 
                        hwc.side = 'Top' 
                        break
                    case '2': 
                        hwc.side = 'Left' 
                        break
                    case '4': 
                        hwc.side = 'Bottom' 
                        break
                    case '8': 
                        hwc.side = 'Right'  
                        break
                    default:
                        break
                }
                self.debug('HWC: ' + hwc.id + ' Type: ' + hwc.type + ' Side: ' + hwc.side + ' Dir: ' + hwc.dir)
            } else {
                self.debug('HWC: ' + hwc.id + ' Type: ' + hwc.type + ' Dir: ' + hwc.dir)
            }

            // press matching button on page 1, needs to be changed
            // self.system.emit('bank_pressed', 1, hwcId, hwcDir)
        }

        // Encoder press
        else if (str.includes('Press')) {
            hwc.id = String(str.split('HWC#')).split('=')[0]
            hwc.type = 'Encoder'
            hwc.dir = str.includes('Press')

            self.debug('HWC: ' + hwc.id + ' Type: ' + hwc.type + ' Dir: ' + hwc.dir)
            // press matching button on page 1, needs to be changed
            // self.system.emit('bank_pressed', 1, hwcId, true)
            // self.system.emit('bank_pressed', 1, hwcId, false)
        }

        // Encoder turn
        else if (str.includes('Enc')) {
            hwc.id = String(str.split('HWC#')).split('=')[0]
            hwc.type = 'Encoder'
            hwc.val = parseInt(str.split('Enc:')[1])

            self.debug('HWC: ' + hwc.id + ' Type: ' + hwc.type + ' Side: ' + hwc.val)
            // press matching button on page 1, needs to be changed
            // self.system.emit('bank_pressed', 1, hwcId, true)
            // self.system.emit('bank_pressed', 1, hwcId, false)
        }
        
        // Fader change
        else if (str.includes('Abs')) {
            hwc.id = String(str.split('HWC#')).split('=')[0]
            hwc.type = 'Fader'

            // Parse analog value, could be used for tbar in vmix and alike
            hwc.val = parseInt(String(str.split('=')[1]).split(':')[1])
            self.debug('HWC: ' + hwc.id + ' Type: ' + hwc.type + ' value: ' + hwc.val)
        }

        // Joystick change (speed)
        else if (str.includes('Speed')) {
            hwc.id = String(str.split('HWC#')).split('=')[0]
            hwc.type = 'Fader'

            // Parse analog value, could be used for tbar in vmix and alike
            hwc.val = parseInt(String(str.split('=')[1]).split(':')[1])
            self.debug('HWC: ' + hwc.id + ' Type: ' + hwc.type + ' value: ' + hwc.val)
        }

        this.data.hwc = hwc
        this.checkFeedbacks()
        var hwc = this.data.hwc
        hwc.id = ''
        hwc.type = ''
        hwc.side = ''
        hwc.val = 0
        this.data.hwc = hwc
   }

}