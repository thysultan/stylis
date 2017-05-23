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

#### Use

```javascript
stylis.use(plugin: {Function|Array<Function>})
```

#### Set

```javascript
// all options are enabled by default
stylis.set(options: {
	global: {Boolean} // (dis)enable :global selectors
	cascade: {Boolean} // (dis)enable aggressive cascade isolation
	keyframes: {Boolean} // (dis)enable namespace keyframes + animations
	prefix: {Boolean} // (dis)enable vendor prefixing
	compress: {Boolean} // (dis)enable aggressive minification
})
```

## Plugins

The optional middleware function accepts four arguments `context, string, line, column, id, length`.
The middleware is executed in stages and passed a interger value that identifies at what stage it is in.

```
-1 /* preparation context signature */
-2 /* post-process context signature */
0  /* newline context signture */
1  /* property context signature */
2  /* block context signature */
```

- `-1` preparation context, before the compiler starts
- `-2` before the compiled css output is returned
- `0` after every newline
- `1` on a property declaration ex. `color: red;`
- `2` after a block of css has been processed i.e `.foo {color:red;}`

If at any context greater than 0 that the middleware returns a different string the property or block of css will be replaced with the return value.

For example we can add a feature `random()` that when used prints a random number.

```javascript
stylis.use((context, selector, content, line, column, length) => {
	switch (context) {
		case 1: return content.replace(/random\(\)/g, Math.random())
	}
})

stylis(``, `h1 { width: calc(random()*10); }`)
```

This will replace all instances of `random()` with a random number.

This works because before stylis processes the `calc(random()*10);` property it would pass the propery to the plugin, if in turn the plugin returns something different from what it received stylis will replace the content of the property with the return value and continue processing that.

The same can be said for a selector block, in both contexts a paramter `selector` the is the current array of selectors that the block of css/property stylis is working on. If you wanted to changed a blocks selector on the fly you could mutate this array to represent the selector pattern you require.
