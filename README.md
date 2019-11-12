## Experimental rewrite

The idea is experiment with going full-on with shipping es modules with the lessons learned, and see how small, how fast, and how modular we can go.

Currently the rewrite sits comfortably just under 2kb, with a theoratical performance improvement(haven't test anything yet). This estimate includes the prefixer so excluded this would sit within the low-range ballpark of around ~1kb.

In comparision the current version sits around ~4kb.

## AST(maybe)

```js
const comment = {
	source: {line: 1, column: 0, caret: 2},
	value: "/*! Lorem ipsum dolor sit. */",
	type: "comment",
	props: '!',
	children: "Lorem ipsum dolor sit.",
}
const decl = {
	source: {line: 1, column: 0, caret: 2},
	value: "color:red",
	type: "decl",
	props: "color",
	children: "red"
}
const rule = {
	source: {line: 1, column: 0, caret: 2},
	value: "h1,h2",
	type: "rule",
	props: ['h1', 'h2'],
	children: [...]
}
const atrule = {
	source: {line: 1, column: 0, caret: 2},
	value: "@media (max-width:100), (min-width:100)",
	type: "@media",
	props: ['(max-width:100)', '(min-width:100)'],
	children: [...]
}
```
