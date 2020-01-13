import {compile, serialize} from "../index.js"

const stylis = string => serialize(compile(`.user{${string}}`))

describe('Parser', () => {
  test('calc', () => {
    expect(
      stylis(`
        height:calc( 100vh - 1px );
        height:calc(
      100vh -
          1px
        );
     `)
    ).to.equal(`.user{height:calc( 100vh - 1px );height:calc(\n      100vh -\n          1px\n        );}`)
  })

  test('at-rules', () => {
    expect(
      stylis(`
        @page {
          size:A4 landscape;
        }
        @document url(://www.w3.org/),url-prefix(//www.w3.org/),domain(mozilla.org),regexp("https:.*") {
          body {
            color: red;
          }
        }
        @viewport {
          min-width:640px;
          max-width:800px;
        }
        @counter-style list {
          system:fixed;
          symbols:url();
          suffix:" ";
        }
        @-moz-document url-prefix() {
          .selector {
            color:lime;
          }
        }
        @page {
          color:red;
          @bottom-right {
            content: counter(pages);
            margin-right: 1cm;
          }
          width: none;
        }
      `)
    ).to.equal([
      `@page{size:A4 landscape;}`,
      `@document url(://www.w3.org/),url-prefix(//www.w3.org/),domain(mozilla.org),regexp("https:.*"){.user body{color:red;}}`,
      `@viewport{min-width:640px;max-width:800px;}`,
      `@counter-style list{system:fixed;symbols:url();suffix:" ";}`,
      `@-moz-document url-prefix(){.user .selector{color:lime;}}`,
      `@page{color:red;@bottom-right{content:counter(pages);margin-right:1cm;}width:none;}`
    ].join(''))
  })

  test('universal selector', () => {
    expect(
      stylis(`
        * {
          color:red;
        }
      `)
    ).to.equal(`.user *{color:red;}`)
  })

  test('flat', () => {
    expect(
      stylis(`
        color:20px;
        font-size:20px
      `)
    ).to.equal(`.user{color:20px;font-size:20px;}`)
  })

  test('namespace', () => {
    expect(
      stylis(`
        & {
          color:red;
        }
     `)
    ).to.equal(`.user{color:red;}`)
  })

  test('& in a string', () => {
    expect(
      stylis(`
        & [href="https://css-tricks.com?a=1&b=2"] {
          color:red;
        }
     `)
    ).to.equal(`.user [href="https://css-tricks.com?a=1&b=2"]{color:red;}`)
  })

  test('comments', () => {
    expect(
      stylis(`
        // line comment
        // color: red;
        /**
         * removes block comments and line comments,
         * there's a fire in the house // there is
         */
        button /*
          // what's
          xxx
          */
        {color: blue;}
        // hello
        button /* 1 */
        {
          color: red; /* 2 */
        }
        /*! 1 */
        color: red;
        /*! 2 */
        h1 {
          /*! 1 */
          color: red;
          /*! 2 */
          color: red;
          /*! 3 */
        }
      `)
    ).to.equal([
      `.user{color:red;}`,
      `.user button{color:blue;}.user button{color:red;}`,
      `.user h1{color:red;color:red;}`
    ].join(''));
  })

  test('&', () => {
    expect(
      stylis(`
        & {
          color:blue;
        }
        &&& {
          color:red;
        }
        & + & {
          color:red;
        }
        .wrapper button& {
          color:red;
        }
        &:hover & {
          color: green;
        }
        div:hover & {
          color: green;
        }
        div:hover & {
          h1 & {
            color:red;
          }
        }
      `)
    ).to.equal([
      `.user{color:blue;}`,
      `.user.user.user{color:red;}`,
      `.user+.user{color:red;}`,
      `.wrapper button.user{color:red;}`,
      `.user:hover .user{color:green;}`,
      `div:hover .user{color:green;}`,
      `h1 div:hover .user{color:red;}`
    ].join(''))
  })

  test('&:before', () => {
    expect(
      stylis(`
        &:before{
          color:blue;
        }
      `)
    ).to.equal(`.user:before{color:blue;}`)
  })

  test('@import', () => {
    expect(stylis(`@import url('http://example.com');`)).to.equal(`@import url('http://example.com');`)
  })

  test('@supports', () => {
    expect(
      stylis(`
        @supports (display:block) {
          color:red;
          h1 {
            color:red;
            h2 {
              color:blue;
            }
          }
          display:none;
        }
        @supports (appearance: none) {
          color:red;
        }
        @supports (backdrop-filter: blur(10px)) {
          backdrop-filter: blur(10px);
        }
     `)
    ).to.equal([
      '@supports (display:block){.user{color:red;display:none;}.user h1{color:red;}.user h1 h2{color:blue;}}',
      '@supports (appearance: none){.user{color:red;}}',
      '@supports (backdrop-filter: blur(10px)){.user{backdrop-filter:blur(10px);}}'
    ].join(''))
  })

  test('@media', () => {
    expect(
      stylis(`
        @media (max-width:600px) {
          color:red;
          h1 {
            color:red;
            h2 {
              color:blue;
            }
          }
          display:none;
        }
        @media (min-width:576px) {
          &.card-deck {
            .card {
              &:not(:first-child) {
                margin-left:15px;
              }
              &:not(:last-child) {
                margin-right:15px;
              }
            }
          }
        }
        @supports (display:block) {
          @media (min-width:10px) {
            background-color:seagreen;
          }
        }
        @media (max-width:600px) {
          & { color:red }
        }
        &:hover {
          color:orange
        }
     `)
    ).to.equal([
      '@media (max-width:600px){.user{color:red;display:none;}.user h1{color:red;}.user h1 h2{color:blue;}}',
      '@media (min-width:576px){.user.card-deck .card:not(:first-child){margin-left:15px;}.user.card-deck .card:not(:last-child){margin-right:15px;}}',
      '@supports (display:block){@media (min-width:10px){.user{background-color:seagreen;}}}',
      '@media (max-width:600px){.user{color:red;}}.user:hover{color:orange;}'
    ].join(''))
  })

  test('@media specifity', () => {
    expect(
      stylis(`
        > #box-not-working {
          background:red;
          padding-left:8px;
          width:10px;
          @media only screen and (min-width:10px) {
            width: calc(10px + 90px * (100vw - 10px) / 90);
          }
          @media only screen and (min-width:90px) {
            width: 90px;
          }
          height: 10px;
          @media only screen and (min-width:10px) {
            height: calc(10px + 90px * (100vw - 10px) / 90);
          }
          @media only screen and (min-width:90px) {
            height: 90px;
          }
         }
      `)
    ).to.equal([
      '.user >#box-not-working{background:red;padding-left:8px;width:10px;height:10px;}',
      '@media only screen and (min-width:10px){.user >#box-not-working{width:calc(10px + 90px * (100vw - 10px) / 90);}}',
      '@media only screen and (min-width:90px){.user >#box-not-working{width:90px;}}',
      '@media only screen and (min-width:10px){.user >#box-not-working{height:calc(10px + 90px * (100vw - 10px) / 90);}}',
      '@media only screen and (min-width:90px){.user >#box-not-working{height:90px;}}'
    ].join(''))
  })

  test('@font-face', () => {
    expect(
      stylis(`
        @font-face {
          font-family:Pangolin;
          src:url('Pangolin-Regular.ttf') format('truetype');
        }
      `)
    ).to.equal(
      `@font-face{font-family:Pangolin;src:url('Pangolin-Regular.ttf') format('truetype');}`
    )
  })

  test('multiple selectors', () => {
    expect(
      stylis(`
        span, h1 {
          color:red;
        }
        h1, &:after, &:before {
          color:red;
        }
     `)
    ).to.equal([
      `.user span,.user h1{color:red;}`,
      `.user h1,.user:after,.user:before{color:red;}`
   ].join(''))
  })

  test('[title="a,b"] and :matches(a,b)', () => {
    expect(
      stylis(`
        .test:matches(a,b,c), .test {
          color:blue;
        }
        .test[title=","] {
          color:red;
        }
        [title="a,b,c, something"], h1, [title="a,b,c"] {
          color:red
        }
        [title="a"],
        [title="b"] {
          color:red;
        }
      `)
    ).to.equal([
      `.user .test:matches(a,b,c),.user .test{color:blue;}`,
      `.user .test[title=","]{color:red;}`,
      `.user [title="a,b,c, something"],.user h1,.user [title="a,b,c"]{color:red;}`,
      `.user [title="a"],.user [title="b"]{color:red;}`
    ].join(''))
  })

  test('quotes', () => {
   expect(stylis(`
      .foo:before {
        content:".hello {world}";
        content:".hello {world} ' ";
        content:'.hello {world} " ';
      }
     `)).to.equal(`.user .foo:before{content:".hello {world}";content:".hello {world} ' ";content:'.hello {world} " ';}`)
  })

  test('remove empty css', () => {
    expect(
      stylis(`& {   }`)
    ).to.equal(``)
  })

  test('urls', () => {
    expect(
      stylis(`
        background:url(http://url.com/});
        background:url(http://url.com//1234) '('; // sdsd
        background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAABCAIAAADsEU8HAAAACXBIW` +
          `XMAAAsTAAALEwEAmpwYAAAAIklEQVQI12P8//8/Aw4wbdq0rKysAZG1trbGJXv06FH8sgDIJBbBfp+hFAAAAABJRU5ErkJggg==");`
      )
    ).to.equal([
      `.user{background:url(http://url.com/});`,
      `background:url(http://url.com//1234) '(';`,
      `background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAABCAIAAADsEU8HAAAACXBIW`,
      `XMAAAsTAAALEwEAmpwYAAAAIklEQVQI12P8//8/Aw4wbdq0rKysAZG1trbGJXv06FH8sgDIJBbBfp+hFAAAAABJRU5ErkJggg==");}`
    ].join(''))
  })

  test('last semicolon omission', () => {
    expect(
      stylis(`
        .content {
          color:red
        }
        .content {
          color:blue
        }
      `)
    ).to.equal(
      [`.user .content{color:red;}`, `.user .content{color:blue;}`].join('')
    )
  })

  test(':matches(:not())', () => {
    expect(
      stylis(`
        h1:matches(.a,.b,:not(.c)) {
          display: none
        }
      `)
    ).to.equal(`.user h1:matches(.a,.b,:not(.c)){display:none;}`)
  })

  test('edge cases', () => {
    expect(
      stylis(`
        @media (min-width:537px) {
          border-bottom:4px solid red;
        }
        &::placeholder {
          color:pink;
        }
        .a {color:'red'}
        .b {color:"red"}
        .a {color:red;}[role=button]{color:red;}
        .b {padding:30 3}
        .c {v-text-anchor: middle;}
      `)
    ).to.equal([
      `@media (min-width:537px){.user{border-bottom:4px solid red;}}`,
      `.user::placeholder{color:pink;}`,
      `.user .a{color:'red';}`,
      `.user .b{color:"red";}`,
      `.user .a{color:red;}`,
      `.user [role=button]{color:red;}`,
      `.user .b{padding:30 3;}`,
      `.user .c{v-text-anchor:middle;}`
    ].join(''))
  })

  test('whitespace', () => {
    expect(
      stylis(`
        div {
          ${'width:0;    '}
        }
      `)
    ).to.equal(`.user div{width:0;}`)
  })

  test('no trailing semi-colons', () => {
   expect(stylis(`
      h2 {
        display:none
      }
      div:hover
        {
        color:red
      }
     `)).to.equal([
       '.user h2{display:none;}',
       '.user div:hover{color:red;}'
   ].join(''))
  })

  test('multiline declaration', () => {
   expect(stylis(`
      html {
        background:
          linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
          url(/static/background.svg);
      }
     `)).to.equal(`.user html{background:linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),url(/static/background.svg);}`)
  })

  test('nesting selector multiple levels', () => {
    expect(
      stylis(`
        a {
          a {
            a {
              a {
                a {
                  a {
                    a {
                      a {
                        a {
                          a {
                            a {
                              a {
                                color:red;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `)
    ).to.equal(`.user a a a a a a a a a a a a{color:red;}`)
  })

  test('nesting @media multiple levels', () => {
    expect(
      stylis(`
        div {
          @media {
            a {
              color:red;

        @media {
                h1 {
                  color:hotpink;
                }
              }
            }
          }
        }
      `)
    ).to.equal([`@media{.user div a{color:red;}`, `@media{.user div a h1{color:hotpink;}}}`].join(''))
  })

  test('noop tail I', () => {
    expect(stylis(`color:red/**/`)).to.equal(`.user{color:red;}`)
  })

  test('noop tail II', () => {
   expect(stylis(`color:red//`,)).to.equal('.user{color:red;}')
  })

  test('noop tail III', () => {
    expect(stylis(`color:red[]`)).to.equal(`.user{color:red[];}`)
  })

  test('noop tail IV', () => {
    expect(stylis(`color:red()`)).to.equal(`.user{color:red();}`)
  })

  test('noop tail V', () => {
    expect(stylis(`color:red''`)).to.equal(`.user{color:red'';}`)
  })

  test('noop tail VI', () => {
    expect(stylis(`color:red""`)).to.equal(`.user{color:red"";}`)
  })

  test('noop tail VII', () => {
    expect(stylis(`h1{color:red/**}`)).to.equal(`.user h1{color:red;}`)
  })

  test('comments(context character I)', () => {
    expect(stylis(`.a{color:red;/* } */}`)).to.equal(`.user .a{color:red;}`)
  })

  test('comments(context character II)', () => {
    expect(stylis(`.a{color:red;/*}*/}`)).to.equal(`.user .a{color:red;}`)
  })

  test('comments(context character III)', () => {
    expect(stylis(`.a{color:red;/*{*/}`)).to.equal(`.user .a{color:red;}`)
  })

  test('comments(context character IV)', () => {
    expect(stylis(`.a{/**/color:red}`)).to.equal(`.user .a{color:red;}`)
  })

  test('comments(context character V)', () => {
    expect(stylis(`.a{color:red;/*//color:blue;*/}`)).to.equal(`.user .a{color:red;}`)
  })

  test('comments(context character VI)', () => {
    expect(
      stylis(
        `background: url("img}.png");.a {background: url("img}.png");}`
      )
    ).to.equal([
      `.user{background:url("img}.png");}`,
      `.user .a{background:url("img}.png");}`
    ].join(''))
  })

  test('comments(context character VII)', () => {
    expect(
      stylis(`background: url(img}.png);.a {background: url(img}.png);}`)
    ).to.equal([
      `.user{background:url(img}.png);}`,
      `.user .a{background:url(img}.png);}`
    ].join(''))
  })

  test('comments(context character VIII)', () => {
    expect(
      stylis(`background: url[img}.png];.a {background: url[img}.png];}`)
    ).to.equal([
      `.user{background:url[img}.png];}`,
      `.user .a{background:url[img}.png];}`
    ].join(''))
  })

  test('comments in rules not increasing depth of consecutive rules (#154)', () => {
    expect(
      stylis(`
        font-size:2rem;
        .one{color:black;/* foo */}
        .two{color:black;/* bar */}
        .three{color:black;/* baz */}
      `)
    ).to.equal([
      '.user{font-size:2rem;}',
      '.user .one{color:black;}',
      '.user .two{color:black;}',
      '.user .three{color:black;}'
    ].join(''))
  })

  test('comment in a group of selectors inside a media query (#152)', () => {
    expect(
      stylis(`
        @media (min-width: 400px) {
          div /* comment */ {
            border-left:1px solid hotpink;
          }
          span {
            border-top:none;
          }
        }
      `)
    ).to.equal(`@media (min-width: 400px){.user div{border-left:1px solid hotpink;}.user span{border-top:none;}}`)
  })

  test('parenthesis in string literal I (#151)', () => {
   expect(
    stylis(`
      @media only screen and (max-width: 320px){
        background: url("${'image_(1).jpg'}");
      }

      @media only screen and (min-width:321px) {
        background: url("${'image_(1).jpg'}");
      }
    `)
   ).to.equal([
     `@media only screen and (max-width: 320px){.user{background:url("${'image_(1).jpg'}");}}`,
     `@media only screen and (min-width:321px){.user{background:url("${'image_(1).jpg'}");}}`
   ].join(''))
  })

  test('parenthesis in string literal II (#123)', () => {
    expect(
      stylis(`
        .a {
          background: url("${'image_(1).jpg'})");
        }

        .b {
          background: url("abc");
        }
      `)
    ).to.equal([
      `.user .a{background:url("image_(1).jpg)");}`,
      `.user .b{background:url("abc");}`
    ].join(''))
  })

  test('parenthesis in string literal III (#128)', () => {
    expect(
      stylis(`
        .icon {
          background:url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='12' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.117.323L8.044 6.398 2.595.323a1.105 1.105 0 0 0-1.562 1.562L6.482 7.96.323 14.119a1.105 1.105 0 0 0 1.562 1.562L7.96 9.608l5.449 6.073a1.103 1.103 0 1 0 1.56-1.562L9.517 8.046l6.159-6.161a1.103 1.103 0 1 0-1.56-1.562z' fill='rgba(85, 85, 85, 0.5)'/%3E%3C/svg%3E");
        }

        div {
          background: cyan;
      }
    `)
    ).to.equal([
      `.user .icon{background:url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='12' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.117.323L8.044 6.398 2.595.323a1.105 1.105 0 0 0-1.562 1.562L6.482 7.96.323 14.119a1.105 1.105 0 0 0 1.562 1.562L7.96 9.608l5.449 6.073a1.103 1.103 0 1 0 1.56-1.562L9.517 8.046l6.159-6.161a1.103 1.103 0 1 0-1.56-1.562z' fill='rgba(85, 85, 85, 0.5)'/%3E%3C/svg%3E");}`,
      `.user div{background:cyan;}`
    ].join(''))
  })

  test('parenthesis in string literal IV (#116)', () => {
    expect(
      stylis(`
        .a .b .c {
          width: calc(100% / "func()");
        }

        .d {
          background: yellow;
      }
      `)
    ).to.equal([
      `.user .a .b .c{width:calc(100% / "func()");}`,
      `.user .d{background:yellow;}`
    ].join(''))
  })

  test('nested parenthesis', () => {
    expect(stylis(`width: calc(calc(1) + 10);`)).to.equal(`.user{width:calc(calc(1) + 10);}`)
  })

  test('css variables edge cases', () => {
    expect(
      stylis(`
     --cdo-at-top-level: <!--;
     --cdc-at-top-level: -->;
     --semicolon-not-top-level: (;);
     --cdo-not-top-level: (<!--);
     --cdc-not-top-level: (-->);
   `)
    ).to.equal(`.user{` + [
      `--cdo-at-top-level:<!--;`,
      `--cdc-at-top-level:-->;`,
      `--semicolon-not-top-level:(;);`,
      `--cdo-not-top-level:(<!--);`,
      `--cdc-not-top-level:(-->);`
    ].join('') +'}')
  })

  test('does not hang on unterminated block comment (#129)', () => {
    expect(stylis(`/*`)).to.equal(``)
  })

  test('handles single `/` in a value', () => {
    expect(stylis(`font: 12px/14px serif;`)).to.equal(`.user{font:12px/14px serif;}`)
  })

  test('nested', () => {
    expect(stylis(`
      div {
        h2 {
          color:red;
          h3 {
            color:blue;
          }
        }
      }

      .foo & {
          width:1px;
          &:hover {
            color:black;
          }
          li {
            color:white;
          }
      }

      h1, div {
        color:red;
        h2,
        &:before {
          color:red;
        }
        color:blue;
        header {
          font-size:12px;
        }
        @media {
          color:red;
        }
        @media {
          color:blue;
        }
      }

      &.foo {
        &.bar {
          color:orange
        }
      }

      &.foo {
        &.bar {
          &.barbar {
            color:orange
          }
        }
      }
    `)).to.equal([
      `.user div h2{color:red;}`+
      `.user div h2 h3{color:blue;}`+
      `.foo .user{width:1px;}`+
      `.foo .user:hover{color:black;}`+
      `.foo .user li{color:white;}`+
      `.user h1,.user div{color:red;color:blue;}`+
      `.user h1 h2,.user div h2,.user h1:before,.user div:before{color:red;}`+
      `.user h1 header,.user div header{font-size:12px;}`+
      `@media{.user h1,.user div{color:red;}}`+
      `@media{.user h1,.user div{color:blue;}}`+
      `.user.foo.bar{color:orange;}`+
      `.user.foo.bar.barbar{color:orange;}`
    ].join(''))
  })
})
