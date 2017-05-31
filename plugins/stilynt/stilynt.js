(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stilynt'] = factory())
}(function () {
	var PROPERTY = 1
	var BLOCK = 2
	var ATRULE = 3

	function property (prop, line, column) {
		var colon = prop.indexOf(':')
		var name = prop.substring(0, colon).trim()
		var value = prop.substring(colon+1).trim()

		switch (name) {
			case 'color': {
				if (/^(?:[a-zA-Z]|#)/.test(value) === false) {
					report('Unexpected invalid color "'+value+'"', line, column)
				}
				break
			}
		}
	}

	function report (msg, line, column, type) {
		var message = line+':'+column+' '+ msg

		console[type || 'error'](message)
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
