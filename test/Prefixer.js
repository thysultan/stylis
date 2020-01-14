import {prefix, compile, serialize} from "../index.js"

describe('Prefixer', () => {
	// TODO:
	// - test vendor prefixing:
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L553 [ – ]
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L700 [ – ]
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L728 [ – ]
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L778 [ – ]
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L810 [ – ]
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L835 [ – ]
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L876 [ – ]
	//    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L953 [ – ]
	// - add prefixer API and accompanying tests [ - ]

	test('text-size-adjust', () => {
		expect(prefix(`text-size-adjust:none`)).to.equal([``].join(''))
		expect(prefix(`text-size-adjust: none`)).to.equal([``].join(''))
		expect(prefix(`text-size-adjust :none`)).to.equal([``].join(''))
	})

	test('flex-box', () => {
		expect(prefix(`display:flex!important`)).to.equal([``].join(''))
		expect(prefix(`display :flex!important`)).to.equal([``].join(''))
		expect(prefix(`display:inline-flex`)).to.equal([``].join(''))
		expect(prefix(`display:inline-box`)).to.equal([``].join(''))

		expect(prefix(`flex-grow: none`)).to.equal([``].join(''))
		expect(prefix(`flex-shrink: none`)).to.equal([``].join(''))
		expect(prefix(`flex-basis: none`)).to.equal([``].join(''))

		expect(prefix(`align-self:value`)).to.equal([``].join(''))
		expect(prefix(`align-self: flex-start`)).to.equal([``].join(''))
		expect(prefix(`align-self: flex-end`)).to.equal([``].join(''))

		expect(prefix(`align-content:value`)).to.equal([``].join(''))
		expect(prefix(`align-content:flex-start`)).to.equal([``].join(''))
		expect(prefix(`align-content:flex-end`)).to.equal([``].join(''))

		expect(prefix(`align-items:value`)).to.equal([``].join(''))

		expect(prefix(`justify-content:flex-end`)).to.equal([``].join(''))
		expect(prefix(`justify-content:flex-start`)).to.equal([``].join(''))
		expect(prefix(`justify-content:justify`)).to.equal([``].join(''))
		expect(prefix(`justify-content: space-between`)).to.equal([``].join(''))

		expect(prefix(`justify-items: center`)).to.equal([``].join(''))

		expect(prefix(`order:flex`)).to.equal([``].join(''))
	})

	test('transform', () => {
		expect(prefix(`transform:rotate(30deg)`)).to.equal([``].join(''))
		expect(prefix(`transform: rotate(30deg)`)).to.equal([``].join(''))
		expect(prefix(`transform :rotate(30deg)`)).to.equal([``].join(''))
	})

	test('cursor', () => {
		expect(prefix(`cursor:grab`)).to.equal([``].join(''))
		expect(prefix(`cursor: grab`)).to.equal([``].join(''))
		expect(prefix(`cursor :grab`)).to.equal([``].join(''))
	})

	test('backface-visibility', () => {
		expect(prefix(`backface-visibility:hidden`)).to.equal([``].join(''))
		expect(prefix(`backface-visibility: hidden`)).to.equal([``].join(''))
		expect(prefix(`backface-visibility :hidden`)).to.equal([``].join(''))
	})

	test('transition', () => {
		expect(prefix(`transition:transform 1s,transform all 400ms,text-transform`)).to.equal([``].join(''))
		expect(prefix(`transition: transform 1s,transform all 400ms,text-transform`)).to.equal([``].join(''))
		expect(prefix(`transition: transform 1s,transform all 400ms,text-transform`)).to.equal([``].join(''))
	})

	test('writing-mode', () => {
		expect(prefix(`writing-mode:vertical-lr`)).to.equal([``].join())
		expect(prefix(`writing-mode:vertical-rl`)).to.equal([``].join())
		expect(prefix(`writing-mode:horizontal-tb`)).to.equal([``].join())
		expect(prefix(`writing-mode:sideways-rl`)).to.equal([``].join())
		expect(prefix(`writing-mode:sideways-lr`)).to.equal([``].join())
	})

	test('columns', () => {
		expect(prefix(`columns:auto`)).to.equal([``].join(''))
		expect(prefix(`column-count:auto`)).to.equal([``].join(''))
		expect(prefix(`column-fill:auto`)).to.equal([``].join(''))
		expect(prefix(`column-gap:auto`)).to.equal([``].join(''))
		expect(prefix(`column-rule:auto`)).to.equal([``].join(''))
		expect(prefix(`column-rule-color:auto`)).to.equal([``].join(''))
		expect(prefix(`column-rule-style:auto`)).to.equal([``].join(''))
		expect(prefix(`column-rule-width:auto`)).to.equal([``].join(''))
		expect(prefix(`column-span:auto`)).to.equal([``].join(''))
		expect(prefix(`column-width:auto`)).to.equal([``].join(''))
	})

	test('text', () => {
		expect(prefix(`text-align:none`)).to.equal([``].join(''))
		expect(prefix(`text-transform:none`)).to.equal([``].join(''))
		expect(prefix(`text-shadow:none`)).to.equal([``].join(''))
		expect(prefix(`text-size-adjust:none`)).to.equal([``].join(''))
		expect(prefix(`text-decoration:none`)).to.equal([``].join(''))
	})

	test('mask', () => {
		expect(prefix(`mask-image: none`)).to.equal([``].join(''))
		expect(prefix(`mask-image: linear-gradient(#fff)`)).to.equal([``].join(''))
	})

	test('filter', () => {
		expect(prefix(`filter:grayscale(100%)`)).to.equal([``].join(''))
		expect(prefix(`fill:red`)).to.equal([``].join(''))
	})

	test('position', () => {
		expect(prefix(`position: sticky;`)).to.equal([``].join(''))
	})

	test('box', () => {
		expect(prefix(`box-decoration-break: none;`)).to.equal([``].join(''))
		expect(prefix(`box-sizing:none;`)).to.equal([``].join(''))
	})

	test('clip', () => {
		expect(prefix(`clip-path: none`)).to.equal([``].join(''))
	})

	test('zoom', () => {
		expect(prefix(`min-zoom: 0`)).to.equal([``].join(''))
	})

	test('size', () => {
		expect(prefix(`width: auto`)).to.equal([``].join(''))
		expect(prefix(`width: unset`)).to.equal([``].join(''))
		expect(prefix(`width: initial`)).to.equal([``].join(''))
		expect(prefix(`width: inherit`)).to.equal([``].join(''))
		expect(prefix(`width: 10`)).to.equal([``].join(''))
		expect(prefix(`width: min()`)).to.equal([``].join(''))
		expect(prefix(`width: var(--foo-content)`)).to.equal([``].join(''))
		expect(prefix(`width: var(-content)`)).to.equal([``].join(''))
		expect(prefix(`width: var(--max-content)`)).to.equal([``].join(''))
		expect(prefix(`width: --max-content`)).to.equal([``].join(''))
		expect(prefix(`width: fit-content`)).to.equal([``].join(''))
		expect(prefix(`min-width: max-content`)).to.equal([``].join(''))
		expect(prefix(`max-width: min-content`)).to.equal([``].join(''))
		expect(prefix(`height: fill-available`)).to.equal([``].join(''))
		expect(prefix(`max-height: fit-content`)).to.equal([``].join(''))
		expect(prefix(`width: stretch`)).to.equal([``].join(''))
		expect(prefix(`width: stretch !important`)).to.equal([``].join(''))
		expect(prefix(`min-block-size:max-content`)).to.equal([``].join(''))
		expect(prefix(`min-inline-size:max-content`)).to.equal([``].join(''))
	})

	test('background', () => {
		expect(prefix(`background:image-set(url(foo.jpg) 2x)`)).to.equal([``].join(''))
		expect(prefix(`background-image:image-set(url(foo.jpg) 2x)`)).to.equal([``].join(''))
	})

	test('animation', () => {
		expect(prefix(`animation: inherit`)).to.equal([``].join(''))
		expect(prefix(`animation-duration: 0.6s`)).to.equal([``].join(''))
		expect(prefix(`animation-name: slidein`)).to.equal([``].join(''))
		expect(prefix(`animation-iteration-count: infinite`)).to.equal([``].join(''))
		expect(prefix(`animation-timing-function: cubic-bezier(0.1,0.7,1.0,0.1)`)).to.equal([``].join(''))
	})

	test('keyframes', () => {
		expect(prefix(`@keyframes name { to { transform:translate(20px); } }`)).to.equal([``].join(''))
	})
})
