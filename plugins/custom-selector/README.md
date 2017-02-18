# custom selector

Allows you to create your own selectors

```css
@custom-selector :--heading h1, h2, h3, h4, h5, h6;

:--heading { /* styles for all headings */ }
:--heading + p { /* more styles */ }
/* etc */
```

[Specification](https://drafts.csswg.org/css-extensions/#custom-selectors)