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