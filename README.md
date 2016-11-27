# Stylis

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