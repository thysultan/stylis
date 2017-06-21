# atomics

stylis plugin to create atomic css by taking an input such as

```css
a {
	color:red;
}

b {
	color:red;
	display:block;
}

c {
	color:red;
	display: block;
}

d {
	color:red;
	display:block;
}
```

and converting it to

```css
a,b,c,d{color:red}b,c,d{display:block}
```

since properties are shared between rules atomicly
the compression scales with the number of unique properties used.
