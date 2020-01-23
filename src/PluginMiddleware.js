import {sizeof} from './Utility.js'

/**
 *
 */
function run(node, plugins, len) {
	for (var i = 0; i < len; i++)
		plugins[i](node)
}

/**
 *
 */
export function pluginMiddleware(plugins) {
	return function(ast) {
		var astlen = sizeof(ast)
		var pluginslen = sizeof(plugins)
		for (var i = 0; i < astlen; i++) {
			var node = ast[i]
			var children = node.children
			var childlen = sizeof(children)

			run(node, plugins, pluginslen)

			for (var j = 0; j < childlen; j++) {
				run(children[j], plugins, pluginslen)
			}
		}

		return ast
	}
}
