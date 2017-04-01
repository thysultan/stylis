# STYLIS

[![stylis](https://stylis.js.org/assets/logo.svg)](https://github.com/thysultan/stylis.js)

stylis is a feature-rich css preprocessor

- ~3Kb

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
<script src=https://unpkg.com/stylis@2.0.0/stylis.min.js></script>
```

#### npm

```
npm install stylis --save
```

## Features

- web component emulation of `:host`, `:host()` and `:host-context()`
- namespacing
- inline global injection via `:global(selector)`
- block level global injection via `@global {}`
- nesting `a { &:hover {} }`
- prefixer (flex-box, etc...)
- flat css `color: red; h1 { color: red; }`
- middleware support
- keyframes and animation namespacing

---

stylis is a feature-rich css preprocessor that turns this

```javascript
stylis('#user', styles);
```

Where `styles` is the following css

```scss
// flat css
font-size: 2em;
font-family: sans-serif;

// emulation of shadow dom selectors
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
:global(h2),
h2 &
{
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

h2,
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
```

## API

```javascript
stylis(
    selector: {string},     // selector - i.e `.class` or `#id` or `[attr=id]`
    styles: {string},       // css string
    animations: {boolean=}  // false to prevent prefixing animations, true by default
    compact: {boolean=}     // enable additional features(:global, :host, :host-context)
    middleware: {function|function[]=}
);

stylis.use(middleware: {function|function[]=})
```

## Middleware

The optional middleware function accepts four arguments `ctx, str, line, column, namespace, length`, the middleware is executed at 8 stages.

1. before the compiler starts `ctx = 0`, you can use this to do any linting/transforms before compiling
2. at every selector declaration pre-processed `ctx = 1` i.e `.class` / `.foo, .bar`
3. at every selector post-processed `ctx = 1.5` i.e `.prefix.foo`
4. at every property declaration `ctx = 2` i.e `color: red;`
5. before a block of compiled css is added to the output string `ctx = 3`, i.e `.class {color:red;}`
6. before a block of flat compiled css is added to the output string `ctx = 4`, i.e `color:blue;`
8. before the compiled css output is returned `ctx = 6`
9. after every new line that does not end with a token `ctx = 7`

If at any context point the middleware returns a non-falsey value the token or block of css will be replaced with the return value. For example we can add a feature `random()` that when used prints a random number.

```javascript
stylis(``, `h1 { width: calc(random()*10); }`, false, function (ctx, str, line, column, namespace, length) {
    switch (ctx) {
        // 2: property declaration, str will be `width: calc(random()*10);`
        case 2: return str.replace(/random\(\)/g, Math.random());
    }
});
```

Will replace all instances of `random()` with a random number.

### Extending css syntax with function

As you can tell from the above middleware it is possible to extend css's syntax. In the previous example we used a function as middleware which allows for much lower level access and control but we could as well use an object of functions that define what different function in the css will generate. For example a `random()` and `darken(value)` extension can look like

```javascript
stylis(``, `
        h1 {
            width: calc(random()*10);
            color: darken(#FFF);
        }
`, false, {
    random () {
        return Math.random();
    }
    darken (value) {
        return '#000';
    }
});
```

If we had used `darken(#FFF, #CCC)` in our css the two arguments would have been passed to the darken function.

The same can be done with `stylis.use` to register middleware individually, and `stylis.plugins.length = 0` to flush all middleware.


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
        var style = document.createElement('style');
        style.textContent = stylis(namespace, self.stylesheet());
        document.head.appendChild(style);
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
