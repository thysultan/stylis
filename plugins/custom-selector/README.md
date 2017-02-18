# stylis custom selector

Allows you to create your own selectors

```css
@custom-selector :--heading h1, h2, h3, h4, h5, h6;
@custom-selector :--enter :hover, :focus, :active;

:--heading {
	color: red;
}

:--heading:--enter {
	color: blue;
}
```

[Specification](https://drafts.csswg.org/css-extensions/#custom-selectors)