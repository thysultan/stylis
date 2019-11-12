import {RULE} from './Enum.js'
import {read} from './Utility.js'
import {ruleset} from './Ruleset.js'

/**
 * @param {string} value
 * @return {Object}
 */
export function compile (value) {
	return parse(value, [0], [])
}

/**
 * @param {string} value
 * @param {Array<number>} points
 * @param {Array<string>} styles
 * @return {Array<string>}
 */
export function parse (value, points, styles) {
	return ruleset(read(value), points, styles, styles, '', [''], [])
}
