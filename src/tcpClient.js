var tcp = require('../../../tcp')
const { storeData } = require('./storeData')

exports.tcpClient = function () {
	var self = this
    var host = self.config.host
    var port = self.config.tcpPort

    if (self.tcp !== undefined) {
		self.tcp.destroy()
		delete self.tcp
	}

	self.status(self.STATE_WARNING, 'Connecting')

	if (self.config.host) {
		self.tcp = new tcp(host, port)

		self.tcp.on('status_change', function (status, message) {
			self.status(status, message)
		})

		self.tcp.on('error', function (err) {
			self.debug('Network error', err)
			self.status(self.STATE_ERROR, err)
			self.log('error', 'Network error: ' + err.message)
		})

		self.tcp.on('connect', function () {
			self.status(self.STATE_OK)
            self.data.startup = false
            self.debug('Connected to panel: ' + host + ':' + port)
            if (self.config.debug == true) {
                self.log('warn', 'Connected to panel: ' + host + ':' + port)
            }

            self.sendCommand('list') // Get model and version on connection
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
                default:
                    // self.debug(str)
                    self.storeData(str)
                    break;
            }

        })
	}





    return self
}