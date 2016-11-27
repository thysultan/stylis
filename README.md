# Stylis

[![npm](https://img.shields.io/npm/v/stylis.svg?style=flat)](https://www.npmjs.com/package/stylis) [![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/stylis.js/blob/master/LICENSE.md) 
 ![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat)

- ~705bytes minified+gzipped
- ~1kb minified

Stylis is a small css compiler that turns this

```javascript
stylis('#user', styles);
```

Where `styles` is the following css

```css
@root {
	body {
		background: yellow;
	}
}

.name {
    transform: rotate(30deg);
}

span, h1 {
	color:red;

	/**
	 * removes block comments and line comments
	 */
}

&{
	animation: slidein 3s ease infinite;
}

&:before {
	animation: slidein 3s ease infinite;	
}

@keyframes slidein {
	from { transform: translate(10px); }
	to { transform: translate(200px); }
}

@media (max-width: 600px) {
	& { appearance: none; }
}
```

into this (minus the whitespace)

```css
body {
    background: yellow;
}
#user .name {
    -webkit-transform: rotate(30deg);
    transform: rotate(30deg);
}
#user span,
#user h1 {
    color: red;
}
#user {
    -webkit-animation: userslidein 3s ease infinite;
    animation: userslidein 3s ease infinite;
}
#user:before {
    -webkit-animation: userslidein 3s ease infinite;
    animation: userslidein 3s ease infinite;
}
@-webkit-keyframes userslidein {
    from {
        -webkit-transform: translate(10px);
        transform: translate(10px);
    }
    to {
        -webkit-transform: translate(200px);
        transform: translate(200px);
    }
}
@keyframes userslidein {
    from {
        -webkit-transform: translate(10px);
        transform: translate(10px);
    }
    to {
        -webkit-transform: translate(200px);
        transform: translate(200px);
    }
}
@media (max-width: 600px) {
    #user {
        -webkit-appearance: none;
        appearance: none;
    }
}
```

and if you wanted to append this to a style element/string

```javascript
// browser
stylis('#user', styles, document.querySelector('style'));

// or explicity request a string, 
// in node this returns the css wrapped in <style></style> tags
// and in the browser this returns a style element with the css
stylis('#user', styles, true);
```

## Supports

* Edge
* IE 9+
* Chrome
* Firefox
* Safari
* Node.js

---

# Installation

#### direct download

```html
<script src=stylis.min.js></script>
```

#### CDN


```html
<script src=https://unpkg.com/stylis@0.1.5/stylis.min.js></script>
```

#### npm

```
npm install stylis --save
```