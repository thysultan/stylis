(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stilynt'] = factory())
}(function () {

	'use strict'

	// regex padding, margin
	var r_pm = /^(?:\d|\.\d|auto)/

	var properties = {
		"color": {
			"": {
				"type": "Invalid",
				"pattern": /^(?:[a-zA-Z]|#)/
			}
		},
		"margin": {
			"": {
				"type": "Invalid",
				"pattern": r_pm
			}
		},
		"margin-left": {
			"": {
				"type": "Invalid",
				"pattern": r_pm
			}
		},
		"margin-right": {
			"": {
				"type": "Invalid",
				"pattern": r_pm
			}
		},
		"margin-top": {
			"": {
				"type": "Invalid",
				"pattern": r_pm
			}
		},
		"margin-bottom": {
			"": {
				"type": "Invalid",
				"pattern": r_pm
			}
		},
		"font-size": {
			"": {
				"type": "Invalid",
				"pattern": /^(?:\d|\.\d|larger|smaller|xx-large|x-large|large|medium|small|x-small|xx-small)/
			}
		}
	}

	function property (content, line, column) {
		var colon = content.indexOf(':')
		var name = content.substring(0, colon).trim()
		var value = content.substring(colon+1).trim()
		var prop = properties[name]

		if (prop == void 0) {
			return
		}

		for (var key in prop) {
			var rule = prop[key]
			var pttn = rule.pattern
			var type = rule.type 

			switch (value) {
				case 'inherit':
				case 'unset':
				case 'initial': break
				default: {
					if (pttn.test(value) === false) {
						report(column, line, 'Unexpected '+name+' "'+value+'"', type)
					}
				}
			}
		}
	}

	function report (line, column, message, type) {
		console.warn(line+':'+column+' '+ message + '. ' + type + '.')
	}

	function stilynt (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case 1: {
				property(content, line, column)
				break
			}
		}
	}

	return stilynt
}))
