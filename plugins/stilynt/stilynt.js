(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stilynt'] = factory())
}(function () {
	var PROPERTY = 1
	var BLOCK = 2
	var ATRULE = 3

	var properties = {
		color: {
			'': {
				type: 'Invalid',
				pattern: /^(?:[a-zA-Z]|#)/
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

			if (pttn.test(value) === false) {
				report(column, line, 'Unexpected '+name+' `'+value+'`', type)
			}
		}
	}

	function report (line, column, message, type) {
		console.warn(line+':'+column+' '+ message + '. ' + type + '.')
	}

	function stilynt (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case PROPERTY: {
				property(content, line, column)
				break
			}
		}
	}

	return stilynt
}))
