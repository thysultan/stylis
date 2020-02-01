## Experimental rewrite

The idea is experiment with going full-on with shipping es modules with the lessons learned, and see how small, how fast, and how modular we can go.

Currently the rewrite sits comfortably just under 2kb, with a theoratical performance improvement(haven't test anything yet). This estimate includes the prefixer so excluded this would sit within the low-range ballpark of around ~1kb.

In comparision the current version sits around ~4kb.

### Example Use:

```js
import {compile, stringify, prefixer, middleware} from 'stylis'

serialize(compile(``), stringify) // default
serialize(compile(``), middleware([prefixer, stringify])) // middlware
```

## AST(maybe)

```js
const comment = {
	value: "/*! Lorem ipsum dolor sit. */",
	type: "comment",
	props: '!',
	children: "Lorem ipsum dolor sit.",
	line: 1,
	column: 1,
	caret: 2
}
const decl = {
	value: "color:red",
	type: "decl",
	props: "color",
	children: "red",
	line: 1,
	column: 1,
	caret: 2
}
const rule = {
	value: "h1,h2",
	type: "rule",
	props: ['h1', 'h2'],
	children: [...],
	line: 1,
	column: 1,
	caret: 2
}
const atrule = {
	value: "@media (max-width:100), (min-width:100)",
	type: "@media",
	props: ['(max-width:100)', '(min-width:100)'],
	children: [...],
	line: 1,
	column: 1,
	caret: 2
}
```
