import {MS, MOZ, WEBKIT} from './Enum.js'
import {hash, charat, strlen, indexof, replace, substr, match} from './Utility.js'

/**
 * @param {string} value
 * @param {number} length
 * @param {object[]} children
 * @return {string}
 */
export function prefix (value, length, children) {
	switch (hash(value, length)) {
		// color-adjust
		case 4147921980:
			return WEBKIT + 'print-' + value + value
		// animation, ançimation-(delay|direction|duration|fill-mode)
		case 831438501: case 6084974529: case 8960475411: case 9778076536: case 5329955115:
		// animation-(iteration-count|name|play-state|timing-function)
		case 13246805623: case 4609866035: case 5300880246: case 4168473101:
		// text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
		case 573572639: case -42568277: case -3131825241: case -3300488806: case -152857581: case -2974525739:
		// mask, mask-image, mask-(mode|clip|size)
		case 2090500273: case -803200447: case -1585999677: case -1586362138: case -1585789863:
		// mask-(repeat|origin), mask-position, mask-composite, background-clip
		case -392542945: case -494781274: case -1462442573: case 457275345: case -1500969926:
		// columns, column-(count|fill|gap|rule|rule-color)
		case -749332762: case 655069929: case 670704199: case 671077816: case 671148504: case 1285898820:
		// columns-(rule-style|rule-width|span|width)
		case 1305067286: case 1309393061: case 671178642: case 678554400:
			return WEBKIT + value + value
		// tab-size
		case -1671331900:
			return MOZ + value + value
		// appearance, user-select, transform, hyphens, text-size-adjust
		case 5808179221: case -2322612495: case 596893057: case 1808661508: case -992853366:
			return WEBKIT + value + MOZ + value + MS + value + value
		// writing-mode
		case -604349445:
			switch (charat(value, length + 11)) {
				// vertical-l(r)
				case 114:
					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb') + value
				// vertical-r(l)
				case 108:
					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value
				// horizontal(-)tb
				case 45:
					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'lr') + value
				// default: fallthrough to below
			}
		// flex, flex-direction, scroll-snap-type, writing-mode
		case 2090260244: case 1330556994: case -4992262046:
			return WEBKIT + value + MS + value + value
		// order
		case 269998625:
			return WEBKIT + value + MS + 'flex-' + value + value
		// align-items
		case 2175947679:
			return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + 'box-$1$2' + MS + 'flex-$1$2') + value
		// align-self
		case 3320044167:
			return WEBKIT + value + MS + 'flex-item-' + replace(value, /flex-|-self/g, '') + (!match(value, /flex-|baseline/) ? MS + 'grid-row-' + replace(value, /flex-|-self/g, '') : '') + value
		// align-content
		case 3736405496:
			return WEBKIT + value + MS + 'flex-line-pack' + replace(value, /align-content|flex-|-self/g, '') + value
		// flex-shrink
		case 4607167408:
			return WEBKIT + value + MS + replace(value, 'shrink', 'negative') + value
		// flex-basis
		case 2982511539:
			return WEBKIT + value + MS + replace(value, 'basis', 'preferred-size') + value
		// flex-grow
		case 2172985600:
			return WEBKIT + 'box-' + replace(value, '-grow', '') + WEBKIT + value + MS + replace(value, 'grow', 'positive') + value
		// transition
		case 2521329520:
			return WEBKIT + replace(value, /([^-])(transform)/g, '$1' + WEBKIT + '$2') + value
		// cursor
		case -145528541:
			return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + '$1'), /(image-set)/, WEBKIT + '$1'), value, '') + value
		// background, background-image
		case -2558650491: case -2280224747:
			return replace(value, /(image-set\([^]*)/, WEBKIT + '$1' + '$`$1')
		// justify-content
		case 3563359163:
			return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + 'box-pack:$3' + MS + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + WEBKIT + value + value
		// justify-self
		case -632520918:
			if (!match(value, /flex-|baseline/)) return MS + 'grid-column-align' + substr(value, length) + value
			break
		// grid-template-(columns|rows)
		case -6598323198: case -8311231156:
			return MS + replace(value, 'template-', '') + value
		// grid-(row|column)-start
		case -1491776085: case -9173721407:
			if (children && children.some(function (element, index) { return length = index, match(element.props, /grid-\w+-end/) })) {
				return ~indexof(value + (children = children[length].value), 'span') ? value : (MS + replace(value, '-start', '') + value + MS + 'grid-row-span:' + (~indexof(children, 'span') ? match(children, /\d+/) : +match(children, /\d+/) - +match(value, /\d+/)) + ';')
			} else {
				return MS + replace(value, '-start', '') + value
			}
		// grid-(row|column)-end
		case -2395366156: case -9694793590:
			return (children && children.some(function (element) { return match(element.props, /grid-\w+-start/) })) ? value : MS + replace(replace(value, '-end', '-span'), 'span ', '') + value
		// (margin|padding)-inline-(start|end)
		case -6031848726: case -3511730573: case 2114080355: case 1090457516:
			return replace(value, /(.+)-inline(.+)/, WEBKIT + '$1$2') + value
		// (min|max)?(width|height|inline-size|block-size)
		case 279163045: case 30836958: case 1762183148: case -3882807592:
		case -147068906: case -1149915537: case -1625092067: case -3464850199:
		case -1762418536: case -2916845775: case -4851260897: case -5905322325:
			// stretch, max-content, min-content, fill-available
			if (strlen(value) - 1 - length > 6)
				switch (charat(value, length + 1)) {
					// (m)ax-content, (m)in-content
					case 109:
						// -
						if (charat(value, length + 4) !== 45)
							break
					// (f)ill-available, (f)it-content
					case 102:
						return replace(value, /(.+:)(.+)-([^]+)/, '$1' + WEBKIT + '$2-$3' + '$1' + MOZ + (charat(value, length + 3) == 108 ? '$3' : '$2-$3')) + value
					// (s)tretch
					case 115:
						return ~indexof(value, 'stretch') ? prefix(replace(value, 'stretch', 'fill-available'), length, children) + value : value
				}
			break
		// grid-(column|row)
		case -4694600634: case -843523152:
			return replace(value, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function (_, a, b, c, d, e, f) { return (MS + a + ':' + b + f) + (c ? (MS + a + '-span:' + (d ? e : +e - +b)) + f : '') + value })
		// position: sticky
		case -3004204358:
			// stick(y)?
			if (charat(value, length + 6) === 121)
				return replace(value, ':', ':' + WEBKIT) + value
			break
		// display: (flex|inline-flex|grid|inline-grid)
		case 315443099:
			switch (charat(value, charat(value, 14) === 45 ? 18 : 11)) {
				// (inline-)?fle(x)
				case 120:
					return replace(value, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, '$1' + WEBKIT + (charat(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + WEBKIT + '$2$3' + '$1' + MS + '$2box$3') + value
				// (inline-)?gri(d)
				case 100:
					return replace(value, ':', ':' + MS) + value
			}
			break
		// scroll-margin, scroll-margin-(top|right|bottom|left)
		case -6370664225: case -7904861793: case -5577592406: case -4290493535: case -7457667305:
			return replace(value, 'scroll-', 'scroll-snap-') + value
	}

	return value
}
