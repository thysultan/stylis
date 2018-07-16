import {WEBKIT} from './Constant.js'

/**
 * @param {string} value
 * @param {number} length
 * @param {string} uuid
 * @return {string}
 */
export function animation (value, length, uuid) {
	switch (length) {
		// animation, animation-name
		case 9: case 14:
			// splits on comma seperated boundaries
			value = value.split(/,+\s*(?![^(]*[)])/g).map(function (value) {
				// splits on space seperated boundaries
				return value.split(/ +\s*(?![^(]*[)])/g).map(function (value) {
					// regex to match valid animation identifiers
					// https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
					if (/^(?:[^\d\s]\w+|-[^-]+)/.test(value))
						// exclude known tokens
						if (!/(back|for)wards|ease|alternate|reverse|step-|none|unset|all|in(herit|itial)|normal|linear/.test(value))
							switch (value) {
								case 'infinite': case 'running': case 'both': case 'paused':
									break
								default:
									return value + uuid
							}
					return value
				}).join(' ')
			}).join(',')
	}

	return (WEBKIT+value+';') + (value)
}
