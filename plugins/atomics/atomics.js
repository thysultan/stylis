(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['atomics'] = factory())
}(function () {

	'use strict'

	var skip = null
	var object = null
	var compiler = null

	function atoms () {
		skip = true

		var out = ''

		for (var property in object) {
			out += object[property].join(',') + compiler('', property)
		}

		return (object = skip = null, out)
	}

	function atomics (context, content, selectors, parents, line, column, length) {
		if (skip === true && context !== void 0) {
			return
		}

		switch (context) {
			case 1: {
				var index = content.indexOf(':')
				var name = content.substring(0, index)
				var value = content.substring(index+1).trim()
				var prop = name+':'+value
				
				object[prop] = (object[prop] || []).concat(selectors)

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

	function use (fn) {
		compiler = fn
	}

	atomics['use'] = use

	return atomics
}))
