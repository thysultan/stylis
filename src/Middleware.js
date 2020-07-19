import {MS, MOZ, WEBKIT, RULESET, KEYFRAMES, DECLARATION} from './Enum.js'
import {match, charat, substr, strlen, sizeof, replace, combine} from './Utility.js'
import {copy, tokenize} from './Tokenizer.js'
import {serialize} from './Serializer.js'
import {prefix} from './Prefixer.js'

/**
 * @typedef {Object} NodeBase
 * @property {Node?} parent
 * @property {Node?} root
 * @property {string} value
 * @property {number} length
 * @property {string} return
 * @property {number} line
 * @property {number} column

 * @typedef {NodeBase & {
	type: 'comm'
	props: string
	children: string
 }} CommentNode

 * @typedef {NodeBase & {
	type: 'decl'
	props: string
	children: string
 }} DeclarationNode

 * @typedef {NodeBase & {
	type: 'rule'
	props: string[]
	children: Node[]
 }} RulesetNode

 * @typedef {NodeBase & {
	type: '@keyframes'
	props: string[]
	children: Node[]
 }} KeyframesNode

* @typedef {NodeBase & {
	type: '@media'
	props: string[]
	children: Node[]
 }} MediaNode

* @typedef {NodeBase & {
	type: '@supports'
	props: string[]
	children: Node[]
 }} SupportsNode

 * @typedef {NodeBase & {
	type: '@import'
	props: []
	children: []
 }} ImportNode

 * @typedef {NodeBase & {
	type: '@charset'
	props: []
	children: []
 }} CharsetNode

* @typedef {NodeBase & {
	type: '@counter-style'
	props: string[]
	children: DeclarationNode[]
 }} CounterStyleNode

 * @typedef {NodeBase & {
	type: '@font-face'
	props: []
	children: DeclarationNode[]
 }} FontFaceNode

 * @typedef {NodeBase & {
	type: '@page'
	props: []
	children: DeclarationNode[]
 }} PageNode

 * @typedef {NodeBase & {
	type: '@document'
	props: string[]
	children: Node[]
 }} DocumentNode

 * @typedef {NodeBase & {
	type: '@viewport'
	props: []
	children: DeclarationNode[]
 }} ViewportNode

 * @typedef {NodeBase & {
	type: '@-webkit-keyframes'
	props: string[]
	children: Node[]
 }} WebkitKeyframesNode

 * @typedef {NodeBase & {
	type: '@-moz-document'
	props: string[]
	children: Node[]
 }} MozDocumentNode

 * @typedef {NodeBase & {
	type: '@-ms-viewport'
	props: []
	children: DeclarationNode[]
 }} MsViewportNode

 * @typedef {CommentNode | DeclarationNode | RulesetNode | KeyframesNode | MediaNode | SupportsNode | ImportNode | CharsetNode | CounterStyleNode | FontFaceNode | ViewportNode | PageNode | DocumentNode | WebkitKeyframesNode | MozDocumentNode | MsViewportNode} Node

 * @typedef {(
 * 	 element: Node,
 * 	 index: number,
 * 	 children: Node[],
 * 	 callback: Middleware,
 * 	) => string | void
 * } Middleware
 */

/**
 * @param {Middleware[]} collection
 * @return {Middleware}
 */
export function middleware (collection) {
	var length = sizeof(collection)

	return function (element, index, children, callback) {
		var output = ''

		for (var i = 0; i < length; i++)
			output += collection[i](element, index, children, callback) || ''

		return output
	}
}

/**
 * @param {(rule: string) => void} callback
 * @return {Middleware}
 */
export function rulesheet (callback) {
	return function (element) {
		if (!element.root)
			// @ts-ignore
			if (element = element.return)
				// @ts-ignore
				callback(element)
	}
}

/**
 * @type {Middleware}
 */
export function prefixer (element, index, children, callback) {
	if (!element.return)
		switch (element.type) {
			case DECLARATION: element.return = prefix(element.value, element.length)
				break
			case KEYFRAMES:
				return serialize([copy(replace(element.value, '@', '@' + WEBKIT), element, '')], callback)
			case RULESET:
				if (element.length)
					return combine(element.props, function (value) {
						switch (match(value, /(::plac\w+|:read-\w+)/)) {
							// :read-(only|write)
							case ':read-only': case ':read-write':
								return serialize([copy(replace(value, /:(read-\w+)/, ':' + MOZ + '$1'), element, '')], callback)
							// :placeholder
							case '::placeholder':
								return serialize([
									copy(replace(value, /:(plac\w+)/, ':' + WEBKIT + 'input-$1'), element, ''),
									copy(replace(value, /:(plac\w+)/, ':' + MOZ + '$1'), element, ''),
									copy(replace(value, /:(plac\w+)/, MS + 'input-$1'), element, '')
								], callback)
						}

						return ''
					})
		}
}

/**
 * @type {Middleware}
 */
export function namespace (element) {
	switch (element.type) {
		case RULESET:
			element.props = element.props.map(function (value) {
				return combine(tokenize(value), function (value, index, children) {
					switch (charat(value, 0)) {
						// \f
						case 12:
							return substr(value, 1, strlen(value))
						// \0 ( + > ~
						case 0: case 40: case 43: case 62: case 126:
							return value
						// :
						case 58:
							if (children[index + 1] === 'global')
								children[index + 1] = '', children[index + 2] = '\f' + substr(children[index + 2], index = 1, -1)
						// \s
						case 32:
							return index === 1 ? '' : value
						default:
							switch (index) {
								// @ts-ignore
								case 0: element = value
									return sizeof(children) > 1 ? '' : value
								case index = sizeof(children) - 1: case 2:
									return index === 2 ? value + element + element : value + element
								default:
									return value
							}
					}
				})
			})
	}
}
