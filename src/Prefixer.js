import {MS, MOZ, WEBKIT} from './Enum.js'
import {hash, test, substr, charat, strlen, indexof, replace} from './Utility.js'

/**
 * @param {string} value
 * @param {number} length
 * @return {string}
 */
export function prefix (value, length) {
	switch (hash(value, length)) {
		// @keyframes // TODO
		case 9999999:
			return value
		// animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
		case 5737: case 4201: case 3177: case 3433: case 1641: case 4457: case 2921:
		// text-decoration, filter, mask, clip-path, backface-visibility, column, text-size-adjust
		case 5572: case 6356: case 6391: case 5844: case 3191: case 6645: case 2756:
			return WEBKIT + value + ';' + value
		// box-decoration-break, appearance, user-select, flex, transform, hyphens
		case 3005: case 5349: case 4246: case 6828: case 4810: case 6968:
			return WEBKIT + value + ';' + MOZ + value + ';' + MS + value + ';' + value
		// order
		case 6165:
			return WEBKIT + value + ';' + MS + 'flex-' + value + ';' + value
		// align-items
		case 5187:
			return WEBKIT + value + ';' + replace(value, /(\w+).+(:[^]+)/, WEBKIT + 'box-$1$2;' + MS + 'flex-$1$2') + ';' + value
		// align-self
		case 5443:
			return WEBKIT + value + ';' + MS + 'flex-item-' + replace(value, /flex-|-self/, '') + ';' + value
		// align-content
		case 4675:
			return WEBKIT + value + ';' + MS + 'flex-line-pack' + replace(value, /align-content|flex-|-self/, '') + ';' + value
		// flex-shrink
		case 5548:
			return WEBKIT + value + ';' + MS + replace(value, 'shrink', 'negative') + ';' + value
		// flex-basis
		case 5292:
			return WEBKIT + value + ';' + MS + replace(value, 'basis', 'preferred-size') + ';' + value
		// flex-grow
		case 6060:
			return WEBKIT + 'box-' + replace(value, '-grow', '') + ';' + WEBKIT + value + ';' + MS + replace(value, 'grow', 'positive') + ';' + value
		// transition
		case 4554:
			return replace(value, /([^-])(transform)/g, '$1' + WEBKIT + '$2') + ';' + value
		// background
		case 5495:
			return replace(value, /([^-])(image-set\()/, '$1' + WEBKIT + '$2') + ';' + value
		// cursor
		case 6187:
			return replace(value, /(.*)(zoom-\w+|grab\w*)(.*)/, '$1' + WEBKIT + '$2$3;$1' + MOZ + '$2$3') + ';' + value
		// writing-mode
		case 5936:
			// vertical-lr, vertical-rl, horizontal-tb
			if (strlen(value) > 10)
				switch (charat(value, length + 10)) {
					// vertical-l(r)
					case 114:
						return WEBKIT + value + ';' + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb') + ';' + value
					// vertical-r(l)
					case 108:
						return WEBKIT + value + ';' + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + ';' + value
					// horizontal(-)tb
					case 45:
						return WEBKIT + value + ';' + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'lr') + ';' + value
				}
			break
		// (min|max)?(width|height|inline-size|block-size)
		case 8116: case 7059: case 5753: case 5535:
		case 5445: case 5701: case 4933: case 4677:
		case 5533: case 5789: case 5021: case 4765:
			// stretch, max-content, min-content, fill-available
			if (strlen(value) - length > 6)
				switch (charat(value, length + 1)) {
					// (m)ax-content, (m)in-content
					case 109:
						return replace(value, /(.+:)(.+)-([^]+)/, '$1' + WEBKIT + '$2-$3;' + '$1' + MOZ + '$2-$3;' + '$1$2-$3')
					// (f)ill-available
					case 102:
						return replace(value, /(.+:)(.+)-([^]+)/, '$1' + WEBKIT + '$2-$3;' + '$1' + MOZ + '$3;' + '$1$2-$3')
					// (s)tretch
					case 115:
						return prefix(replace(replace(value, 'stretch', 'fill-available'), length), ':fill-available', ':stretch')
				}
			break
		// position: sticky
		case 4949:
			// (s)ticky?
			if (charat(value, length + 1) !== 115)
				break
		// display: (flex|inline-flex|inline-box)
		case 6444:
			switch (charat(value, strlen(value) - 2 - (indexof(value, '!important') && 10))) {
				// stic(k)y, inline-b(o)x
				case 107: case 111:
					return replace(value, value, WEBKIT + value) + ';' + value
				// (inline-)?fl(e)x
				case 101:
					return replace(value, /(.+:)([^!]+)(!.+)?/, ('$1' + WEBKIT + (charat(value, 14) === 45 ? 'inline-' : '') + 'box$3;') + ('$1' + WEBKIT + '$2$3;') + ('$1' + MS + '$2box$3;') + ('$1$2$3'))
			}
			break
		// justify-content
		case 4968:
			return ((replace(replace(value, /(.+:)(flex-)?(.*)/, (WEBKIT+'box-pack:$3;') + (MS + 'flex-pack:$3')), /s.+-b.+/, 'justify') + ';') + (WEBKIT+value+';') + (value))
		// (margin|padding)-inline-(start|end)
		case 4095: case 3583: case 4068: case 2532:
			return replace(value, /(.+)-inline(.+)/, WEBKIT + '$1$2') + ';' + value
	}

	return value
}

/**
 * @param {string} value
 * @param {number} length
 * @param {string} uuid
 * @return {string}
 */
export function animation (value, length, uuid) {
	if (uuid)
		switch (length) {
			// animation, animation-name
			case 9: case 14:
				// split on comma seperated boundaries outside of function boundaries
				value = substr(value, 0, length + 1) + substr(value, length + 1, strlen(value)).split(/,+\s*(?![^(]+\))/g).map(function (value) {
					// split on space seperated boundaries outside of function boundaries
					return value.split(/\s+(?![^(]+\))/g).map(function (value) {
						// match valid animation identifiers: https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
						if (test(value, /(?:[^\d\s]\w+|-[^-]+)/))
							// exclude known tokens
							if (!test(value, /(back|for)wards|step-|in(herit|itial)|none|unset|all|normal|ease|alternate|reverse|\(/))
								switch (value) {
									case 'linear': case 'infinite': case 'running': case 'both': case 'paused':
										break
									default:
										return value + uuid
								}
						return value
					}).join(' ')
				}).join(',')
		}

	return WEBKIT + value + ';' + value
}
