(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['customProperties'] = factory())
}(function () {
	var PROPERTY = 1
	var properties = null

	function replace (match, group) {
		return properties[group] || value
	}

	function customProperties (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case 1: {
				if (content.charCodeAt(0) + content.charCodeAt(1) === 90) {
					// collect custom properties
					var index = content.indexOf(':')
					var name = content.substring(0, index)
					var value = content.substring(index+1).trim()

					return (properties[name] = value, '')
				} else if (content.indexOf('var(')) {
					// replace custom properties
					return content.replace(/var\((.*)\)/g, replace)
				}

				break
			}
			case -1: {
				// create store
				properties = {}
				break
			}
			case -2: {
				// destroy store
				properties = null
				break
			}
		}
	}

	return customProperties
}))
