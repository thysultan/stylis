(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisAtomic'] = factory())
}(function () {

	'use strict'

	var skip = null
	var object = null

	function atoms (compile) {
		skip = true

		var out = ''

		for (var property in object) {
			out += object[property].join(',') + compile('', property)
		}

		return (object = skip = null, out)
	}

	return function (context, content, selectors, parents, line, column, length) {
		if (skip === true) {
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
			case -2: {
				return atoms(this)
			}
		}
	}
}))
