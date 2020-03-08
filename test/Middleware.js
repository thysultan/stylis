import {compile, serialize, stringify, middleware, rulesheet, prefixer, namespace} from "../index.js"

const stack = []

describe('Middleware', () => {
	test('rulesheet', () => {
  	serialize(compile(`.user{h1 {width:0;} @media{width:1;}}`), middleware([stringify, rulesheet(value => stack.push(value))]))
  	expect(stack).to.deep.equal([`.user h1{width:0;}`, `@media{.user{width:1;}}`])
  })

  test('prefixer', () => {
  	expect(serialize(compile(`.user{h1:last-child{clip-path:none;} h1:read-only{all:unset;} @keyframes{from{width:0;}to{width:1;}}}`), middleware([prefixer, stringify]))).to.equal([
  		`.user h1:last-child{-webkit-clip-path:none;clip-path:none;}`,
      `.user h1:-moz-read-only{all:unset;}`, `.user h1:read-only{all:unset;}`,
      `@-webkit-keyframes{from{width:0;}to{width:1;}}`, `@keyframes{from{width:0;}to{width:1;}}`
		].join(''))
  })

  test('namespace', () => {
  	expect(serialize(compile(`.user{width:0; :global(p,a){width:1;} h1 {width:1; h2:last-child {width:2}} @media{width:1;}}`), middleware([namespace, stringify]))).to.equal([
      `.user{width:0;}`, `p,a{width:1;}`, `h1.user{width:1;}`, `h1.user h2.user:last-child{width:2;}`, `@media{.user{width:1;}}`
    ].join(''))
  })
})
