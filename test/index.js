import {compile, serialize} from "../index.js"

const stylis = string => serialize(compile(`.user{${string}}`))

describe('PLACEHOLDER', () => {
  // TODO:
  // - test vendor prefixing:
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L553
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L700
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L728
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L778
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L810
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L835
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L876
  //    - https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L953
  // - what about "animations disabled namespace" test? https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L1065
  // - what about "keyframes disabled namespace" test? https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L1095
  // - add "nested" test, but remove `:global()` from it https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/tests/spec.js#L1115
  // - add prefixer API and accompanying tests

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

  // TODO: declarations in at-rule are not grouped in a rule
  // TODO: original output was also auto-prefixed
  // test('@supports', () => {
  //  expect(stylis(`
  //      @supports (display:block) {
  //        color:red;
  //        h1 {
  //          color:red;
  //          h2 {
  //            color:blue;
  //          }
  //        }
  //        display:none;
  //      }
  //      @supports (appearance: none) {
  //        color:red;
  //      }
  //      @supports (backdrop-filter: blur(10px)) {
  //        backdrop-filter: blur(10px);
  //      }
  //    `)).to.equal([
  //      '@supports (display:block){.user{color:red;display:none;}.user h1{color:red;}.user h1 h2{color:blue;}}',
  //      '@supports (appearance:none){.user{color:red;}}',
  //      '@supports (backdrop-filter:blur(10px)){.user{backdrop-filter:blur(10px);}}'
  //    ].join(''))
  // })

  // TODO: declarations in at-rule are not grouped in a rule
  // test('@media', () => {
  //  expect(stylis(`
  //      @media (max-width:600px) {
  //        color:red;
  //        h1 {
  //          color:red;
  //          h2 {
  //            color:blue;
  //          }
  //        }
  //        display:none;
  //      }
  //      @media (min-width:576px) {
  //        &.card-deck {
  //          .card {
  //            &:not(:first-child) {
  //                margin-left:15px;
  //            }
  //            &:not(:last-child) {
  //                margin-right:15px;
  //            }
  //          }
  //        }
  //      }
  //      @supports (display:block) {
  //        @media (min-width:10px) {
  //          background-color:seagreen;
  //        }
  //      }
  //      @media (max-width:600px) {
  //        & { color:red }
  //      }
  //      &:hover {
  //        color:orange
  //      }
  //    `)).to.equal([
  //      '@media (max-width:600px){.user{color:red;display:none;}.user h1{color:red;}.user h1 h2{color:blue;}}',
  //      '@media (min-width:576px){.user.card-deck .card:not(:first-child){margin-left:15px;}.user.card-deck .card:not(:last-child){margin-right:15px;}}',
  //      '@supports (display:block){@media (min-width:10px){.user{background-color:seagreen;}}}',
  //      '@media (max-width:600px){.user{color:red;}}.user:hover{color:orange;}'
  //    ])
  // })

  // TODO: previously there was a generated whitespace after >
  // TODO: height in the middle of those rules doesn't get grouped with other declaratations
  // TODO: also some other things wrong with the stringified output here, need further investigation when previous points get fixed
  // test('@media specifity', () => {
  //  expect(stylis(`
  //    > #box-not-working {
  //      background:red;
  //      padding-left:8px;
  //      width:10px;
  //      @media only screen and (min-width:10px) {
  //        width:calc(
  //          10px + 90px *
  //          (100vw - 10px) / 90
  //        );
  //      }
  //      @media only screen and (min-width:90px) {
  //        width:90px;
  //      }
  //      height: 10px;
  //      @media only screen and (min-width:10px) {
  //        height:calc(
  //          10px + 90px *
  //          (100vw - 10px) / 90
  //        );
  //      }
  //      @media only screen and (min-width:90px) {
  //        height: 90px;
  //      }
  //    }`)).to.equal([
  //      '.user > #box-not-working{background:red;padding-left:8px;width:10px;height:10px;}',
  //      '@media only screen and (min-width:10px){.user > #box-not-working{width:calc( 10px + 90px * (100vw - 10px) / 90 );}}',
  //      '@media only screen and (min-width:90px){.user > #box-not-working{width:90px;}}',
  //      '@media only screen and (min-width:10px){.user > #box-not-working{height:calc( 10px + 90px * (100vw - 10px) / 90 );}}',
  //      '@media only screen and (min-width:90px){.user > #box-not-working{height:90px;}}'
  //    ].join(''))
  // })

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

  // TODO: doesn't work because compile doesn't replace & correctly
  // test('multiple selectors', () => {
  //  expect(stylis(`
  //      span, h1 {
  //        color:red;
  //      }
  //      h1, &:after, &:before {
  //        color:red;
  //      }
  //    `)).to.equal([
  //      `.user span,.user h1{color:red;}`,
  //      `.user h1,.user:after,.user:before{color:red;}`
  //  ].join(''))
  // })

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

  // TODO doesn't work - seems like ' in "" breaks stuff
  // test('quotes', () => {
  //  expect(stylis(`
  //      .foo:before {
  //          content:".hello {world}";
  //          content:".hello {world} ' ";
  //          content:'.hello {world} " ';
  //      }
  //    `)).to.equal(`.user .foo:before{content:".hello {world}";content:".hello {world} ' ";content:'.hello {world} " ';}`)
  // })

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

  // TODO: original output was prefixed
  // TODO: some replacements were allowed previously and it doesn't work right now - "animation: _name_ -name %name 1name __name;"
  // test('animations", () => {
  //      /*
  //      this also tests the parses ability to find and namespace
  //      the animation-name in a grouped animation: property
  //    */
  //  expect(stylis(`
  //      h2 {
  //        animation: initial inherit unset --invalid;
  //      }
  //      span {
  //        animation: _name_ -name %name 1name __name;
  //      }
  //      div {
  //        animation-name: bounce
  //      }
  //      h1 {
  //        animation:` +
  //        `
  //        0.6s
  //        .6ms
  //        200ms
  //        infinite
  //        something-ease
  //        infinite-fire
  //        slidein
  //        cubic-bezier()
  //        cubic-bezier(1,2,4)
  //        ease-in-out
  //        ease
  //        ease-inOuter
  //        linear
  //        alternate
  //        normal
  //        forwards
  //        both
  //        none
  //        ease-in
  //        ease-out
  //        backwards
  //        running
  //        paused
  //        reverse
  //        alternate-reverse
  //        step-start
  //        step-end
  //        step-end-something
  //        steps(4,end)
  //        `.replace(/\n|\r| +/g, ' ') +
  //        `;
  //      }
  //      span {
  //        animation-duration: 0.6s;
  //        animation-name: slidein;
  //        animation-iteration-count: infinite;
  //        animation-timing-function: cubic-bezier(0.1,0.7,1.0,0.1);
  //      }
  //      input {
  //        animation-name: anim1, anim2;
  //        animation-name: none;
  //      }
  //    `)).to.equal([
  //      '.user h2{animation:initial inherit unset --invalid;}',
  //      '.user span{animation:_name_-user -name-user %name 1name __name-user;}',
  //      '.user div{animation-name:bounce-user;}',
  //      '.user h1{animation:0.6s .6ms 200ms infinite something-ease-user infinite-fire-user slidein-user cubic-bezier() cubic-bezier(1,2,4) ease-in-out ease ease-inOuter-user linear alternate normal forwards both none ease-in ease-out backwards running paused reverse alternate-reverse step-start step-end step-end-something-user steps(4,end);}',
  //      '.user span{animation-duration:0.6s;animation-name:slidein-user;animation-iteration-count:infinite;animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);}',
  //      '.user input{animation-name:anim1-user,anim2-user;animation-name:none;}'
  //  ].join(''))
  // })

  // TODO: original output was prefixed
  // TODO: keyframes are not being namespaced correctly right now
  // TODO: doesn't work because compile doesn't replace & correctly
  // test('keyframes", () => {
  //  expect(stylis(`
  //      &{
  //        animation:slidein 3s ease infinite;
  //      }
  //      @keyframes slidein {
  //        to { transform:translate(20px); }
  //      }
  //    `)).to.equal([
  //      '.user{animation:slidein-user 3s ease infinite;}',
  //      '@keyframes slidein-user{to{transform:translate(20px);}}'
  //  ].join(''))
  // })

  // TODO: original output was prefixed
  // TODO: keyframes are not being namespaced correctly now right now
  // test('class namespace", () => {
  //  expect(stylis(' .foo', `h1 {animation:slide 1s;}`)).to.equal(`.foo h1{animation:slide-foo 1s;}`)
  // })

  // TODO: original output was prefixed
  // TODO: keyframes are not being namespaced correctly now right now
  // test('class namespace", () => {
  //  expect(stylis('#foo', `h1 {animation:slide 1s;}`)).to.equal(`#foo h1{animation:slide-foo 1s;}`)
  // })

  // TODO: original output was prefixed
  // TODO: keyframes are not being namespaced correctly now right now
  // test('attribute namespace", () => {
  //  expect(stylis('[title=foo]', `h1 {animation:slide 1s;}`)).to.equal(`[title=foo] h1{animation:slidetitlefoo 1s;}`)
  // })

  // TODO: original output was prefixed
  // test('empty namespace', () => {
  //   expect(
  //     stylis(
  //       '',
  //       `
  //         h1 {
  //           animation:slide 1s; }

  //           @keyframes name {
  //             0: {
  //               top:0
  //             }
  //           }
  //     `
  //     )
  //   ).to.equal([`h1{animation:slide 1s;}`, `@keyframes name{0:{top:0;}}`].join(''))
  // })

  // TODO: original output was prefixed
  // TODO: declarations in at-rule are not grouped in a rule
  // test('edge cases", () => {
  //  expect(stylis(`
  //        @media (min-width:537px) {
  //          border-bottom:4px solid red;
  //        }
  //        &::placeholder {
  //          color:pink;
  //        }
  //        .a {color:'red'}
  //        .b {color:"red"}
  //        .a {color:red;}[role=button]{color:red;}
  //        .b {padding:30 3}
  //        .c {v-text-anchor: middle;}
  //     `)).to.equal([
  //      `@media (min-width:537px){.user{border-bottom:4px solid red;}}`,
  //      `.user::placeholder{color:pink;}`,
  //      `.user .a{color:'red';}`,
  //      `.user .b{color:"red";}`,
  //      `.user .a{color:red;}`,
  //      `.user [role=button]{color:red;}`,
  //      `.user .b{padding:30 3;}`,
  //      `.user .c{v-text-anchor:middle;}`
  //  ].join(''))
  // })

  // TODO: there were two tests here:
  // - "whitespace cascade true"
  // - "whitespace cascade false"
  // do we want to keep this configurable?
  test('whitespace', () => {
    expect(
      stylis(`
        div {
          ${'width:0;    '}
        }
      `)
    ).to.equal(`.user div{width:0;}`)
  })

  // TODO: seems broken right now
  // test('no semi-colons I", () => {
  //  expect(stylis(`
  //      color:red
  //      h2 {
  //        color:blue
  //        width:0
  //        h3 {
  //          display:none
  //        }
  //      }
  //      div:hover
  //        {
  //        color:red
  //      }
  //    `)).to.equal([
  //      '.user{color:red;}',
  //      '.user h2{color:blue;width:0;}',
  //      '.user h2 h3{display:none;}',
  //      '.user div:hover{color:red;}      '
  //  ].join(''))
  // })

  // TODO: seems broken right now
  // test('no semi-colons II", () => {
  //  expect(stylis(`
  //      color:red
  //      color:red
  //      h1:hover,
  //      h2:hover
  //      ,
  //      h3
  //      {
  //        color:red
  //        width:0/
  //          2
  //      }
  //      h1 {
  //        grid-template-areas:
  //          "header header header"
  //          '. main .';
  //      }
  //      h1 {
  //        width:calc(20px)
  //                20px;
  //      }
  //    `)).to.equal([
  //      `.user{color:red;color:red;}`,
  //      `.user h1:hover,.user h2:hover,.user h3{color:red;width:0/ 2;}`,
  //      `.user h1{grid-template-areas: "header header header" '. main .';}`,
  //      `.user h1{width:calc(20px) 20px;}`
  //  ].join(''))
  // })

  // TODO: seems broken right now
  // test('no semi-colon III", () => {
  //  expect(stylis(`
  //      grid:
  //        50%
  //        50%
  //      grid:
  //        50%
  //        /
  //        50%
  //      grid-template-areas: "a b b"
  //                           "a c d";
  //      background: center
  //        center no-repeat;
  //      color:red;
  //      grid-template-columns: minmax(100px, max-content)
  //                             repeat(auto-fill, 200px) 20%;
  //      grid-template-columns: [linename1] 100px [linename2]
  //                             repeat(auto-fit, [linename3 linename4] 300px)
  //                             100px;
  //      grid-template-columns: [linename1 linename2] 100px
  //                             repeat(auto-fit, [linename1] 300px) [linename3];
  //    `)).to.equal([
  //      `.user{grid: 50% 50%;grid: 50% / 50%;grid-template-areas:"a b b" "a c d";background:center center no-repeat;color:red;grid-template-columns:minmax(100px,max-content) repeat(auto-fill,200px) 20%;grid-template-columns:[linename1] 100px [linename2] repeat(auto-fit,[linename3 linename4] 300px) 100px;grid-template-columns:[linename1 linename2] 100px repeat(auto-fit,[linename1] 300px) [linename3];}`
  //  ].join(''))
  // })

  // TODO: whitespace is different than in original
  // it shouldnt be a problem though?
  // test('multiline declaration", () => {
  //  expect(stylis(`
  //      html {
  //        background:
  //          linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
  //          url(/static/background.svg);
  //      }
  //    `)).to.equal(`.user html{background: linear-gradient(0deg,rgba(255,255,255,0.8),rgba(255,255,255,0.8)), url(/static/background.svg);}`)
  // })

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

  // TODO: this is kinda relevant only in combination with auto-prefixing, so this test should be enabled while we add tests for prefixer
  // test('position fixed without prefixing [issue#53]", () => {
  //  expect(stylis(`
  //      position: fixed;
  //    `,)).to.equal('.user{position:fixed;}')
  // })

  test('noop tail I', () => {
    expect(stylis(`color:red/**/`)).to.equal(`.user{color:red;}`)
  })

  // TODO: fix it :v
  // test('noop tail II", () => {
  //  expect(stylis(`color:red//`,)).to.equal('.user{color:red;}')
  // })

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

  // TODO: fix it, seems like the root cause might be similar to "noop tail II"
  // test('noop tail VII", () => {
  //  expect(stylis(`h1{color:rgb([`)).to.equal(`.user h1{color:rgb([;}`)
  // })

  // TODO: fix it, seems like the root cause might be similar to "noop tail II"
  // test('noop tail VIII", () => {
  //  expect(stylis(`h1{color:red/**}`)).to.equal(`.user h1{color:red;}`)
  // })

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

  test('comment in a group of selectors inside a media query keeping consecutive rule inside that media query (#152)', () => {
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

  // TODO: doesn't include namespace for some reason
  // test('parenthesis in string literal I (#151)", () => {
  //  var url = 'image_(1).jpg'

  //  expect(
  //    stylis(`
  //      @media only screen and (max-width: 320px){
  //          background: url("${url}");
  //      }

  //      @media only screen and (min-width:321px) {
  //        background: url("${url}");
  //      }
  //    `)
  //  ).to.equal([
  //    `@media only screen and (max-width: 320px){.user{background:url("image_(1).jpg");}}`,
  //    `@media only screen and (min-width:321px){.user{background:url("image_(1).jpg");}}`
  //  ].join(''))
  // })

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

  // TODO: would fix #144
  // test('css variables edge cases", () => {
  //   expect(
  //     stylis(`
  //    --braces: { };
  //    --at-keyword-unknown-block: @foobar {};
  //    --at-keyword-known-block: @media {};
  //    --cdo-at-top-level: <!--;
  //    --cdc-at-top-level: -->;
  //    --semicolon-not-top-level: (;);
  //    --cdo-not-top-level: (<!--);
  //    --cdc-not-top-level: (-->);
  //  `)
  //   ).to.equal(
  //     `.user{` +
  //       [
  //         "--braces: { };",
  //         "--at-keyword-unknown-block: @foobar {};",
  //         "--at-keyword-known-block: @media {};",
  //         "--cdo-at-top-level: <!--;",
  //         "--cdc-at-top-level: -->;",
  //         "--semicolon-not-top-level: (;);",
  //         "--cdo-not-top-level: (<!--);",
  //         "--cdc-not-top-level: (-->);"
  //       ].join('') +
  //       "}"
  //   );
  // });

  test('does not hang on unterminated block comment (#129)', () => {
    expect(stylis(`/*`)).to.equal(``)
  })
})
