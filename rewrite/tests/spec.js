/**
 * define tests
 * @type {Object}
 */
var spec = {
	'flat': {
		sample: `
			color: 20px;
			font-size: 20px;
			transition: all
		`,
		expected: `.user{color: 20px;font-size: 20px;-webkit-transition: all;transition: all}`
	},
	'namespace': {
		sample: `
			{
				color: blue;
			}
		`,
		expected: `.user {color: blue;}`
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
			}
		`,
		expected: `.user h1,h2{color: red;}`+
		`[title="[]()"]:not(h2):not(h2){color: red;}`+
		`body{background: yellow;}`+
		`body h1,body h2{color: red;}`+
		`body > li,.user li{color: yellow;}`+
		`.user h1 :global(body > li){color: red;}`+
		`html .user{color: red;}`
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
		`@supports (display: block) {`+
		`.user{color: red;}`+
		`.user h1{color: red;}`+
		`.user h1 h2{color: blue;}`+
		`.user{display: none;}`+`}`+

		`@media (max-width: 600px) {`+
		`.user{color: red;}`+
		`.user h1{color: red;}`+
		`.user h1 h2{color: blue;}`+
		`.user{display: none;}`+`}`+

		`@media (min-width: 576px) {`+
		`.user.card-deck .card:not(:first-child){margin-left: 15px;}`+
		`.user.card-deck .card:not(:last-child){margin-right: 15px;}`+
		`}`+

		`@supports (display: block) {`+
		`@media (min-width: 10px) {`+
		`.user{background-color: seagreen;}`+
		`}`+
		`}`+
		'@media (max-width: 600px) {.user{color: red}}'+
		`.user:hover{color: orange}`
	},
	'@font-face': {
		sample: `
			@font-face {
				font-family: Pangolin;
				src: url('Pangolin-Regular.ttf') format('truetype');
			}
		`,
		expected: `@font-face {font-family: Pangolin;src: url('Pangolin-Regular.ttf') format('truetype');}`
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
		`.user [title="a,b,c, something"],.user h1,.user [title="a,b,c"]{color: red}`+
		`.user [title="a"],.user [title="b"]{color: red;}`
	},
	'strings': {
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
		expected: `.user .content{display: none}`+
		`.user .content{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}`
	},
	':matches(:not())': {
		sample: `
			h1:matches(.a, .b, :not(.c)) {
				display: none
			}
		`,
		expected: `.user h1:matches(.a, .b, :not(.c)){display: none}`
	},
	'prefixer': {
		sample: `
			html {
			  text-size-adjust: none;
			}
			input.red::placeholder,
			input.error::placeholder {
		  		color:red;
			}
			& {
				width: max-content;
				width: min-content;
				display: flex !important;
			  transform: rotate(30deg);
			  cursor: grab;

			  justify-content: flex-end;
			  justify-content: flex-start;
			  justify-content: justify;
			}
			&::placeholder {
				color:red;
			}
			& {
				&::placeholder {
					color:red;
				}
			}
			input {
				&::placeholder {
					color:red;
				}
			}
			& {
				transition: transform 1s, all 400ms;
			}
		`,
		expected:
			`.user html{-webkit-text-size-adjust: none;text-size-adjust: none;}`+
			`.user input.red::-webkit-input-placeholder,.user input.error::-webkit-input-placeholder{color:red;}`+
			`.user input.red::-moz-placeholder,.user input.error::-moz-placeholder{color:red;}`+
			`.user input.red:-ms-input-placeholder,.user input.error:-ms-input-placeholder{color:red;}`+
			`.user input.red::placeholder,.user input.error::placeholder{color:red;}`+

			`.user{`+
			`width:-webkit-max-content;width:-moz-max-content;width:max-content;`+
			`width:-webkit-min-content;width:-moz-min-content;width:min-content;`+
			`display:-webkit-box !important;display:-webkit-flex !important;`+
			`display:-ms-flexbox !important;display:flex !important;`+
			`-webkit-transform: rotate(30deg);-ms-transform: rotate(30deg);transform: rotate(30deg);`+
			`cursor: -webkit-grab;cursor: -moz-grab;cursor: grab;`+

			'-webkit-box-pack: end;-webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;'+
			'-webkit-box-pack: start;-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;'+
			'-webkit-box-pack: justify;-webkit-justify-content: justify;-ms-flex-pack: justify;justify-content: justify;'+

			`}` +
			`.user::-webkit-input-placeholder{color:red;}`+
			`.user::-moz-placeholder{color:red;}`+
			`.user:-ms-input-placeholder{color:red;}`+
			`.user::placeholder{color:red;}` +

			`.user::-webkit-input-placeholder{color:red;}`+
			`.user::-moz-placeholder{color:red;}`+
			`.user:-ms-input-placeholder{color:red;}`+
			`.user::placeholder{color:red;}`+

			`.user input::-webkit-input-placeholder{color:red;}`+
			`.user input::-moz-placeholder{color:red;}`+
			`.user input:-ms-input-placeholder{color:red;}`+
			`.user input::placeholder{color:red;}`+

			`.user{`+
			`-webkit-transition:-webkit-transform 1s, all 400ms;`+
			`-webkit-transition: transform 1s, all 400ms;`+
			`transition: transform 1s, all 400ms;`+
			`}`
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
			keyframes: false
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
			`{to {-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`+

			`@keyframes slidein-user`+
			`{to {-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`
	},
	'keyframes disable namespace': {
		options: {
			keyframes: false
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

			`@-webkit-keyframes slidein `+
			`{to {-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`+

			`@keyframes slidein `+
			`{to {-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`
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
		`@media {.user h1,.user div{color: red;}}`+
		`@media {.user{color: blue;}}`+
		`.user.foo.bar{color: orange}`+
		`.user.foo.bar.barbar{color: orange}`
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
		expected: `[title=foo] h1{-webkit-animation:slide-foo 1s;animation:slide-foo 1s;}`
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
		 expected: `@media (min-width: 537px) {`+
		 	`.user{border-bottom: 4px solid red;}}`+
		 	`.user::-webkit-input-placeholder{color: pink;}`+
		 	`.user::-moz-placeholder{color: pink;}`+
		 	`.user:-ms-input-placeholder{color: pink;}`+
		 	`.user::placeholder{color: pink;}`
	},
	'middleware contexts': {
		options: {
			plugins: function (ctx, str, line, col) {
				switch (ctx) {
					case 0: return 'width: 10px;'+str
					case 1: return str+'/* selector */';
					case 3: return str+'/* property */';
					case 4: return str+'/* block */';
					case 5: return str+'/* output */';
				}
			}
		},
		sample: `
			color: blue;
			h1 { color: red; }
		`,
		expected: '.user{width: 10px;/* property */color: blue;/* property */}/* block */'+
		'.user h1/* selector */{color: red;/* property */}/* block *//* output */'
	},
	'cascade isolation simple': {
		options: {
			cascade: false
		},
		sample: `
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
		`,
		expected: `p.user{color: red;}`+
		`p.user a.user{color: red;}`+
		`p.user:hover{color: red;}`+
		`p.user::before{color: red;}`+
		`.user:hover{color: red;}`+
		`.user::before{color: red;}`+
		`.user:hover p.user{color: red;}`
	},
	'cascade isolation complex': {
		options: {
			cascade: false
		},
		sample: `
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
		expected: `a.user:not( a.user +b.user foo.user:hover marquee a.user) > .user:hover{color: red;}`+
		`.root.user > *:not(header.user){color: red;}`+
		`a.user:not( a.user +b.user foo.user:hover marquee a.user) > .user:hover{color: red;}`
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
		`,
		expected: `.user{color: red;}`+
		`h1.user section{color: red}`+
		`h1.user h2.user{color: red}`+
		`div.user h1.user,span.user h1.user{color: red}`+
		`span.user:hover{color: red}`
	},
};

if (typeof module === 'object') {
	module.exports = spec;
}
