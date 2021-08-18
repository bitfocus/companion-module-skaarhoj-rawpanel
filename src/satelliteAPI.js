const { raw } = require('express')
var tcp = require('../../../tcp')
const { storeData } = require('./storeData')

exports.satelliteAPI = function () {
    var self = this
    var host = '127.0.0.1'
    var port = 16622  //self.config.tcpPort

    if (self.api !== undefined) {
		self.api.destroy()
        delete self.api
	}

	if (self.config.satEnable) {
        self.api = new tcp(host, port)

        self.api.on('status_change', function (status, message) {
            // self.status(status, message)
        })

        self.api.on('error', function (err) {
            self.data.satConnected = false
            self.data.startupAPI = true
            self.debug('Network error', err)
            // self.status(self.STATE_ERROR, err)
            self.log('error', 'Network error: ' + err.message)
        })

        self.api.on('connect', function () {
            self.data.startupAPI = false
            // self.debug('Connected to panel: ' + host + ':' + port)
            // if (self.config.debug == true) {
            //     self.log('warn', 'Connected to panel: ' + host + ':' + port)
            // }
        })

        self.api.on('data', function (data) {
            // self.debug('data: ' + String(data))

            let str_raw = String(data)
            let str_split = str_raw.trim() // remove new line, carage return and so on.

            str_split = str_split.split('\n')
            for (let index = 0; index < str_split.length; index++) {
                let str = str_split[index]               
                self.debug(str)

                // Create a satallite device on first connect
                if (str.includes('BEGIN Companion Version=2.2.0') == true) {
                    let s = self.data.model
                    if (s.includes('SK_') == true) { s = s.split('SK_')[1]}
                    self.sendAPI('ADD-DEVICE DEVICEID=' + self.data.serial + ' PRODUCT_NAME="SKAARHOJ ' + s + '" BITMAPS=false COLORS=true')
                    continue
                }

                // Sycceded in creating device
                if (str.includes('ADD-DEVICE OK')) {
                    self.data.satConnected = true
                    continue
                }
            
                // Respond to ping Commands
                if (str.includes('PING')) {
                    self.debug('Sat Ping')
                    continue
                }

                // Recieved a Brightness Command
                if (str.includes('BRIGHTNESS')) {
                    self.debug('Sat Brightnss')
                    continue
                }

                // Recieved a Clear all Command
                if (str.includes('KEY-CLEAR')) {
                    self.debug('Sat Key Clear')
                    continue
                }

                // recived a Key-State Command
                if (str.includes('KEY-STATE')) {
                    self.debug('Sat Key State')
                    self.debug(str)

                    let key = 1 + parseInt((str.split('KEY=')[1]).split(' ')[0])

                    if (str.includes('COLOR=#')) {
                        let rawColor = (str.split('COLOR=#')[1]).split(' ')[0]
                        color = parseInt(rawColor, 16)
                        let rgb = self.convertIntColorToRawPanelColor(color)

                        self.debug(key)
                        self.debug(color)

                        if (rgb == (128 + 64)) {
                            self.sendCommand('HWCc#' + key + '=128')
                            self.sendCommand('HWC#' + key + '=5') // Dimmed
                            // self.sendCommand('HWC#' + '1' + '=0') // OFF
                        } else {
                            self.sendCommand('HWCc#' + key + '=' + rgb)
                            self.sendCommand('HWC#' + key + '=36') // ON
                        }    
                    }

                    continue
                }
            }
        })
    }
    return self
}

exports.sendAPI = async function(message) {
	if (message !== undefined) {
		if (this.api !== undefined && this.api.connected) {
			this.api.send(message + '\r\n')
		} else {
			this.debug('Socket not connected :(')
		}
		await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](50) // 5 mili sec
	}
}

exports.hwcToSat = function(message) {
    self = this
    let hwc = self.data.hwc

    // IF the HWC ID is 0 return
    if (hwc.id == '0') { return }

    // self.debug(hwc)

    // check if it's atleast a press or a release, if not return
    if (hwc.press == '') { return }

    switch (hwc.id) {
        case String(self.config.btn_1):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=0 PRESSED=' + hwc.press)            
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=0 PRESSED=false')
            }
            break;

        case String(self.config.btn_2):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=1 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=1 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_3):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=2 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=2 PRESSED=false')
            }
            break;
                
        case String(self.config.btn_4):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=3 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=3 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_5):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=4 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=4 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_6):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=5 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=5 PRESSED=false')
            }
            break;
        case String(self.config.btn_7):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=6 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=6 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_8):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=7 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=7 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_9):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=8 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=8 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_10):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=9 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=9 PRESSED=false')
            }
            break;
                        
        case String(self.config.btn_11):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=10 PRESSED=' + hwc.press)            
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=10 PRESSED=false')
            }
            break;

        case String(self.config.btn_12):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=11 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=11 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_13):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=12 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=12 PRESSED=false')
            }
            break;

        case String(self.config.btn_14):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=13 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=13 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_15):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=14 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=14 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_16):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=15 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=15 PRESSED=false')
            }
            break;
        case String(self.config.btn_17):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=16 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=16 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_18):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=17 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=17 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_19):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=18 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=18 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_20):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=19 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=19 PRESSED=false')
            }
            break;

        case String(self.config.btn_21):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=20 PRESSED=' + hwc.press)            
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=20 PRESSED=false')
            }
            break;

        case String(self.config.btn_22):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=21 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=21 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_23):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=22 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=22 PRESSED=false')
            }
            break;
                
        case String(self.config.btn_24):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=23 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=23 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_25):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=24 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=24 PRESSED=false')
            }
            break;
    
        case String(self.config.btn_26):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=25 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=25 PRESSED=false')
            }
            break;
        case String(self.config.btn_27):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=26 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=26 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_28):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=27 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=27 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_29):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=28 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=28 PRESSED=false')
            }
            break;
        
        case String(self.config.btn_30):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=29 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=29 PRESSED=false')
            }
            break;
                    
        case String(self.config.btn_31):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=30 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=30 PRESSED=false')
            }
            break;

        case String(self.config.btn_32):
            self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=31 PRESSED=' + hwc.press)
            if (hwc.type == 'Encoder') {
                self.sendAPI('KEY-PRESS DEVICEID=' + self.data.serial + ' KEY=31 PRESSED=false')
            }
            break;

        // For all other preses than those bound to one of the 32 buttons above
        default:
            break;
    }    





}

