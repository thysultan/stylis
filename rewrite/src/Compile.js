import {parse} from './Parse.js'

/**
 * @param {object} instance
 * @param {Array<string>} root
 * @param {string} value
 * @param {string} uuid
 * @param {string} state
 * @return {string}
 */
export function compile (instance, root, value, uuid, state) {
	return parse(instance, instance.iterator(value, uuid, state), [0], [root], 0, 0, uuid || '', state || {})
}
