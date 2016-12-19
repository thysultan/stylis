## 0.8.2 (December 19, 2016)

- better handle line comments

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