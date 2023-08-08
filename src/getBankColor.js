exports.bank_invalidate = function (page, bank) {
	var self = this
	var k = `${page}_${bank}`
	var v = `b_text_${k}`
	var oldText
	var newText
	var realText = self.banks[page][bank].text

	if (!self.bank_info[k]) {
		// new key
		self.bank_info[k] = JSON.parse(JSON.stringify(self.banks[page][bank]))
	}
	if (self.bank_info[k].text) {
		oldText = self.bank_info[k].text
	}

	newText = self.check_var_recursion(v, realText)

	if (oldText !== newText) {
		self.bank_info[k].text = newText
		// self.setVariable(`b_text_${k}`, newText)
		self.checkFeedbacks('tieToLcd') // Update screens on a variable change
	} else {
		// feedback/color change
		// Fetch feedback-overrides for bank
		var o = self.bank_info[k]
		var n = JSON.parse(JSON.stringify(self.banks[page][bank]))
		var changed = false
		system.emit('feedback_get_style', page, bank, function (style) {
			// feedback override?
			if (style !== undefined) {
				n = style
			}
			for (var key of ['color', 'bgcolor']) {
				changed = changed || o[key] != n[key]
				o[key] = n[key]
			}
		})
		if (changed) {
			// Update screens and LED's on a background change
			self.checkFeedbacks('tieToLcd')
			self.checkFeedbacks('tieToHwcLed')
		}
	}
}
