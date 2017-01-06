# Stylis

[![npm](https://img.shields.io/npm/v/stylis.svg?style=flat)](https://www.npmjs.com/package/stylis) [![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/stylis.js/blob/master/LICENSE.md) [![Build Status](https://semaphoreci.com/api/v1/thysultan/stylis-js/branches/master/shields_badge.svg)](https://semaphoreci.com/thysultan/stylis-js) ![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat)

- ~2Kb minified+gzipped
- ~4kb minified

Stylis is a small css compiler that turns this

```javascript
stylis('#user', styles);
```

Where `styles` is the following css

```scss

// variables
$foo: 20px;

// flat css
font-size: 2em;
font-family: sans-serif;
width: $foo;

// emulation for shadow dom selectors
:host {
    color: red;
}

:host(.fancy) {
    color: red;
}

:host-context(body) {
    color: red;
}

// removes line comment

.name {
    transform: rotate(30deg);
}

// inject to global scope block
@global {
    body {
        background: yellow;
    }
}

// inject to global scope inline
span, h1, :global(h2) {
	color:red;

	/**
	 * removes block comments
	 */
}

// prefixing
& {
	animation: slidein 3s ease infinite;
    display: flex;
    flex: 1;
    user-select: none;
}

// namespaced animations
&:before {
	animation: slidein 3s ease infinite;	
}

// namespaced keyframes
@keyframes slidein {
	from { transform: translate(10px); }
	to { transform: translate(200px); }
}

// flat namespaced css in @media
@media (max-width: 600px) {
    display: block;

	&, h1 { 
        appearance: none; 
    }
}

// nesting
h1 {
    color: red;

    h2 {
        display: block;

        h3, &:hover {
            color: blue;
        }
    }

    font-size: 12px;
}

// static mixins
@mixin large-text {
    font-size: 20px;
}

// function mixins
@mixin linx ($link, $visit, $hover, $active) {
    a {
        color: $link;
        &:hover {
          color: $hover;   
        }
    }
}

// use static mixins
& {
    @include large-text;
}

// use function mixins
@include linx(white, blue, green, red);
```

into this (minus the whitespace)

```css
#user {
	font-size: 2em;
	font-family: sans-serif;
    width: 20px;
}
#user {
    color: red;
}
#user.fancy {
    color: red;
}
body #user {
    color: red;
}
#user .name {
    -webkit-transform: rotate(30deg);
    -ms-transform: rotate(30deg);
    transform: rotate(30deg);
}
body {
    background: yellow;
}
#user span,
#user h1,
h2 {
    color: red;
}
#user {
    display: -webkit-flex;
    display: flex;

    -webkit-flex: 1;
    -moz-flex: 1;
    flex: 1;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

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
        -ms-transform: translate(10px);
        transform: translate(10px);
    }
    to {
        -webkit-transform: translate(200px);
        -ms-transform: translate(200px);
        transform: translate(200px);
    }
}
@keyframes userslidein {
    from {
        -webkit-transform: translate(10px);
        -ms-transform: translate(10px);
        transform: translate(10px);
    }
    to {
        -webkit-transform: translate(200px);
        -ms-transform: translate(200px);
        transform: translate(200px);
    }
}
@media (max-width: 600px) {
    #user, #user h1 {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    #user {
        display: block;
    }
}

#user h1 {
    color: red;
    font-size: 12px;
}

#user h1 h2 {
    display: block;
}

#user h1 h2 h3,
#user h1 h2 h2:hover {
    color: blue;
}

#user {
    font-size: 20px;
}

a {
    color: white;
    &:hover {
      color: green;   
    }
}
```

## Supports

* Edge
* IE 9+
* Chrome
* Firefox
* Safari
* Node.js

---

## Installation

#### direct download

```html
<script src=stylis.min.js></script>
```

#### CDN


```html
<script src=https://unpkg.com/stylis@0.9.0/stylis.min.js></script>
```

#### npm

```
npm install stylis --save
```

## API

```javascript
stylis(
    selector: {string},     // selector - i.e `.class` or `#id` or `[attr=id]`
    styles: {string},       // css string
    animations: {boolean=}  // false to prevent prefixing animations, true by default
    middleware: {function=}
);
```

## Middleware

The optional middleware function accepts four arguments `ctx, str, line, column`, the middleware is executed 1. at every token `ctx = 0` and 2. before a block of compiled css is added to the output string `ctx = 1`, 3. when flat css is appened to the output bundle `ctx = 2` and 4. When an `import` statement is found `ctx = 3`.

If you wanted to you could parse import statements in the middleware and return the imported file, stylis will then insert the content of it into the css that it will parse/compile. The str value on import context is the file i.e `foo` or `foo.scss` or multiple files `foo, bar`.

If the middleware returns a non-falsey value the token or block of css will be replaced with the return value. For example we can add a feature `random()` that when used prints a random number.


```javascript
stylis(``, `width: calc(random()*10)`, false, function (ctx, str, line, column) {
    switch (ctx) {
        case 0: return str.replace(/random\(\)/g, Math.random());
    }
});
```

Will replace all instances of `random()` with a random number

## Intergration

You can use stylis to build an abstraction ontop of, for example imagine we want to build an abstract that makes the following React Component possible

```javascript
class Heading extends React.Component {
    stylesheet(){
        return `
            &{
                color: blue
            }
        `;
    }
    render() {
        return (
            React.createElement('h1', 'Hello World')
        );
    }
}
```

We could simply extend the Component class as follows

```javascript
React.Component.prototype.stylis = function (self) {
    var namespace = this.displayName;

    return function () {
        stylis(namespace, self.stylesheet(), document.head);
        mounted = true;
        this.setAttribute(namespace);
    }
}
```

Then use it in the following way

```javascript
class Heading extends React.Component {
    stylesheet(){
        return `
            &{
                color: blue
            }
        `;
    }
    render() {
        return (
            React.createElement('h1', {ref: this.stylis(self)}, 'Hello World')
        );
    }
}
```

When the first instance of the component is mounted the function assigned to the ref will get executed adding a style element with the compiled output of `stylesheet()`
where as only the namespace attribute is added to any subsequent instances.

You can of course do this another way

```javascript
class Heading extends React.Component {
    constructor (props) {
        super(props);
        // or you can even inline this
        this.style = React.createElement('style', {id: this.displayName}, this.stylesheet());
    }
    stylesheet(){
        return `
            &{
                color: blue
            }
        `;
    }
    render() {
        return (
            React.createElement('h1', null, 'Hello World', this.style)
        );
    }
}
```

One will add it to the head another will render it in place with the component.

If you want a better picture into what can be done, there is an abstraction i created
for [dio.js](https://github.com/thysultan/dio.js) that does away with the above boilerplate entirely [http://jsbin.com/mozefe/1/edit?js,output](http://jsbin.com/mozefe/1/edit?js,output)