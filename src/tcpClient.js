const { raw } = require('express')
var tcp = require('../../../tcp')
const { storeData } = require('./storeData')

exports.tcpClient = function () {
    var self = this
    var host = self.config.host
    var port = self.config.tcpPort
    var timeout = self.config.timeout || 5000 // 5 sec timeout, sends a ping to the device in order to check if it's still there
    var refresh = self.config.refresh || 30000 // 30 sec LCD refresh, sends the LCD's to the device in order to update old stuff, if it got missed

    if (self.tcp !== undefined) {
		self.tcp.destroy()

        if (self.pollAPI) {
			clearInterval(self.pollAPI)
		}

		if (self.Refresh) {
			clearInterval(self.Refresh)
		}

        delete self.tcp
	}

	if (self.config.host) {
		self.tcp = new tcp(host, port)

		self.tcp.on('status_change', function (status, message) {
            self.status(status, message)
		})

		self.tcp.on('error', function (err) {
			self.debug('Network error', err)
			self.status(self.STATE_ERROR, err)
			self.log('error', 'Network error: ' + err.message)

            if (self.pollAPI) {
				clearInterval(self.pollAPI)
				delete self.pollAPI
			}

            if (self.Refresh) {
				clearInterval(self.Refresh)
				delete self.Refresh
			}

        })

		self.tcp.on('connect', function () {
			self.status(self.STATE_OK)
            self.data.startup = false
            self.debug('Connected to panel: ' + host + ':' + port)
            if (self.config.debug == true) {
                self.log('warn', 'Connected to panel: ' + host + ':' + port)
            }

            self.pollAPI = setInterval( () => {
                    self.sendCommand('ping') // Ping the panel
                    // self.sendCommand('list') // Get model and version on connection
                },
                timeout < 100 ? 100 : timeout
            )

            self.Refresh = setInterval( () => {
                self.checkFeedbacks('tieToHwcLed')  // Send initial LED data to the panel
                self.checkFeedbacks('tieToLcd')     // Send initial LCD data to the panel
                },
                refresh < 100 ? 100 : refresh
            )

            self.sendCommand('list') // Get model and version on connection
			self.checkFeedbacks('tieToHwcLed')  // Send initial LED data to the panel
			self.checkFeedbacks('tieToLcd')     // Send initial LCD data to the panel
			self.sendCommand('encoderPressMode=1') // Enable "Press" response from encoders on the panel
        })

		self.tcp.on('data', function (data) {
			// self.debug('data: ' + String(data))

            let str_raw = String(data)
            let str = str_raw.trim() // remove new line, carage return and so on.

            // respond to status messages (not really used when panel is in server mode)
            switch (str) {
                case "list":
                    socket.send('\nActivePanel=1\n')
                    self.debug("list - send ActivePanel=1")                        
                    break;
                case "ping":
                    socket.send('ack\n')
                    self.debug("ping - send: ack")
                    break;
                case "ack":
                    self.status(self.STATE_OK)
                    break;
                default:
                    str = str.split('\n')
                    for (let index = 0; index < str.length; index++) {
                        // self.debug(str[index])
                        self.storeData(str[index])                        
                    }
                    break;
            }

        })
	}
    return self
}