const WEBKIT = '-webkit-'
const MOZ = '-moz-'
const MS = '-ms-'

/**
 * @param {string} value
 * @param {number} length
 * @return {number}
 */
export function hash (value, length) {
	return (((((((length << 2) ^ value.charCodeAt(0)) << 2) ^ value.charCodeAt(1)) << 2) ^ value.charCodeAt(2)) << 2) ^ value.charCodeAt(3)
}

/**
 * @param {string} value
 * @param {number} length
 * @param {number} priority
 * @return {string}
 */
export function declaration (value, length, priority) {
	switch (hash(value, length)) {
		// animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
		case 5737: case 4201: case 3177: case 3433: case 3177: case 1641: case 4457: case 2921: case 1641:
			return animation(value, length, '')
		// text-decoration, filter, mask, clip-path, backface-visibility, column
		case 4548: case 7380: case 7415: case 6868: case 4215: case 7669:
			return (WEBKIT+value+';') + (value)
		// box-decoration-break, appearance, user-select, flex, transform, hyphens
		case 4029: case 6373: case 7318: case 7852: case 7882: case 7992:
			return (WEBKIT+value+';') + (MOZ+value+';') + (MS+value+';') + (value)
		// order
		case 7189:
			return (WEBKIT+value+';') + (MS+'flex-'+value+';') + (value)
		// align-items
		case 6211:
			return (WEBKIT+value+';') + (value.replace(/(\w+).+(:[^]+)/, (WEBKIT+'box-$1$2;')+(MS+'flex-$1$2'))+';') + (value)
		// align-self
		case 6467:
			return (WEBKIT+value+';') + (MS+'flex-item-'+value.replace(/flex-|-self/, '')+';') + (value)
		// align-content
		case 5699:
			return (WEBKIT+value+';') + (MS+'flex-line-pack' + value.replace(/align-content|flex-|-self/, '') + ';') + (value)
		// flex-shrink
		case 6572:
			return (WEBKIT+value+';') + (MS+value.replace('shrink', 'negative')+';') + (value)
		// flex-basis
		case 6316:
			return (WEBKIT+value+';') + (MS+value.replace('basis', 'preferred-size')+';') + (value)
		// flex-grow
		case 7084:
			return (WEBKIT+'box-'+value.replace('-grow', '')+';') + (WEBKIT+value+';') + (MS+value.replace('grow', 'positive')+';') + (value)
		// transition
		case 7626:
			return (value.replace(/([^-])(transform)/g, '$1'+WEBKIT+'$2')+';') + (value)
		// background
		case 6519:
			return (value.replace(/([^-])(image-set\()/, '$1'+WEBKIT+'$2')+';') + (value)
		// cursor
		case 7211:
			return (value.replace(/(.*)(zoom-\w+|grab\w*)(.*)/, '$1'+WEBKIT+'$2$3;$1'+MOZ+'$2$3')+';') + (value)
		// writing-mode
		case 4912:
			// vertical-lr, vertical-rl, horizontal-tb
			if (value.length > 10)
				switch (value.charCodeAt(length + 10)) {
					// vertical-l(r)
					case 114:
						return (WEBKIT+value+';') + (MS+value.replace(/[svh]\w+-[tblr]{2}/, 'tb')+';') + value
					// vertical-r(l)
					case 108:
						return (WEBKIT+value+';') + (MS+value.replace(/[svh]\w+-[tblr]{2}/, 'tb-rl')+';') + value
					// horizontal(-)tb
					case 45:
						return (WEBKIT+value+';') + (MS+value.replace(/[svh]\w+-[tblr]{2}/, 'lr')+';') + value
				}
			break
		// (min|min)?(width|height|inline-size|block-size)
		case 8116: case 7059: case 5753: case 5535:
		case 5445: case 5701: case 4933: case 4677:
		case 5533: case 5789: case 5021: case 4765:
			// stretch, max-content, min-content, fill-available
			if (value.length - length > 6)
				switch (value.charCodeAt(length + 1)) {
					// (m)ax-content, (m)in-content
					case 109:
						return value.replace(/(.+:)(.+)-([^]+)/, ('$1'+WEBKIT+'$2-$3;')+('$1'+MOZ+'$2-$3;')+'$1$2-$3')
					// (f)ill-available
					case 102:
						return value.replace(/(.+:)(.+)-([^]+)/, ('$1'+WEBKIT+'$2-$3;')+('$1'+MOZ+'$3;')+'$1$2-$3')
					// (s)tretch
					case 115:
						return declaration(value.replace('stretch', 'fill-available'), length, priority).replace(':fill-available', ':stretch')
				}
			break
		// position: sticky
		case 8021:
			// (s)ticky?
			if (value.charCodeAt(length + 1) !== 115)
				break
		// display: (flex|inline-flex|inline-box)
		case 7468:
			switch (value.charCodeAt(value.length - 2 - (property && 10))) {
				// stic(k)y, inline-b(o)x
				case 107: case 111:
					return (value.replace(value, WEBKIT+value)+';') + (value)
				// (inline-)?fl(e)x
				case 101:
					return value.replace(/(.+:)([^!]+)(!.+)?/,
						('$1'+WEBKIT+(value.charCodeAt(size + 7) === 45 ? 'inline-' : '')+'box$3;') +
						('$1'+WEBKIT+'$2$3;') +
						('$1'+MS+'$2box$3;') +
						('$1$2$3')
					)
			}
			break
		// justify-content
		case 5992:
			return (
				(value.replace(/(.+:)(flex-)?(.*)/, (WEBKIT+'box-pack:$3;')+(MS+'flex-pack:$3')).replace(/s.+-b.+/, 'justify')+';')+
			 	(WEBKIT+value+';') +
			 	(value)
			)
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
				value = value.slice(0, length + 1) + value.slice(length + 1).split(/,+\s*(?![^(]+\))/g).map(function (value) {
					// split on space seperated boundaries outside of function boundaries
					return value.split(/\s+(?![^(]+\))/g).map(function (value) {
						// match valid animation identifiers: https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
						if (/(?:[^\d\s]\w+|-[^-]+)/.test(value))
							// exclude known tokens
							if (!/(back|for)wards|step-|in(herit|itial)|none|unset|all|normal|ease|alternate|reverse|\(/.test(value))
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

	return (WEBKIT+value+';') + (value)
}
