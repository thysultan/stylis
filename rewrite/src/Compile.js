import {RULE} from './Constant.js'
import {iterator} from './Iterator.js'
import {ruleset} from './Parser/Ruleset.js'

/**
 * @param {string} value
 * @return {Object}
 */
export function compile (value) {
	return parse(iterator(value), [0], [], [''])
}

/**
 * @param {Object} read
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @param {Array<string>} parents
 * @return {Array<string>}
 */
export function parse (read, points, styles, parents) {
	return ruleset(read, points, styles, parents, RULE, [], styles)
}
