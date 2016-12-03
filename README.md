# Stylis

[![npm](https://img.shields.io/npm/v/stylis.svg?style=flat)](https://www.npmjs.com/package/stylis) [![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)](https://github.com/thysultan/stylis.js/blob/master/LICENSE.md) 
 ![dependencies](https://img.shields.io/badge/dependencies-none-green.svg?style=flat)

- ~1kb minified+gzipped
- ~2kb minified

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
    display: flex;
    flex: 1;
    user-select: none;
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
    -moz-transform: rotate(30deg);
    transform: rotate(30deg);
}
#user span,
#user h1 {
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
    -moz-animation: userslidein 3s ease infinite;
    animation: userslidein 3s ease infinite;
}
#user:before {
    -webkit-animation: userslidein 3s ease infinite;
    -moz-animation: userslidein 3s ease infinite;
    animation: userslidein 3s ease infinite;
}
@-webkit-keyframes userslidein {
    from {
        -webkit-transform: translate(10px);
        -moz-transform: translate(10px);
        transform: translate(10px);
    }
    to {
        -webkit-transform: translate(200px);
        -moz-transform: translate(200px);
        transform: translate(200px);
    }
}
@-moz-keyframes userslidein {
    from {
        -webkit-transform: translate(10px);
        -moz-transform: translate(10px);
        transform: translate(10px);
    }
    to {
        -webkit-transform: translate(200px);
        -moz-transform: translate(200px);
        transform: translate(200px);
    }
}
@keyframes userslidein {
    from {
        -webkit-transform: translate(10px);
        -moz-transform: translate(10px);
        transform: translate(10px);
    }
    to {
        -webkit-transform: translate(200px);
        -moz-transform: translate(200px);
        transform: translate(200px);
    }
}
@media (max-width: 600px) {
    #user {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }
}
```

and if you wanted to append this to a style element/string

```javascript
// browser, if the element passed is a style element the css will
// be append to it, if it is another element a style element with the
// css will be appended to it, thus this adds css to the already
// present style element
stylis('#user', styles, document.querySelector('style'));

// and this appends a style element to the head
stylis('#user', styles, document.head);

// or explicity request a string, 
// in node this returns the css wrapped in <style id=stylis-${namespace}></style> tags
// and in the browser this returns a style element with the css
stylis('#user', styles, true);

// you can also pass a function
stylis('#user', styles (type, props, children) => {});
// where the arguments passed are 
{
    type:   {string} 'style';
    props:  {Object} {id: 'stylis-${namespace}'};
    output: {string} '...compiled css';
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
<script src=https://unpkg.com/stylis@0.5.0/stylis.min.js></script>
```

#### npm

```
npm install stylis --save
```

## API

```javascript
stylis(
    selector: {string}, 
    cssString: {string}, 
    element: {(function|boolean|Node)},
    namespaceAnimations, {boolean}
    namespaceKeyframes {boolean}
);

// if element is a function the arguments passed are ('style', stylis-${namespace}, output)
// if it a style element the output is appended to it
// if it is any other element a style element is appended to it

// you can also directly access the low level compiler
stylis.compiler(
    selector,
    cssString, 
    namespaceAnimations, {boolean}
    namespaceKeyframes {boolean}
);

// that can be used as follows
stylis.compiler('.class1', 'css string...', true, true);

// or 
stylis.compiler('[data-scope=namespace]', 'css string...', true, true);

// explicity setting namespaceAnimations or namespaceKeyframes to false 
// will prevent namespacing to keyframes/animations
```

## Intergration

Stylis can be used to build an abstraction ontop of it, for example imagine we want to build an abstract that makes the following React Component possible

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
React.Component.prototype.stylis = function () {
    var ctx = this;
    var namespace = this.displayName;

    return function () {
        this.setAttribute(namespace);
        stylis(namespace, ctx.stylesheet(), document.head);
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
            React.createElement('h1', {ref: this.stylis}, 'Hello World')
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
        this.style = stylis(this.displayName, this.stylesheet(), React.createElement);

        // this.style will be the return value of 
        // React.createElement('style', {id: 'stylis-Heading'}, this.stylesheet())
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

Both will add the resulting style element generated only once, one will
add it to the head another will render it in place with the component.

If you want a picture into what can be done, there is an abstraction i created
for [dio.js](https://github.com/thysultan/dio.js) that does away with the above boilerplate entirely [http://jsbin.com/mozefe/1/edit?js,output](http://jsbin.com/mozefe/1/edit?js,output)