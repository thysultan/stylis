## 2.0.0 April 01, 2016)

- add vendor prefix for `::placeholder`
- add vendor prefix for `justify-content`
- patch vendor prefix for `align-items`
- remove mixins, variables and block level `@global {}`
- improve disabling compact features option
- 3.67KB -> 3.12KB

## 1.2.8 March 26, 2016)

- patch `!important` in `display: flex` vendor prefixing

## 1.2.7 March 25, 2016)

- patch short hand animation name parser

## 1.2.6 March 14, 2016)

- improve vendor prefixer, adds max-content and min-content

## 1.2.5 (March 11, 2016)

- improve last semicolon omission
- improve `:global()` selector parsing

## 1.2.4 (March 9, 2016)

- patch nesting for `:global()` selectors

## 1.2.3 (March 5, 2016)

- patch `:global()` selector

## 1.2.2 (March 5, 2016)

- patch `:global()` selector

## 1.2.1 (March 4, 2016)

- patch for `animation*}` when used as a last property without a semicolon

## 1.2.0 (March 3, 2016)

- patch single apostrophes in comments
- patch nested selector `:global()`
- patch middleware param ignored when `stylis.use` is used to register middlewares
- add new middleware context `ctx = 7` to allow for better linter plugins

## 1.1.13 (February 24, 2016)

- patch nesting in a `@media` block
- patch parent reference selector `selector &`

## 1.1.12 (February 21, 2016)

- patch to better handle `semicolon` omission on the last property of a selector

## 1.1.11 (February 18, 2016)

- patch `:matches(a, b, c)` and simplify `,` token handler

## 1.1.10 (February 16, 2016)

- patch token in selector i.e `.test[title=","]`

## 1.1.9 (February 16, 2016)

- patch arguments passed to middleware current `output` character count `length`

## 1.1.8 (February 16, 2016)

- patch `&` specifity overloaded, i.e `&&, & + &...`

## 1.1.7 (February 16, 2016)

- patch `:global(:not())`, `&:global()` and `:global` in nested block

## 1.1.6 (February 16, 2016)

- patch `@media {}` in nested block
- patch column and line number in nested block

## 1.1.5 (February 16, 2016)

- patch nesting in `@global {}` block

## 1.1.4 (February 16, 2016)

- patch `@global`

## 1.1.3 (February 13, 2016)

- patch `cubic-bezier`

## 1.1.2 (February 13, 2016)

- patch `@font-face {}`

## 1.1.1 (February 11, 2016)

- prefix `cursor: grab|grabbing|zoom-in|zoom-out;`
- allow `&` to be used as specifity multiplier `&&` when used in conjunction

## 1.1.0 (February 10, 2016)

- add middleware context `ctx = 1.5` for every individual selector

## 1.0.10 (February 09, 2016)

- patch block comments

## 1.0.9 (February 09, 2016)

- patch inline-block comments
- follow a consistent property-value format for `display: flex;` prefix

## 1.0.8 (February 08, 2016)

- patch prefix `-ms-flexbox`

## 1.0.7 (February 06, 2016)

- patch selectors in nested block

## 1.0.6 (February 06, 2016)

- improve handling `,` comma tokens in attribute selectors

## 1.0.5 (February 06, 2016)

- patch block comments inlined with selectors
- patch attribute selectors

## 1.0.4 (February 02, 2016)

- patch `&` nested selectors

## 1.0.3 (February 01, 2016)

- patch `inline-flex` property being replaced with `flex`

## 1.0.2 (January 31, 2016)

- patch parsing tokens in urls

## 1.0.1 (January 31, 2016)

- patch urls and data uri's

## 1.0.0 (January 27, 2016)

- improve parsing and namespacing animations names in the `animation:` property
- avoid parsing for animation name when animation namespacing is disabled
- performance improvements
- support adding middleware/plugins with objects via `stylis.use`
- add IE 8 support

## 0.12.0 (January 25, 2016)

- more supported extensions to the `@import` parser.
- finallize middleware lifecycles, adds one before compiling
- add `stylis.use` to register multiple middlewares independently

## 0.11.0 (January 20, 2016)

- patch for @media flat css

## 0.11.0 (January 18, 2016)

- patch flat, nested and import css order
- add new context that executes middleware just before compiled output is returned
- add support for higher level middleware support with middleware objects

## 0.10.0 (January 16, 2016)

- enable compact flag to enable additional features(variables and mixins)
- support nested @media blocks
- patch `&` token useage `html & {}` to produce `html ${namespace} {}`
- seperate tokens passed to middleware into `selector, property, block, flat, imports`

## 0.9.2 (January 06, 2016)

- variables `$foo: ;` -> `~~foo: ;` and `color: var(~~foo);`
- prevent variable declarations in selectors
- improve animation name finder

## 0.9.1 (January 06, 2016)

- patch animation property namespacing

## 0.9.0 (January 06, 2016)

- add support for sass-like mixins
- add support for sass-like variables in string format `$foo: 1; color: $foo;`
- add support for middleware
- patch comments in flat css context
- patch animation property
- patch tokens in strings

## 0.8.3 (December 20, 2016)

- patch `:host` conflict with `:hover`

## 0.8.2 (December 20, 2016)

- better handle line comments
- small improvements to compiler

## 0.8.1 (December 19, 2016)

- patch 0.8.0 regression with @media blocks skipping namespaces

## 0.8.0 (December 19, 2016)

- add nested support `h1 { color: red; &:hover { color: blue; } }`
- add support for flat css in @media block
- improve flat css support
- patch `//` line comments

## 0.7.0 (December 12, 2016)

- add inline `:global()` function, change `@root` to `@global`

## 0.6.8 (December 06, 2016)

- patch `:host...` implementation conflict with `:root...`

## 0.6.7 (December 06, 2016)

- add support for shadow dom selectors `:host, :host(selector), :host-context(selector)`

## 0.6.6 (December 06, 2016)

- reduction to output payload(unused prefixes)

## 0.6.5 (December 06, 2016)

- improvements to handling of line comments
- improvements to parsing performance

## 0.6.4 (December 05, 2016)

- improvements to parsing, do away with the little regex that was used
- handle edge cases with `@keyframes` nested in `@root` block
- support complete prefix support in `@keyframes` and `@root` blocks

## 0.6.3 (December 04, 2016)

- patch `h1, &:before{}` pseudo selectors in multiple selectors

## 0.6.2 (December 04, 2016)

- patch flat css `stylis('#id', 'color:red;')` to act as a block `stylis('#id', '&{color:red;}')`
