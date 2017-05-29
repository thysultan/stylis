## Benchmark

Using [https://github.com/postcss/benchmark](https://github.com/postcss/benchmark)

Parsers

```
Rework x 12.80 ops/sec ±4.42% (36 runs sampled)
PostCSS x 21.11 ops/sec ±8.46% (57 runs sampled)
PostCSS Full x 8.15 ops/sec ±7.79% (45 runs sampled)
CSSOM x 19.20 ops/sec ±6.53% (36 runs sampled)
Mensch x 17.85 ops/sec ±13.39% (37 runs sampled)
Gonzales x 5.21 ops/sec ±7.75% (18 runs sampled)
Gonzales PE x 3.99 ops/sec ±10.37% (15 runs sampled)
CSSTree x 39.73 ops/sec ±9.18% (56 runs sampled)
ParserLib x 1.79 ops/sec ±8.58% (9 runs sampled)
Stylecow x 3.97 ops/sec ±9.48% (15 runs sampled)
Stylis x 54.28 ops/sec ±4.45% (58 runs sampled)

Fastest test is Stylis at 1.37x faster than CSSTree
```

---

Preprocessors

```
libsass x 6.83 ops/sec ±2.29% (22 runs sampled)
Rework x 10.65 ops/sec ±3.86% (55 runs sampled)
PostCSS x 16.23 ops/sec ±11.21% (47 runs sampled)
Stylecow x 2.15 ops/sec ±6.36% (15 runs sampled)
Stylus x 3.67 ops/sec ±28.12% (25 runs sampled)
Less x 4.75 ops/sec ±9.14% (29 runs sampled)
Ruby Sass x 0.31 ops/sec ±8.12% (6 runs sampled)
Stylis x 26.26 ops/sec ±5.95% (49 runs sampled)

Fastest test is Stylis at 1.62x faster than PostCSS
```

---

Prefixers

```
Autoprefixer x 13.32 ops/sec ±6.51% (67 runs sampled)
Stylecow x 2.28 ops/sec ±5.97% (16 runs sampled)
nib x 1.79 ops/sec ±25.32% (15 runs sampled)
Compass x 0.15 ops/sec ±9.34% (5 runs sampled)
Stylis x 45.52 ops/sec ±14.61% (77 runs sampled)

Fastest test is Stylis at 3.4x faster than Autoprefixer
```

