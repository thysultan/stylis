(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['atomics'] = factory())
}(function () {

	'use strict'

	var object = null

	function atoms () {
		var out = ''

		for (var property in object) {
			var selector = object[property].join(',')
			out += selector + '{' + property + '}'
		}

		return object = null, out;
	}

	function atomics (context, content, selectors, parents, line, column, length) {
		switch (context) {
			case 1: {
				var index = content.indexOf(':')
				var name = content.substring(0, index)
				var value = content.substring(index+1).trim()
				var prop = name+':'+value
				var block = object[prop] = (object[prop] || []).concat(selectors)

				break
			}
			case -1: {
				object = {}
				break
			}
			case void 0: {
				return atoms()
			}
		}
	}

	return atomics
}))
