import {compile, serialize, stringify, middleware, rulesheet, prefixer, namespace} from "../index.js"

const stack = []

describe('Middleware', () => {
  test('rulesheet', () => {
    serialize(compile(`
      @import url('something.com/file.css');
      .user{ h1 {width:0;}
      @media{width:1;}
      @keyframes name{from{width:0;}to{width:1;}}}
      @keyframes empty{}
      @supports (display: grid) {
        @media (min-width: 500px){
          .a::placeholder{color: red;}
        }
      }
      @media (min-width: 500px) {
        a:read-only{color:red;}
      }
    `), middleware([prefixer, stringify, rulesheet(value => stack.push(value))]))
    expect(stack).to.deep.equal([
      `@import url('something.com/file.css');`,
      `.user h1{width:0;}`,
      `@media{.user{width:1;}}`,
      `@-webkit-keyframes name{from{width:0;}to{width:1;}}`,
      `@keyframes name{from{width:0;}to{width:1;}}`,
      '@-webkit-keyframes empty{}',
      '@keyframes empty{}',
      '@supports (display: grid){@media (min-width: 500px){.a::-webkit-input-placeholder{color:red;}}}',
      '@supports (display: grid){@media (min-width: 500px){.a::-moz-placeholder{color:red;}}}',
      '@supports (display: grid){@media (min-width: 500px){.a:-ms-input-placeholder{color:red;}}}',
      '@supports (display: grid){@media (min-width: 500px){.a::placeholder{color:red;}}}',
      '@media (min-width: 500px){a:-moz-read-only{color:red;}}',
      '@media (min-width: 500px){a:read-only{color:red;}}',
    ])
  })

  test('namespace', () => {
    expect(serialize(compile(`.user{width:0; :global(p,a){width:1;} h1 {width:1; h2:last-child {width:2} h2 h3 {width:3}}}`), middleware([namespace, stringify]))).to.equal([
      `.user{width:0;}`, `p,a{width:1;}`, `h1.user.user{width:1;}`, `h1.user h2:last-child.user{width:2;}`, `h1.user h2 h3.user{width:3;}`
    ].join(''))

    expect(serialize(compile(`.user:before{color:red;}`), middleware([namespace, stringify]))).to.equal([
      `:before.user.user{color:red;}`
    ].join(''))

    expect(serialize(compile(`.user:global(.bar){color:red;}`), middleware([namespace, stringify]))).to.equal([
      `.bar{color:red;}`
    ].join(''))
  })

  test('comments', () => {
    expect(serialize(compile(`/*@noflip*/ .user{//noflip\n\n}`), middleware([value => value.type === 'comm' ? 'color:red;' : '', stringify]))).to.deep.equal([
      `color:red;.user{color:red;}`
    ].join())
  })

  test('prefixer', () => {
    expect(serialize(compile(`.user{h1:last-child{clip-path:none;}`), middleware([prefixer, stringify]))).to.equal([
      `.user h1:last-child{-webkit-clip-path:none;clip-path:none;}`,
    ].join(''))

    expect(serialize(compile(`@keyframes name{from{transform: rotate(0deg);}to{transform: rotate(360deg);}}`), middleware([prefixer, stringify]))).to.equal([
      `@-webkit-keyframes name{from{-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg);}to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg);}}`,
      `@keyframes name{from{-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg);}to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg);}}`
    ].join(''))

    expect(serialize(compile(`a:read-only{color:red;}`), middleware([prefixer, stringify]))).to.equal([
      `a:-moz-read-only{color:red;}`, `a:read-only{color:red;}`
    ].join(''))

    expect(serialize(compile(`a:read-write{color:red;}`), middleware([prefixer, stringify]))).to.equal([
      `a:-moz-read-write{color:red;}`, `a:read-write{color:red;}`
    ].join(''))

    expect(serialize(compile(`a::placeholder{color:red;}`), middleware([prefixer, stringify]))).to.equal([
      `a::-webkit-input-placeholder{color:red;}`, `a::-moz-placeholder{color:red;}`, `a:-ms-input-placeholder{color:red;}`, `a::placeholder{color:red;}`
    ].join(''))

    expect(serialize(compile(`textarea::placeholder{font-size:14px;@media{font-size:16px;}}`), middleware([prefixer, stringify]))).to.equal([
      `textarea::-webkit-input-placeholder{font-size:14px;}`,
      `textarea::-moz-placeholder{font-size:14px;}`,
      `textarea:-ms-input-placeholder{font-size:14px;}`,
      `textarea::placeholder{font-size:14px;}`,
      `@media{textarea::-webkit-input-placeholder{font-size:16px;}}`,
      `@media{textarea::-moz-placeholder{font-size:16px;}}`,
      `@media{textarea:-ms-input-placeholder{font-size:16px;}}`,
      `@media{textarea::placeholder{font-size:16px;}}`,
    ].join(''))

    expect(serialize(compile(`div:read-write{background-color:red;span{background-color:green;}}`), middleware([prefixer, stringify]))).to.equal([
      `div:-moz-read-write{background-color:red;}`,
      `div:read-write{background-color:red;}`,
      `div:-moz-read-write span{background-color:green;}`,
      `div:read-write span{background-color:green;}`,
    ].join(''))

    expect(serialize(compile(`div:read-write span{background-color:hotpink;}`), middleware([prefixer, stringify]))).to.equal([
      `div:-moz-read-write span{background-color:hotpink;}`,
      `div:read-write span{background-color:hotpink;}`,
    ].join(''))

    expect(serialize(compile(`.read-write:read-write,.read-only:read-only,.placeholder::placeholder{background-color:hotpink;}`), middleware([prefixer, stringify]))).to.equal([
      `.read-write:-moz-read-write{background-color:hotpink;}`,
      `.read-write:read-write{background-color:hotpink;}`,
      `.read-only:-moz-read-only{background-color:hotpink;}`,
      `.read-only:read-only{background-color:hotpink;}`,
      `.placeholder::-webkit-input-placeholder{background-color:hotpink;}`,
      `.placeholder::-moz-placeholder{background-color:hotpink;}`,
      `.placeholder:-ms-input-placeholder{background-color:hotpink;}`,
      `.placeholder::placeholder{background-color:hotpink;}`,
    ].join(''))

    expect(serialize(compile(`:read-write{background-color:hotpink;}`), middleware([prefixer, stringify]))).to.equal([
      `:-moz-read-write{background-color:hotpink;}`,
      `:read-write{background-color:hotpink;}`,
    ].join(''))
  })
})
