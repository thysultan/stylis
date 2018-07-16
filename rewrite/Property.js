import {WEBKIT, MOZ, MS} from './Constant.js'

/**
 * @param {string} value
 * @param {number} length
 * @param {number} priority
 * @return {string}
 */
export function property (value, length, priority) {
	// NOTE: simple fast inlined non-crpyto hashing function, tested on all css properties with no collisions.
	// Uses the first 4 characters as the shortest css property is 3 characters long + a colon ":"
	// TODO: remove note.
	switch ((((((((length << 2)^value.charCodeAt(0)) << 2)^value.charCodeAt(1)) << 2)^value.charCodeAt(2)) << 2)^value.charCodeAt(3)) {
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
			return (WEBKIT+value+';') + (WEBKIT+'box-'+(temp = value.replace('-items', '')+';')) + (MS+'flex-'+temp) + (value)
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
			return (value.replace(/([^-])(image-set\()/g, '$1'+WEBKIT+'$2')+';') + (value)
		// cursor
		case 7211:
			return (value.replace(/(.*)(zoom-\w+|grab\w*)(.*)/, '$1'+WEBKIT+'$2$3;$1'+MOZ+'$2$3')+';') + (value)
		// writing-mode
		case 4912:
			// vertical-lr, vertical-rl, horizontal-tb
			if (value.length > 10)
				switch (value.charCodeAt(length+10)) {
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
			if (value.length-length > 6)
				switch (value.charCodeAt(length+1)) {
					// (m)ax-content, (m)in-content
					case 109:
						return value.replace(/(.+:)(\w+)-([^]+)/, ('$1'+WEBKIT+'$2-$3;')+('$1'+MOZ+'$2-$3;')+'$1$2-$3')
					// (f)ill-available
					case 102:
						return value.replace(/(.+:)(\w+)-([^]+)/, ('$1'+WEBKIT+'$2-$3;')+('$1'+MOZ+'$3;')+'$1$2-$3')
					// (s)tretch
					case 115:
						return property(value.replace('stretch', 'fill-available'), length, priority).replace(':fill-available', ':stretch')
				}
			break
		// position: sticky
		case 8021:
			// (s)ticky?
			if (value.charCodeAt(length+1) !== 115)
				break
		// display: (flex|inline-flex|inline-box)
		case 7468:
			switch (value.charCodeAt(value.length-2-(property && 10))) {
				// stic(k)y, inline-b(o)x
				case 107: case 111:
					return (value.replace(value, WEBKIT+value)+';') + (value)
				// (inline-)?fl(e)x
				case 101:
					return value.replace(/(\w+:)([^!]+)(!\w+)?/,
						('$1'+WEBKIT+(value.charCodeAt(size+7) === 45 ? 'inline-' : '')+'box$3;') +
						('$1'+WEBKIT+'$2$3;') +
						('$1'+MS+'$2box$3;') +
						('$1$2$3')
					)
			}
			break
		// justify-content
		case 5992: // TODO
			return (
				(WEBKIT+'box-pack'+(string = value.slice(length).replace('flex-', '').replace('space-between', 'justify'))+';')+
				(WEBKIT+value+';') +
				(MS+'flex-pack'+string+';') +
				(value) +
				(string = '')
			)
	}

	return value
}
