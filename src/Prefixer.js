import {MS, MOZ, WEBKIT} from './Enum.js'
import {hash, match, charat, strlen, indexof, replace} from './Utility.js'

/**
 * @param {string} value
 * @param {number} length
 * @return {string}
 */
export function prefix (value, length) {
	if (length > 0)
		switch (hash(value, length)) {
			// @keyframes
			case 7517:
				return replace(value, '@', '@' + WEBKIT)
			// animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
			case 5737: case 4201: case 3177: case 3433: case 1641: case 4457: case 2921:
			// text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
			case 5572: case 6356: case 5844: case 3191: case 6645: case 3005:
			// mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
			case 6391: case 5879: case 5623: case 6135: case 4599: case 4855:
			// background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
			case 4215: case 6389: case 5109: case 5365: case 5621: case 3829:
				return WEBKIT + value
			// appearance, user-select, flex, transform, hyphens, text-size-adjust
			case 5349: case 4246: case 6828: case 4810: case 6968: case 2756:
				return WEBKIT + value + MOZ + value + MS + value
			// order
			case 6165:
				return WEBKIT + value + MS + 'flex-' + value
			// align-items
			case 5187:
				return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + 'box-$1$2' + MS + 'flex-$1$2')
			// align-self
			case 5443:
				return WEBKIT + value + MS + 'flex-item-' + replace(value, /flex-|-self/, '')
			// align-content
			case 4675:
				return WEBKIT + value + MS + 'flex-line-pack' + replace(value, /align-content|flex-|-self/, '')
			// flex-shrink
			case 5548:
				return WEBKIT + value + MS + replace(value, 'shrink', 'negative')
			// flex-basis
			case 5292:
				return WEBKIT + value + MS + replace(value, 'basis', 'preferred-size')
			// flex-grow
			case 6060:
				return WEBKIT + 'box-' + replace(value, '-grow', '') + WEBKIT + value + MS + replace(value, 'grow', 'positive')
			// transition
			case 4554:
				return WEBKIT + replace(value, /([^-])(transform)/g, '$1' + WEBKIT + '$2')
			// cursor
			case 6187:
				value = replace(value, /(.*)(zoom-\w+|grab\w*)(.*)/, '$1' + WEBKIT + '$2$3$1' + MOZ + '$2$3')
			// background, background-image
			case 5495: case 3959:
				return replace(value, /([^-])(image-set\()/, '$1' + WEBKIT + '$2')
			// justify-content
			case 4968:
				return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + 'box-pack:$3' + MS + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + WEBKIT + value
			// (margin|padding)-inline-(start|end)
			case 4095: case 3583: case 4068: case 2532:
				return replace(value, /(.+)-inline(.+)/, WEBKIT + '$1$2')
			// (min|max)?(width|height|inline-size|block-size)
			case 8116: case 7059: case 5753: case 5535:
			case 5445: case 5701: case 4933: case 4677:
			case 5533: case 5789: case 5021: case 4765:
				// stretch, max-content, min-content, fill-available
				if (strlen(value) - 1 - length > 6)
					switch (charat(value, length + 1)) {
						// (m)ax-content, (m)in-content
						case 109:
							return replace(value, /(.+:)(.+)-([^]+)/, '$1' + WEBKIT + '$2-$3' + '$1' + MOZ + '$2-$3')
						// (f)ill-available
						case 102:
							return replace(value, /(.+:)(.+)-([^]+)/, '$1' + WEBKIT + '$2-$3' + '$1' + MOZ + '$3')
						// (s)tretch
						case 115:
							return prefix(replace(value, 'stretch', 'fill-available'), length)
					}
				break
			// position: sticky
			case 4949:
				// (s)ticky?
				if (charat(value, length + 1) !== 115)
					break
			// display: (flex|inline-flex|inline-box)
			case 6444:
				switch (charat(value, strlen(value) - 3 - (~indexof(value, '!important') && 10))) {
					// stic(k)y, inline-b(o)x
					case 107: case 111:
						return replace(value, value, WEBKIT + value)
					// (inline-)?fl(e)x
					case 101:
						return replace(value, /(.+:)([^;!]+)(;|!.+)?/, '$1' + WEBKIT + (charat(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + WEBKIT + '$2$3' + '$1' + MS + '$2box$3')
				}
				break
			// writing-mode
			case 5936:
				switch (charat(value, length + 11)) {
					// vertical-l(r)
					case 114:
						return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb')
					// vertical-r(l)
					case 108:
						return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb-rl')
					// horizontal(-)tb
					case 45:
						return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'lr')
				}

				return WEBKIT + value + MS + value
		}
	else
		switch (match(value, /(:place|:read)/)) {
			// :read-(only|write)
			case ':read':
				return replace(value, /:(read.+)/, ':' + MOZ + '$1')
			// :placeholder
			case ':place':
				return replace(value, /:+(place.+)/, '::' + WEBKIT + 'input-$1') + replace(value, /:+(place.+)/, '::' + MOZ + '$1') + replace(value, /:+(place.+)/, ':' + MS + 'input-$1')
		}

	return ''
}
