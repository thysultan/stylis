/**
 * define tests
 * @type {Object}
 */
var spec = {
	'universal selector': {
		sample: `
		* {
			color: red;
		}
		`,
		expected: `.user *{color: red;}`
	},
	'flat': {
		sample: `
			color: 20px;
			font-size: 20px;
			transition: all
		`,
		expected: `.user{color: 20px;font-size: 20px;-webkit-transition: all;transition: all;}`
	},
	'namespace': {
		sample: `
			{
				color: blue;
			}

			& {
				color: red;
			}
		`,
		expected: `.user{color: blue;}.user{color: red;}`
	},
	':global()': {
		sample: `
			h1, :global(h2) {
				color: red;
			}

			:global([title="[]()"]:not(h2)):not(h2) {
				color: red;
			}

			:global(body) {
				background: yellow;

				h1, h2 {
					color: red;
				}
			}

			:global(body > li), li {
				color: yellow;
			}

			h1 :global(body > li) {
				color: red;
			}

			html & {
				color: red;

				body {
					color: red;
				}
			}

			div {
				h1 & {
					color: red;
				}
			}
		`,
		expected: `.user h1,h2{color: red;}`+
		`[title="[]()"]:not(h2):not(h2){color: red;}`+
		`body{background: yellow;}`+
		`body h1,body h2{color: red;}`+
		`body > li,.user li{color: yellow;}`+
		`.user h1 :global(body > li){color: red;}`+
		`html .user{color: red;}`+
		`html .user body{color: red;}`+
		`div h1 .user{color: red;}`
	},
	'comments': {
		sample: `
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
		`,
		expected: '.user button{color: blue;}.user button{color: red;}'
	},
	'&': {
		sample: `
			& {
				color: blue;
			}

			&&& {
				color: red;
			}

			& + & {
				color: red;
			}
		`,
		expected: '.user{color: blue;}.user.user.user{color: red;}.user + .user{color: red;}'
	},
	'&:before': {
		sample: `
			&:before{
				color: blue;
			}
		`,
		expected: '.user:before{color: blue;}'
	},
	'@import': {
		sample: `@import url('http://example.com');`,
		expected: `@import url('http://example.com');`
	},
	'@media & @supports': {
		sample: `
			@supports (display: block) {
				color: red;
				h1 {
					color: red;

					h2 {
						color: blue;
					}
				}
				display: none;
			}

			@media (max-width: 600px) {
				color: red;
				h1 {
					color: red;

					h2 {
						color: blue;
					}
				}
				display: none;
			}

			@media (min-width: 576px) {
				&.card-deck {
					.card {
				 		&:not(:first-child) {
				   			margin-left: 15px;
				 		}
						&:not(:last-child) {
				   			margin-right: 15px;
						}
					}
				}
			}

			@supports (display: block) {
				@media (min-width: 10px) {
			  	background-color: seagreen;
				}
			}

			@media (max-width: 600px) {
		   	& { color: red }
		 	}


		 	&:hover {
		   	color: orange
		 	}
		`
		,
		expected:
		`@supports (display: block){`+
		`.user{color: red;display: none;}`+
		`.user h1{color: red;}`+
		`.user h1 h2{color: blue;}`+
		`}`+

		`@media (max-width: 600px){`+
		`.user{color: red;display: none;}`+
		`.user h1{color: red;}`+
		`.user h1 h2{color: blue;}`+
		`}`+

		`@media (min-width: 576px){`+
		`.user.card-deck .card:not(:first-child){margin-left: 15px;}`+
		`.user.card-deck .card:not(:last-child){margin-right: 15px;}`+
		`}`+

		`@supports (display: block){`+
		`@media (min-width: 10px){`+
		`.user{background-color: seagreen;}`+
		`}}`+
		'@media (max-width: 600px){.user{color: red;}}'+
		`.user:hover{color: orange;}`
	},
	'@media specifity': {
		sample: `
		> #box-not-working {
		  background: red;
		  padding-left: 8px;

		  width: 10px;

		  @media only screen and (min-width: 10px) {
				width: calc(
					10px + 90px *
					(100vw - 10px) / 90
				);
		  }

		  @media only screen and (min-width: 90px) {
				width: 90px;
		  }

		  height: 10px;

		  @media only screen and (min-width: 10px) {
				height: calc(
					10px + 90px *
					(100vw - 10px) / 90
				);
		  }

		  @media only screen and (min-width: 90px) {
		    height: 90px;
		  }
		}`,
		expected: ``+
		`.user > #box-not-working{background: red;padding-left: 8px;width: 10px;height: 10px;}`+
		`@media only screen and (min-width: 10px){`+
		`.user > #box-not-working{width: calc(10px + 90px *(100vw - 10px) / 90);}`+
		`}`+
		`@media only screen and (min-width: 90px){`+
		`.user > #box-not-working{width: 90px;}`+
		`}`+
		`@media only screen and (min-width: 10px){`+
		`.user > #box-not-working{height: calc(10px + 90px *(100vw - 10px) / 90);}`+
		`}`+
		`@media only screen and (min-width: 90px){`+
		`.user > #box-not-working{height: 90px;}`+
		`}`
	},
	'@font-face': {
		sample: `
			@font-face {
				font-family: Pangolin;
				src: url('Pangolin-Regular.ttf') format('truetype');
			}
		`,
		expected: `@font-face{font-family: Pangolin;src: url('Pangolin-Regular.ttf') format('truetype');}`
	},
	'multiple selectors': {
		sample: `
			span, h1 {
				color:red;
			}
			h1, &:after, &:before {
				color:red;
			}
		`,
		expected: `.user span,.user h1{color:red;}.user h1,.user:after,.user:before{color:red;}`
	},
	'[title="a,b"] and :matches(a,b)': {
		sample: `
			.test:matches(a, b, c), .test {
				color: blue;
			}

			.test[title=","] {
				color: red;
			}

			[title="a,b,c, something"], h1, [title="a,b,c"] {
		  		color: red
			}

			[title="a"],
			[title="b"] {
				color: red;
			}
		`,
		expected: `.user .test:matches(a, b, c),.user .test{color: blue;}`+
		`.user .test[title=","]{color: red;}`+
		`.user [title="a,b,c, something"],.user h1,.user [title="a,b,c"]{color: red;}`+
		`.user [title="a"],.user [title="b"]{color: red;}`
	},
	'quoutes': {
		sample: `
			.foo:before {
		  		content: ".hello {world}";
		  		content: ".hello {world} ' ";
		  		content: '.hello {world} " ';
			}
		`,
		expected: `.user .foo:before{content: ".hello {world}";`+
		`content: ".hello {world} ' ";`+
		`content: '.hello {world} " ';}`
	},
	'remove empty css': {
		sample: `
			& {

			}
		`,
		expected: ``
	},
	'urls': {
		sample: `
			background: url(http://url.com/});

			background: url(http://url.com//1234) '('; // sdsd

			background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAABCAIAAADsEU8HAAAACXBIW`+
			`XMAAAsTAAALEwEAmpwYAAAAIklEQVQI12P8//8/Aw4wbdq0rKysAZG1trbGJXv06FH8sgDIJBbBfp+hFAAAAABJRU5ErkJggg==");`,
		expected: `.user{background: url(http://url.com/});`+
		`background: url(http://url.com//1234) '(';`+
		`background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAABCAIAAADsEU8HAAAACXBIW`+
		`XMAAAsTAAALEwEAmpwYAAAAIklEQVQI12P8//8/Aw4wbdq0rKysAZG1trbGJXv06FH8sgDIJBbBfp+hFAAAAABJRU5ErkJggg==");}`
	},
	'last semicolon omission': {
		sample: `
			.content {
				display: none
			}

			.content {
				display: flex
			}
		`,
		expected: `.user .content{display: none;}`+
		`.user .content{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}`
	},
	':matches(:not())': {
		sample: `
			h1:matches(.a, .b, :not(.c)) {
				display: none
			}
		`,
		expected: `.user h1:matches(.a, .b, :not(.c)){display: none;}`
	},
	'prefixer': {
		sample: `
			html {
			  text-size-adjust: none;
			}
			input.red::placeholder {
		  	color:red;
			}
			& {
				width: max-content;
				width: min-content;
				display: flex!important;
			  transform: rotate(30deg);
			  cursor: grab;

			  justify-content: flex-end;
			  justify-content: flex-start;
			  justify-content: justify;
			}
			& {
				transition: transform 1s, all 400ms;
			}

			div {
				align-items: value;
				align-self: value;
				align-content: value;
			}

			div {
				color:papayawhip;
			}
		`,
		expected:
			`.user html{-webkit-text-size-adjust: none;text-size-adjust: none;}`+
			`.user input.red::-webkit-input-placeholder{color:red;}`+
			`.user input.red::-moz-placeholder{color:red;}`+
			`.user input.red:-ms-input-placeholder{color:red;}`+
			`.user input.red::placeholder{color:red;}`+

			`.user{`+
			`width:-webkit-max-content;width:-moz-max-content;width:max-content;`+
			`width:-webkit-min-content;width:-moz-min-content;width:min-content;`+
			`display:-webkit-box!important;display:-webkit-flex!important;`+
			`display:-ms-flexbox!important;display:flex!important;`+
			`-webkit-transform: rotate(30deg);-ms-transform: rotate(30deg);transform: rotate(30deg);`+
			`cursor: -webkit-grab;cursor: -moz-grab;cursor: grab;`+

			'-webkit-box-pack: end;-webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;'+
			'-webkit-box-pack: start;-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;'+
			'-webkit-box-pack: justify;-webkit-justify-content: justify;-ms-flex-pack: justify;justify-content: justify;'+

			`}` +

			`.user{`+
			`-webkit-transition:-webkit-transform 1s, all 400ms;`+
			`-webkit-transition: transform 1s, all 400ms;`+
			`transition: transform 1s, all 400ms;`+
			`}`+

			`.user div{`+
			`-webkit-align-items: value;-webkit-box-align: value;-ms-flex-align: value;align-items: value;`+
			`-webkit-align-self: value;-ms-flex-item-align: value;align-self: value;`+
			`-webkit-align-content: value;-ms-flex-line-pack: value;align-content: value;`+
			`}`+
			'.user div{'+
			'color:papayawhip;'+
			'}'
	},
	'animations': {
		sample: `
			h2 {
				animation: initial inherit unset --invalid;
			}
			span {
				animation: _name_ -name %name 1name __name;
			}
			div {
				animation-name: bounce
			}

			h1 {
				animation:` +
				`
				0.6s
				.6ms
				200ms
				infinite
				something-ease
				infinite-fire
				slidein
				cubic-bezier()
				cubic-bezier(1, 2, 4)
				ease-in-out
				ease
				ease-inOuter
				linear
				alternate
				normal
				forwards
				both
				none
				ease-in
				ease-out
				backwards
				running
				paused
				reversed
				alternate-reverse
				step-start
				step-end
				step-end-something
				steps(4, end)
				`.replace(/\n|\r| +/g, ' ') +
				`;
			}
			span {
      			animation-duration: 0.6s;
      			animation-name: slidein;
      			animation-iteration-count: infinite;
      			animation-timing-function: cubic-bezier(0.1,0.7,1.0,0.1);
		    }
		`,
		expected:
		/*
			this also tests the parses ability to find and namespace
			the animation-name in a grouped animation: property
		*/
		`.user h2{`+
		`-webkit-animation:initial inherit unset --invalid;animation:initial inherit unset --invalid;}`+
		`.user span{-webkit-animation:_name_-user -name-user %name 1name __name-user;`+
		`animation:_name_-user -name-user %name 1name __name-user;}`+
		`.user div{-webkit-animation-name:bounce-user;animation-name:bounce-user;}`+
		`.user h1{-webkit-animation:0.6s .6ms 200ms infinite something-ease-user `+
		`infinite-fire-user slidein-user cubic-bezier() cubic-bezier(1, 2, 4) `+
		`ease-in-out ease ease-inOuter-user linear alternate normal forwards both `+
		`none ease-in ease-out backwards running paused reversed alternate-reverse `+
		`step-start step-end step-end-something-user steps(4, end);`+
		`animation:0.6s .6ms 200ms infinite something-ease-user infinite-fire-user `+
		`slidein-user cubic-bezier() cubic-bezier(1, 2, 4) ease-in-out ease `+
		`ease-inOuter-user linear alternate normal forwards both none ease-in `+
		`ease-out backwards running paused reversed alternate-reverse step-start `+
		`step-end step-end-something-user steps(4, end);}`+
		`.user span{-webkit-animation-duration:0.6s;animation-duration:0.6s;`+
		`-webkit-animation-name:slidein-user;animation-name:slidein-user;`+
		`-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;`+
		`-webkit-animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);`+
		`animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);}`
	},
	'animations disabled namespace': {
		options: {
			keyframe: false
		},
		sample: `
			span {
  			animation-duration: 0.6s;
  			animation-name: slidein;
  			animation-iteration-count: infinite;
    	}
		`,
		expected: `.user span{-webkit-animation-duration:0.6s;animation-duration:0.6s;-webkit-animation-name:slidein;`+
			`animation-name:slidein;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;}`
	},
	'keyframes': {
		sample: `
			&{
				animation: slidein 3s ease infinite;
			}
			@keyframes slidein {
				to { transform: translate(20px); }
			}
		`,
		expected: `.user{-webkit-animation:slidein-user 3s ease infinite;animation:slidein-user 3s ease infinite;}`+
			`@-webkit-keyframes slidein-user`+
			`{to{-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`+

			`@keyframes slidein-user`+
			`{to{-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`
	},
	'keyframes disable namespace': {
		options: {
			keyframe: false
		},
		sample: `
			&{
				animation: slidein 3s ease infinite;
			}
			@keyframes slidein {
				to { transform: translate(20px); }
			}
		`,
		expected: `.user{-webkit-animation:slidein 3s ease infinite;animation:slidein 3s ease infinite;}`+

			`@-webkit-keyframes slidein`+
			`{to{-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`+

			`@keyframes slidein`+
			`{to{-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`
	},
	'nested': {
		sample: `
			:global(div) {
				h2 {
					color: red;

					h3 {
						color: blue;
					}
				}
			}

			.foo & {
			    width: 1px;

			    &:hover {
			        color: black;
			    }

			    li {
			  		color: white;
			    }
			}

			h1, div {
				color: red;

				h2,
				&:before {
					color: red;
				}

				color: blue;

				header {
					font-size: 12px;
				}

				@media {
					color: red;
				}

				@media {
					color: blue;
				}
			}

			&.foo {
				&.bar {
					color: orange
				}
			}

			&.foo {
				&.bar {
					&.barbar {
						color: orange
					}
				}
			}
		`,
		expected: `div h2{color: red;}`+
		`div h2 h3{color: blue;}`+
		`.foo .user{width: 1px;}`+
		`.foo .user:hover{color: black;}`+
		`.foo .user li{color: white;}`+
		`.user h1,.user div{color: red;color: blue;}`+
		`.user h1 h2,.user div h2,.user h1:before,.user div:before{color: red;}`+
		`.user h1 header,.user div header{font-size: 12px;}`+
		`@media{.user h1,.user div{color: red;}}`+
		`@media{.user h1,.user div{color: blue;}}`+
		`.user.foo.bar{color: orange;}`+
		`.user.foo.bar.barbar{color: orange;}`
	},
	'class namespace': {
		selector: ' .foo',
		sample: `h1 {animation: slide 1s;}`,
		expected: `.foo h1{-webkit-animation:slide-foo 1s;animation:slide-foo 1s;}`
	},
	'id namespace': {
		selector: '#foo',
		sample: `h1 {animation: slide 1s;}`,
		expected: `#foo h1{-webkit-animation:slide-foo 1s;animation:slide-foo 1s;}`
	},
	'attribute namespace': {
		selector: '[title=foo]',
		sample: `h1 {animation: slide 1s;}`,
		expected: `[title=foo] h1{-webkit-animation:slidetitlefoo 1s;animation:slidetitlefoo 1s;}`
	},
	'empty namespace': {
		selector: '',
		sample: `
		h1 {animation: slide 1s;}
		@keyframes name {
			0: {
				top: 0
			}
		}
		`,
		expected: ``+
		`h1{-webkit-animation:slide 1s;animation:slide 1s;}`+
		`@-webkit-keyframes name{0:{top: 0;}}@keyframes name{0:{top: 0;}}`
	},
	'edge cases': {
		 sample: `
				@media (min-width: 537px) {
				  border-bottom: 4px solid red;
				}

				&::placeholder {
				  color: pink;
				}
		 `,
		 expected: `@media (min-width: 537px){`+
		 	`.user{border-bottom: 4px solid red;}}`+
		 	`.user::-webkit-input-placeholder{color: pink;}`+
		 	`.user::-moz-placeholder{color: pink;}`+
		 	`.user:-ms-input-placeholder{color: pink;}`+
		 	`.user::placeholder{color: pink;}`
	},
	// note the spaces after ;
	'whitespace cascade true': {
		sample: `
			html {
				width: 0;  	     
			}
		`,
		expected: `.user html{width: 0;}`
	},
	// note the spaces after ;
	'whitespace cascade false': {
		options: {
			cascade: false
		},
		sample: `
			html{
				width: 0;  	  
			}   
		`,
		expected: `html.user{width: 0;}`
	},
	'cascade isolation simple': {
		options: {
			cascade: false
		},
		sample: `
			[data-id=foo] {
				color: red;
			}

			p {
				color: red;
			}

			p a {
				color: red;
			}

			p:hover {
			  color: red;
			}

			p::before {
			  color: red;
			}

			:hover {
			  color: red;
			}

			::before {
			  color: red;
			}

			:hover p {
			  color: red;
			}

			html.something & {
				color: red;
			}

			.class #id {
				color: red;
			}

			& {
				color: red
			}

			.a.b .c {
				color: red;
			}

			:nth-child(2n),
			:nth-last-child(2n),
			:nth-of-type(2n) {
				color: red;
			}
		`,
		expected: ``+
		`[data-id=foo].user{color: red;}`+
		`p.user{color: red;}`+
		`p.user a.user{color: red;}`+
		`p.user:hover{color: red;}`+
		`p.user::before{color: red;}`+
		`.user:hover{color: red;}`+
		`.user::before{color: red;}`+
		`.user:hover p.user{color: red;}`+
		'html.something.user .user{color: red;}'+
		`.class.user #id.user{color: red;}`+
		`.user{color: red;}`+
		`.a.b.user .c.user{color: red;}`+
		`.user:nth-child(2n),.user:nth-last-child(2n),.user:nth-of-type(2n){color: red;}`
	},
	'cascade isolation complex': {
		options: {
			cascade: false
		},
		sample: `
			.List :global(>) :global(*) {
			  margin-top: 10px;
			}

			.List :global(*) :global(+) :global(*) {
			  margin-top: 10px;
			}

			.List :global(> *) {
			  margin-top: 10px;
			}

			.List :global(* + *) {
			  margin-top: 10px;
			}

			:global(.foo #bar > baz) {
				color: red;
			}

			div :global(.react-select .some-child-of-react-select) {
				color:red;
			}

			a:not( a +b foo:hover :global(marquee) a) > :hover {
			  color: red;
			}

			.root > :global(*):not(header) {
			  color: red;
			}

			a:not( a +b foo:hover :global(marquee) a) > :hover {
			  color: red;
			}
		`,
		expected: ``+
		`.List.user >*{margin-top: 10px;}`+
		`.List.user * +*{margin-top: 10px;}`+
		`.List.user > *{margin-top: 10px;}`+
		`.List.user * + *{margin-top: 10px;}`+
		`.foo #bar > baz{color: red;}`+
		`div.user .react-select .some-child-of-react-select{color:red;}`+
		`a.user:not(a.user+b.user foo.user:hover marquee a.user)>.user:hover{color: red;}`+
		`.root.user>*:not(header.user){color: red;}`+
		`a.user:not(a.user+b.user foo.user:hover marquee a.user)>.user:hover{color: red;}`
	},
	'cascade isolation @at-rules': {
		options: {
			cascade: false
		},
		sample: `
			@keyframes hahaha {
			  from { top: 0 }
			  to { top: 100 }
			}

			span {}
			      @media (min-width: 480px) { div { color: red } }
		`,
		expected: ``+
		`@-webkit-keyframes hahaha-user{from{top: 0;}to{top: 100;}}`+
		`@keyframes hahaha-user{from{top: 0;}to{top: 100;}}`+
		`@media (min-width: 480px){div.user{color: red;}}`
	},
	'cascade isolation nesting': {
		options: {
			cascade: false
		},
		sample: `
			color: red;

			h1 {
				:global(section) {
					color: red
				}
			}

			h1 {
				h2 {
					color: red
				}
			}

			div, span {
				h1 {
					color: red
				}
			}

			span {
				&:hover {
					color: red
				}
			}

			[data-id=foo] {
				&:hover {
					color: red
				}
			}
		`,
		expected: ``+
		`.user{color: red;}`+
		`h1.user section{color: red;}`+
		`h1.user h2.user{color: red;}`+
		`div.user h1.user,span.user h1.user{color: red;}`+
		`span.user:hover{color: red;}`+
		`[data-id=foo].user:hover{color: red;}`
	},
	'no semi-colons': {
		sample: `
			color: red

			h2 {
				color: blue
				width: 0

				h3 {
					display: none
				}
			}
		`,
		expected: ``+
		`.user{color: red;}`+
		`.user h2{color: blue;width: 0;}`+
		`.user h2 h3{display: none;}`
	},
	'semi-colons': {
		options: {
			semicolon: true
		},
		sample: `
			color: red

			h2 {
				color: blue
				width: 0

				h3 {
					display: none
				}
			}
		`,
		expected: ``+
		`.user color: red`+
		`h2 color: blue`+
		`width: 0`+
		`h3{display: none;}`
	},
	'middleware contexts': {
		options: {
			plugins: function (context, content, selector, parents, line, column, length) {
				switch (context) {
					case 1: return content+'/* property */';
					case 2: return content+'/* block */';
					case 3: return content+'/* at-rule */'
				}
			}
		},
		sample: `
			color: blue;
			h1 { color: red; }
			@media {
				color: red;
			}
		`,
		expected: ``+
		`.user{color: blue/* property */;/* block */}`+
		`.user h1{color: red/* property */;/* block */}`+
		`@media{.user{color: red/* property */;/* block */}/* at-rule */}`
	},
	'nesting selector multiple levels': {
		sample: `
			a {
				a {
					a {
						a {
							a {
								a {
									a {
										a {
											a{
												a{
													a{
														a{
															color: red;
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
		`,
		expected: `.user a a a a a a a a a a a a{color: red;}`
	},
	'nesting @media multiple levels': {
		sample: `
			div {
				@media {
					a {
						color: red;

						@media {
							h1 {
								color: red;
							}
						}
					}
				}
			}
		`,
		expected: `@media{.user div a{color: red;}@media{.user div a h1{color: red;}}}`
	}
};

if (typeof module === 'object') {
	module.exports = spec;
}
