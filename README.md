# STYLIS

[![stylis](https://stylis.js.org/assets/logo.svg)](https://github.com/thysultan/stylis.js)

A Light–weight CSS Preprocessor.

[![Coverage](https://coveralls.io/repos/github/thysultan/stylis.js/badge.svg?branch=master)](https://coveralls.io/github/thysultan/stylis.js)
[![Size](https://badgen.net/bundlephobia/minzip/stylis)](https://bundlephobia.com/result?p=stylis)
[![Licence](https://badgen.net/badge/license/MIT/blue)](https://github.com/dyo/dyo/blob/master/LICENSE.md)
[![NPM](https://badgen.net/npm/v/dyo)](https://www.npmjs.com/package/dyo)

## Installation

* Use a Direct Download: `<script src=stylis.js></script>`
* Use a CDN: `<script src=unpkg.com/stylis></script>`
* Use NPM: `npm install stylis --save`

## Features

- nesting `a { &:hover {} }`
- selector namespacing
- vendor prefixing (flex-box, etc...)
- minification
- esm module compatible
- tree-shaking-able

## Abstract Syntax Structure

```js
const declaration = {
	value: 'color:red;',
	type: 'decl',
	props: 'color',
	children: 'red',
	line: 1, column: 1
}

const comment = {
	value: '/*@noflip*/',
	type: 'comm',
	props: '/',
	children: '@noflip',
	line: 1, column: 1
}

const ruleset = {
	value: 'h1,h2',
	type: 'rule',
	props: ['h1', 'h2'],
	children: [/* ... */],
	line: 1, column: 1
}

const atruleset = {
	value: '@media (max-width:100), (min-width:100)',
	type: '@media',
	props: ['(max-width:100)', '(min-width:100)'],
	children: [/* ... */],
	line: 1, column: 1
}
```

## Example:

```js
import {compile, serialize, stringify} from 'stylis'

serialize(compile(`h1{all:unset}`), stringify)
```

### Compile

```js
compile('h1{all:unset}') === [{value: 'h1', type: 'rule', props: ['h1'], children: [/* ... */]}]
compile('--foo:unset;') === [{value: '--foo:unset;', type: 'decl', props: '--foo', children: 'unset'}]
```

### Tokenize

```js
tokenize('h1 h2 h3 [h4 h5] fn(args) "a b c"') === ['h1', 'h2', 'h3', '[h4 h5]', 'fn', '(args)', '"a b c"']
```

### Serialize

```js
serialize(compile('h1{all:unset}'), stringify)
```

## Middleware

The middleware helper is a convinent helper utility, that for all intensive purposes you can do without if you intend to implement your own traversal logic. The `stringify` middleware is one such middleware that can be used in conjunction with it.

Elements passed to middlewares have a `root` property that is the immediate root/parent of the current element.

### Traversal

```js
serialize(compile('h1{all:unset}'), middleware([(element, index, children) => {
	assert(children === element.root.children && children[index] === element.children)
}, stringify])) === 'h1{all:unset;}'
```

The abstract syntax tree also includes an additional `return` property for more niche uses.

### Prefixing

```js
serialize(compile('h1{all:unset}'), middleware([(element, index, children, callback) => {
	if (element.type === 'decl' && element.props === 'all' && element.children === 'unset')
		element.return = 'color:red;' + element.value
}, stringify])) === 'h1{color:red;all:unset;}'
```

```js
serialize(compile('h1{all:unset}'), middleware([(element, index, children, callback) => {
	if (element.type === 'rule' && element.props.indexOf('h1') > -1)
		return serialize([{...element, props: ['h2', 'h3']}], callback)
}, stringify])) === 'h2,h3{all:unset;}h1{all:unset;}'
```

### Reading

```js
serialize(compile('h1{all:unset}'), middleware([stringify, (element, index, children) => {
	assert(element.return === 'h1{all:unset;}')
}])) === 'h1{all:unset;color:red;}'
```

The middlewares in [src/Middleware.js](src/Middleware.js) dive into tangible examples of how you might implement a middleware, alternatively you could also create your own middleware system as `compile` returns all the nessessary structure to fork from.

## Benchmark

Stylis is at-least 2X faster than it's predecesor.

### License

Stylis is [MIT licensed](./LICENSE).
