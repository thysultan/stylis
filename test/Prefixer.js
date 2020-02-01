import {prefix} from "../index.js"

describe('Prefixer', () => {
	// TODO:
	// - test vendor prefixing:
	//    - ::placeholder ?
	//    - :read-only ?
	// - add prefixer API

	test('flex-box', () => {
		expect(prefix(`display:flex!important`, 7)).to.equal([`display:-webkit-box!important;`, `display:-webkit-flex!important;`, `display:-ms-flexbox!important;`].join(''))
		expect(prefix(`display:inline-flex`, 7)).to.equal([`display:-webkit-inline-box;`, `display:-webkit-inline-flex;`, `display:-ms-inline-flexbox;`].join(''))
		expect(prefix(`display:inline-box`, 7)).to.equal([`-webkit-display:inline-box;`].join(''))
		expect(prefix(`flex-grow:none`, 9)).to.equal([`-webkit-box-flex:none;`, `-webkit-flex-grow:none;`, `-ms-flex-positive:none;`].join(''))
		expect(prefix(`flex-shrink:none`, 11)).to.equal([`-webkit-flex-shrink:none;`, `-ms-flex-negative:none;`].join(''))
		expect(prefix(`flex-basis:none`, 10)).to.equal([`-webkit-flex-basis:none;`, `-ms-flex-preferred-size:none;`].join(''))
		expect(prefix(`align-self:value`, 10)).to.equal([`-webkit-align-self:value;`, `-ms-flex-item-align:value;`].join(''))
		expect(prefix(`align-self:flex-start`, 10)).to.equal([`-webkit-align-self:flex-start;`, `-ms-flex-item-align:flex-start;`].join(''))
		expect(prefix(`align-self:flex-end`, 10)).to.equal([`-webkit-align-self:flex-end;`, `-ms-flex-item-align:flex-end;`].join(''))
		expect(prefix(`align-content:value`, 13)).to.equal([`-webkit-align-content:value;`, `-ms-flex-line-pack:value;`].join(''))
		expect(prefix(`align-content:flex-start`, 13)).to.equal([`-webkit-align-content:flex-start;`, `-ms-flex-line-pack:flex-start;`].join(''))
		expect(prefix(`align-content:flex-end`, 13)).to.equal([`-webkit-align-content:flex-end;`, `-ms-flex-line-pack:flex-end;`].join(''))
		expect(prefix(`align-items:value`, 11)).to.equal([`-webkit-align-items:value;`, `-webkit-box-align:value;`, `-ms-flex-align:value;`].join(''))
		expect(prefix(`justify-content:flex-end`, 15)).to.equal([`-webkit-box-pack:end;`, `-ms-flex-pack:end;`, `-webkit-justify-content:flex-end;`].join(''))
		expect(prefix(`justify-content:flex-start`, 15)).to.equal([`-webkit-box-pack:start;`, `-ms-flex-pack:start;`, `-webkit-justify-content:flex-start;`].join(''))
		expect(prefix(`justify-content:justify`, 15)).to.equal([`-webkit-box-pack:justify;`, `-ms-flex-pack:justify;`, `-webkit-justify-content:justify;`].join(''))
		expect(prefix(`justify-content:space-between`, 15)).to.equal([`-webkit-box-pack:justify;`, `-webkit-justify-content:space-between;`].join(''))
		expect(prefix(`justify-items:center`, 13)).to.equal([``].join(''))
		expect(prefix(`order:flex`, 5)).to.equal([`-webkit-order:flex;`, `-ms-flex-order:flex;`].join(''))
	})

	test('transform', () => {
		expect(prefix(`transform:rotate(30deg)`, 9)).to.equal([`-webkit-transform:rotate(30deg);`, `-moz-transform:rotate(30deg);`, `-ms-transform:rotate(30deg);`].join(''))
	})

	test('cursor', () => {
		expect(prefix(`cursor:grab`, 6)).to.equal([`cursor:-webkit-grab;`, `cursor:-moz-grab;`].join(''))
	})

	test('backface-visibility', () => {
		expect(prefix(`backface-visibility:hidden`, 19)).to.equal([`-webkit-backface-visibility:hidden;`].join(''))
	})

	test('transition', () => {
		expect(prefix(`transition:transform 1s,transform all 400ms,text-transform`, 10)).to.equal([`-webkit-transition:-webkit-transform 1s,-webkit-transform all 400ms,text-transform;`].join(''))
	})

	test('writing-mode', () => {
		expect(prefix(`writing-mode:vertical-lr`, 12)).to.equal([`-webkit-writing-mode:vertical-lr;`, `-ms-writing-mode:tb;`].join(''))
		expect(prefix(`writing-mode:vertical-rl`, 12)).to.equal([`-webkit-writing-mode:vertical-rl;`, `-ms-writing-mode:tb-rl;`].join(''))
		expect(prefix(`writing-mode:horizontal-tb`, 12)).to.equal([`-webkit-writing-mode:horizontal-tb;`, `-ms-writing-mode:lr;`].join(''))
		expect(prefix(`writing-mode:sideways-rl`, 12)).to.equal([`-webkit-writing-mode:sideways-rl;`, `-ms-writing-mode:tb-rl;`].join(''))
		expect(prefix(`writing-mode:sideways-lr`, 12)).to.equal([`-webkit-writing-mode:sideways-lr;`, `-ms-writing-mode:tb;`].join(''))
	})

	test('columns', () => {
		expect(prefix(`columns:auto`, 7)).to.equal([`-webkit-columns:auto;`].join(''))
		expect(prefix(`column-count:auto`, 12)).to.equal([`-webkit-column-count:auto;`].join(''))
		expect(prefix(`column-fill:auto`, 11)).to.equal([`-webkit-column-fill:auto;`].join(''))
		expect(prefix(`column-gap:auto`, 10)).to.equal([`-webkit-column-gap:auto;`].join(''))
		expect(prefix(`column-rule:auto`, 11)).to.equal([`-webkit-column-rule:auto;`].join(''))
		expect(prefix(`column-rule-color:auto`, 17)).to.equal([`-webkit-column-rule-color:auto;`].join(''))
		expect(prefix(`column-rule-style:auto`, 17)).to.equal([`-webkit-column-rule-style:auto;`].join(''))
		expect(prefix(`column-rule-width:auto`, 17)).to.equal([`-webkit-column-rule-width:auto;`].join(''))
		expect(prefix(`column-span:auto`, 11)).to.equal([`-webkit-column-span:auto;`].join(''))
		expect(prefix(`column-width:auto`, 12)).to.equal([`-webkit-column-width:auto;`].join(''))
	})

	test('text', () => {
		expect(prefix(`text-align:left`, 10)).to.equal([``].join(''))
		expect(prefix(`text-transform:none`, 14)).to.equal([``].join(''))
		expect(prefix(`text-shadow:none`, 11)).to.equal([``].join(''))
		expect(prefix(`text-size-adjust:none`, 16)).to.equal([`-webkit-text-size-adjust:none;`, `-moz-text-size-adjust:none;`, `-ms-text-size-adjust:none;`].join(''))
		expect(prefix(`text-decoration:none`, 15)).to.equal([`-webkit-text-decoration:none;`].join(''))
	})

	test('mask', () => {
		expect(prefix(`mask:none`, 10)).to.equal([`-webkit-mask:none;`].join(''))
		expect(prefix(`mask-image:none`, 10)).to.equal([`-webkit-mask-image:none;`].join(''))
		expect(prefix(`mask-image:linear-gradient(#fff)`, 10)).to.equal([`-webkit-mask-image:linear-gradient(#fff);`].join(''))
		expect(prefix(`mask-mode:none`, 10)).to.equal([`-webkit-mask-mode:none;`].join(''))
		expect(prefix(`mask-clip:none`, 10)).to.equal([`-webkit-mask-clip:none;`].join(''))
		expect(prefix(`mask-size:none`, 10)).to.equal([`-webkit-mask-size:none;`].join(''))
		expect(prefix(`mask-repeat:none`, 10)).to.equal([`-webkit-mask-repeat:none;`].join(''))
		expect(prefix(`mask-origin:none`, 10)).to.equal([`-webkit-mask-origin:none;`].join(''))
		expect(prefix(`mask-position:none`, 10)).to.equal([`-webkit-mask-position:none;`].join(''))
		expect(prefix(`mask-composite:none`, 10)).to.equal([`-webkit-mask-composite:none;`].join(''))
	})

	test('filter', () => {
		expect(prefix(`filter:grayscale(100%)`, 6)).to.equal([`-webkit-filter:grayscale(100%);`].join(''))
		expect(prefix(`fill:red`, 4)).to.equal([``].join(''))
	})

	test('position', () => {
		expect(prefix(`position:sticky`, 8)).to.equal([`-webkit-position:sticky;`].join(''))
	})

	test('box', () => {
		expect(prefix(`box-decoration-break:slice`, 20)).to.equal([`-webkit-box-decoration-break:slice;`].join(''))
		expect(prefix(`box-sizing:border-box`, 10)).to.equal([``].join(''))
	})

	test('clip', () => {
		expect(prefix(`clip-path:none`, 9)).to.equal([`-webkit-clip-path:none;`].join(''))
	})

	test('size', () => {
		expect(prefix(`width:auto`, 5)).to.equal([].join(''))
		expect(prefix(`width:unset`, 5)).to.equal([].join(''))
		expect(prefix(`width:initial`, 5)).to.equal([].join(''))
		expect(prefix(`width:inherit`, 5)).to.equal([].join(''))
		expect(prefix(`width:10`, 5)).to.equal([].join(''))
		expect(prefix(`width:min()`, 5)).to.equal([].join(''))
		expect(prefix(`width:var(--foo-content)`, 5)).to.equal([].join(''))
		expect(prefix(`width:var(-content)`, 5)).to.equal([].join(''))
		expect(prefix(`width:var(--max-content)`, 5)).to.equal([].join(''))
		expect(prefix(`width:--max-content`, 5)).to.equal([``].join(''))
		expect(prefix(`width:fit-content`, 5)).to.equal([`width:-webkit-fit-content;`, `width:-moz-content;`].join(''))
		expect(prefix(`min-width:max-content`, 9)).to.equal([`min-width:-webkit-max-content;`, `min-width:-moz-max-content;`].join(''))
		expect(prefix(`max-width:min-content`, 9)).to.equal([`max-width:-webkit-min-content;`, `max-width:-moz-min-content;`].join(''))
		expect(prefix(`height:fill-available`, 6)).to.equal([`height:-webkit-fill-available;`, `height:-moz-available;`].join(''))
		expect(prefix(`max-height:fit-content`, 10)).to.equal([`max-height:-webkit-fit-content;`, `max-height:-moz-content;`].join(''))
		expect(prefix(`width:stretch`, 5)).to.equal([`width:-webkit-fill-available;`, `width:-moz-available;`].join(''))
		expect(prefix(`width:stretch !important`, 5)).to.equal([`width:-webkit-fill-available !important;`, `width:-moz-available !important;`].join(''))
		expect(prefix(`min-block-size:max-content`, 14)).to.equal([`min-block-size:-webkit-max-content;`, `min-block-size:-moz-max-content;`].join(''))
		expect(prefix(`min-inline-size:max-content`, 15)).to.equal([`min-inline-size:-webkit-max-content;`, `min-inline-size:-moz-max-content;`].join(''))
		expect(prefix(`min-zoom:0`, 8)).to.equal([``].join(''))
	})

	test('background', () => {
		expect(prefix(`background:image-set(url(foo.jpg) 2x)`, 10)).to.equal([`background:-webkit-image-set(url(foo.jpg) 2x);`].join(''))
		expect(prefix(`background-image:image-set(url(foo.jpg) 2x)`, 16)).to.equal([`background-image:-webkit-image-set(url(foo.jpg) 2x);`].join(''))
	})

	test('animation', () => {
		expect(prefix(`animation:inherit`, 9)).to.equal([`-webkit-animation:inherit;`].join(''))
		expect(prefix(`animation-duration:0.6s`, 18)).to.equal([`-webkit-animation-duration:0.6s;`].join(''))
		expect(prefix(`animation-name:slidein`, 14)).to.equal([`-webkit-animation-name:slidein;`].join(''))
		expect(prefix(`animation-iteration-count:infinite`, 25)).to.equal([`-webkit-animation-iteration-count:infinite;`].join(''))
		expect(prefix(`animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1)`, 25)).to.equal([`-webkit-animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);`].join(''))
	})

	test('keyframes', () => {
		expect(prefix(`@keyframes name { to { color:red; } }`, 10)).to.equal([`@-webkit-keyframes name { to { color:red; } }`].join(''))
	})
})
