(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? (module['exports'] = factory()) :
		typeof define === 'function' && define['amd'] ? define(factory()) :
			(window['stylisAst'] = factory())
}(function () {

	'use strict'

	var stack

	function Node (line, column, length, id, name, value, type, rule, parent) {
		this.line = line
		this.column = column
		this.length = length
		this.type = type
		this.name = name
		this.value = value
		this.rule = rule
		this.parent = parent
		this.id = id
		this.children = []
	}

	return function (context, content, selectors, parents, line, column, length, id) {
		var index, name, value, node, type, deli, size

		var rule = selectors.join(',')
		var parent = parents.join(',')

		switch (context) {
			case -1: 
				stack = []
				break
			case -2:
				return stack
			case 1:
				content.charCodeAt(0) !== 64 ? (deli = ':', type = 'decl') : (deli = ' ', rule = null, type = '@at-rule')

				index = content.indexOf(deli)
				name = content.substring(0, index)
				value = content.substring(index+1).trim()
				node = new Node(line, column, length, id, name, value, type, rule, parent)

				stack.push(node)
				break
			case 2:
				node = new Node(line, column, length, id, rule, selectors, 'rule', rule, parent)
				size = stack.length
				
				while (size--)
					if (stack[size].rule === rule)
						node.children.push(stack.splice(size, 1)[0])

				stack.push(node)
				break
			case 3: 
				node = new Node(line, column, length, 0, rule, selectors, '@at-rule', rule, parent)
				size = stack.length

				while (size--)
					if (stack[size].id === id)
						node.children.push(stack.splice(size, 1)[0])

				stack.push(node)
				break
		}
	}

	return ast
}))
