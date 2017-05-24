# STYLIS

[![stylis](https://stylis.js.org/assets/logo.svg)](https://github.com/thysultan/stylis.js)

light – weight css preprocessor

- ~2Kb

[![npm](https://img.shields.io/npm/v/stylis.svg?style=flat)](https://www.npmjs.com/package/stylis) [![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/stylis.js/blob/master/LICENSE.md) [![Build Status](https://semaphoreci.com/api/v1/thysultan/stylis-js/branches/master/shields_badge.svg)](https://semaphoreci.com/thysultan/stylis-js) ![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat)

## Supports

* Edge
* IE 8+
* Chrome
* Firefox
* Safari
* Node

---

## Installation

#### direct download

```html
<script src=stylis.min.js></script>
```

#### CDN


```html
<script src=https://unpkg.com/stylis@3.0.0/stylis.min.js></script>
```

#### npm

```
npm install stylis --save
```

## Features

- web component emulation of `:host`, `:host()` and `:host-context()`
- selector namespacing/isolcation
- inline global injection ex. `:global(selector)`
- nesting `a { &:hover {} }`
- vendor prefixing (flex-box, etc...)
- flat stylesheets `color: red; h1 { color: red; }`
- keyframe and animation namespacing
- plugins

---

## Input

```javascript
stylis('#id', `
font-size: 2em;

// line comments
/* block comments */

:global(body) {background:red}

h1 {
	h2 {
		h2 {
			content:'nesting'
		}
	}
}

@media (max-width: 600px) {
	& {display:none}
}

&:before {
	animation: slide 3s ease infinite
}

@keyframes slide {
	from { opacity: 0}
	to { opacity: 1}
}

& {
	display: flex
}

&::placeholder {
	color:red
}
`);
```

## Output

```css
#id {font-size: 2em;}

body {background:red}
h1 h2 h3 {content: 'nesting'}

@media (max-width: 600px) {
	#id {display:none}
}

#id:before {
	-webkit-animation: slide-id 3s ease infinite;
	animation: slide-id 3s ease infinite;
}


@-webkit-keyframes slide-id {
	from { opacity: 0}
	to { opacity: 1}
}
@keyframes slide-id {
	from { opacity: 0}
	to { opacity: 1}
}

#id {
	display:-webkit-box;
	display:-webkit-flex;
	display:-ms-flexbox;
	display:flex;
}

#id::-webkit-input-placeholder {color:red;}
#id::-moz-placeholder {color:red;}
#id:-ms-input-placeholder {color:red;}
#id::placeholder {color:red;}
```

## API

#### Stylis

```javascript
stylis(selector: {String}, css: {String})
```

#### Set

```javascript
// all options are enabled by default
stylis.set(options: {
	global: {Boolean} // (dis/en)able :global selectors
	cascade: {Boolean} // (dis/en)able aggressive cascade isolation
	keyframe: {Boolean} // (dis/en)able namespace keyframes + animations
	prefix: {Boolean} // (dis/en)able vendor prefixing
	compress: {Boolean} // (dis/en)able aggressive minification
	semicolon: {Boolean} // (dis/en)able (no)semicolon support
})
```

#### Use

```javascript
stylis.use(plugin: {Function|Array<Function>})
```

The use function is chainable ex. `stylis.use()()()`

## Plugins

The optional middleware function accepts four arguments

```js
(context, content, selectors, parent, line, column, length)
```

Plugins are executed in stages identified by an `context` interger value.

```
-1 /* preparation context */
-2 /* post-process context */
0  /* newline context */

1  /* property context */
2  /* selector block context */
3  /* @at-rule block context
```

> Note: Since the newline context is intended for source-map/linting plugins by default stylis will not execute plugins in this context unless enabled, this can be done through `stylis.use(true)` or disabled after that through `stylis.use(false)`.

- `-1` preparation context, before the compiler starts
- `-2` post processed context, before the compiled css output is returned
- `0` after every newline
- `1` on a property declaration ex. `color: red;`
- `2` after a selector block of css has been processed ex. `.foo {color:red;}`
- `3` after a `@at-rule` block of css has been processed ex. `@media {h1{color:red;}}`

If at any context greater than 0 that the middleware returns a different string the content of css will be replaced with the return value.

For example we can add a feature `random()` to our css that when used prints a random number.

```javascript
/**
 * plugin
 *
 * @param  {number} context
 * @param  {Array<string>} selector
 * @param  {Array<string>} parent
 * @param  {string} content
 * @param  {number} line
 * @param  {number} column
 * @param  {number} length
 * @return {(string|void)?}
 */
const plugin = (context, selector, parent, content, line, column, length) => {
	switch (context) {
		case 1: return content.replace(/random\(\)/g, Math.random())
	}
}

/**
 * use
 *
 * @param {(Array<function>|function|null|boolean)} plugin
 */
stylis.use(plugin)

stylis(``, `h1 { width: calc(random()*10); }`)
```

This will replace all instances of `random()` with a random number.

Internally Before stylis processes `calc(random()*10);` it passes it to the plugin if a plugin exists; If in turn the plugin returns something different from what it received stylis will replace the content of the property with the return value and continue processing that.

The same can be said for a selector block, in both contexts an argument `selector` is passed that contains the current array of selectors that the block of css/property stylis is working on.

This array of selectors is mutable and will reflect the output of selectors if changed.
