# STYLIS

[![stylis](https://stylis.js.org/assets/logo.svg)](https://github.com/thysultan/stylis.js)

stylis is a feature-rich css preprocessor

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

:host {color:red}
:host(.fancy) {color:red}
:host-context(body) {color:red}

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

```scss
#id {font-size: 2em;}

:host {color:red}
:host(.fancy) {color:red}
:host-context(body) {color:red}

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
stylis(selector: {string}, css: {string})
```

#### Use

```javascript
stylis.use(plugin: {function|function[]})
```

#### Set

```javascript
stylis.set(options: {
	global: true // active :global selectors
	cascade: true|false // activate aggressive cascade isolation
	keyframes: true|false // namespace keyframes + animations
	prefix: true|false // (de)active vendor prefixing
	compress: true|false // enables aggressive minification
	context: 1-6 // enable/disable specific plugin context
})
```
#### Prefix

```javascript
stylis.prefix(false) // deactivates vendor prefixing
```

## Plugins

The optional middleware function accepts four arguments `context, string, line, column, id, length`.
The middleware is executed in stages and passed a interger value that identifies at what stage it is in.

```
0 /* preparation context signature */
1 /* selector context signature */
2 /* rule context signature */
3 /* property context signature */
4 /* flat context signature */
5 /* block context signature */
6 /* post-process context signature */
```

1. `0` preparation context, before the compiler starts
2. `1` on a selector declaration ex. `.foo, .bar`
3. `2` on a rule declaration ex. `.foo`
4. `3` on a property declaration ex. `color: red;`
6. `4` after a section of flat css has been processed ex. `color:blue;`
5. `5` after a block of css has been processed i.e `.foo {color:red;}`
8. `6` before the compiled css output is returned
9. `7` after every un-token'ed new line (mainly to use for linting)

If at any context point the middleware returns a non-falsey value the token or block of css will be replaced with the return value. For example we can add a feature `random()` that when used prints a random number.

```javascript
stylis.use((context, value) => {
	switch (context) {
		case 3: return str.replace(/random\(\)/g, Math.random())
	}
})

stylis(``, `h1 { width: calc(random()*10); }`)
```

Will replace all instances of `random()` with a random number.
