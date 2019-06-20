/**
 * define tests
 * @type {Object}
 */
var spec = {
	'calc rules': {
		sample: `
			height:calc( 100vh - 1px );
			height:calc(
										100vh -
												1px
									);
		`,
		expected: ``+
		`.user{`+
		`height:calc( 100vh - 1px );`+
		`height:calc( 100vh - 1px );`+
		'}'
	},
	'at-rules': {
		sample: `
		@page {
	    size:A4 landscape;
	  }

		@document url(http://www.w3.org/),url-prefix(http://www.w3.org/Style/),domain(mozilla.org),regexp("https:.*") {
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
		`,
		expected: ``+
		`@page{size:A4 landscape;}`+
		`@document url(http://www.w3.org/),url-prefix(http://www.w3.org/Style/),domain(mozilla.org),regexp("https:.*"){`+
		`.user body{color:red;}`+
		'}'+
		`@viewport{min-width:640px;max-width:800px;}`+
		`@-ms-viewport{width: device-width;}`+
		`@counter-style list{system:fixed;symbols:url();suffix:" ";}`+
		`@-moz-document url-prefix(){.user .selector{color:lime;}}`+
		`@page{color:red;@bottom-right{content:counter(pages);margin-right:1cm;}width:none;}`
	},
	'at-rules-empty-selector': {
		sample: `
		@viewport {
			min-width:640px;
			max-width:800px;
		}

		@-ms-viewport {
			width: device-width;
		}`,
		expected: ``+
		`@viewport{min-width:640px;max-width:800px;}`+
		`@-ms-viewport{width: device-width;}`,
		selector: ``,
	},
	'monkey-patch some invalid css patterns': {
		sample: `
				margin:20px;
				.b {
				  border:3px solid green;
				}
			}
				.c {
					color:red;
				}
				color:red;
			}

			.d {
				color red;
			}

			;
			@media(screen) {
			  width:20%;
			};

			@media(screen) {
			  width:30%;
			};;;;;

			h1 {color:red}}};}
			h1 {color:red}}}  ;}

			h1: hover{
				color:red;
			}
		`,
		expected: ``+
			`.user{margin:20px;color:red;}`+
			`.user .b{border:3px solid green;}`+
			`.user .c{color:red;}`+
			`.user .d{color:red;}`+
			`@media(screen){.user{width:20%;}}`+
			`@media(screen){.user{width:30%;}}`+
			`.user h1{color:red;}`+
			`.user h1{color:red;}`+
			`.user h1:hover{color:red;}`
	},
	'escape breaking control characters': {
		sample: `content:"\f\0\v";`,
		expected: `.user{content:"\\f\\0\\v";}`
	},
	'universal selector': {
		sample: `
		* {
			color:red;
		}
		`,
		expected: `.user *{color:red;}`
	},
	'flat': {
		sample: `
			color:20px;
			font-size:20px;
			transition:all
		`,
		expected: `.user{color:20px;font-size:20px;-webkit-transition:all;transition:all;}`
	},
	'namespace': {
		sample: `
			{
				color:blue;
			}

			& {
				color:red;
			}
		`,
		expected: `.user{color:blue;}.user{color:red;}`
	},
	':global()': {
		sample: `
			h1, :global(h2) {
				color:red;
			}

			:global([title="[]()"]:not(h2)):not(h2) {
				color:red;
			}

			:global(body) {
				background:yellow;

				h1, h2 {
					color:red;
				}
			}

			:global(body > li), li {
				color: yellow;
			}

			h1 :global(body > li) {
				color:red;
			}

			html & {
				color:red;

				body {
					color:red;
				}
			}

			div {
				h1 & {
					color:red;
				}
			}

			html &:after {
				color:red;
			}

			html [a=' &'] {
				color:red;
			}

			:root {
				h1 & {
					color:red;
				}
			}
		`,
		expected: `.user h1,h2{color:red;}`+
		`[title="[]()"]:not(h2):not(h2){color:red;}`+
		`body{background:yellow;}`+
		`body h1,body h2{color:red;}`+
		`body > li,.user li{color:yellow;}`+
		`.user h1 :global(body > li){color:red;}`+
		`html .user{color:red;}`+
		`html .user body{color:red;}`+
		`h1 .user div{color:red;}`+
		`html .user:after{color:red;}`+
		`.user html [a=' &']{color:red;}`+
		'h1 .user:root{color:red;}'
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
		`,
		expected: ``+
			`.user{/*! 1 */color:red;/*! 2 */}`+
			`.user button{color:blue;}.user button{color:red;}`+
			`.user h1{/*! 1 */color:red;/*! 2 */color:red;/*! 3 */}`
	},
	'&': {
		sample: `
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

			:hover & {
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
		`,
		expected: ``+
		`.user{color:blue;}`+
		`.user.user.user{color:red;}`+
		`.user + .user{color:red;}`+
		`.wrapper button.user{color:red;}`+
		`.user:hover .user{color:green;}`+
		`div:hover .user{color:green;}`+
		`h1 div:hover .user{color:red;}`
	},
	'&:before': {
		sample: `
			&:before{
				color:blue;
			}
		`,
		expected: '.user:before{color:blue;}'
	},
	'@import': {
		sample: `@import url('http://example.com')`,
		expected: `@import url('http://example.com')`
	},
	'@supports': {
		sample: `
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
		`,
		expected: ``+
		`@supports (display:block){`+
			`.user{color:red;display:none;}`+
			`.user h1{color:red;}`+
			`.user h1 h2{color:blue;}`+
		`}`+
		`@supports (-webkit-appearance:none) or (-moz-appearance:none) or (appearance:none){`+
			`.user{color:red;}`+
		`}`+
		`@supports (-webkit-backdrop-filter:blur(10px)) or (backdrop-filter:blur(10px)){`+
			`.user{`+
				`-webkit-backdrop-filter:blur(10px);`+
				`backdrop-filter:blur(10px);`+
			`}`+
		`}`
	},
	'@media': {
		sample: `
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
		`
		,
		expected:
		`@media (max-width:600px){`+
		`.user{color:red;display:none;}`+
		`.user h1{color:red;}`+
		`.user h1 h2{color:blue;}`+
		`}`+

		`@media (min-width:576px){`+
		`.user.card-deck .card:not(:first-child){margin-left:15px;}`+
		`.user.card-deck .card:not(:last-child){margin-right:15px;}`+
		`}`+

		`@supports (display:block){`+
		`@media (min-width:10px){`+
		`.user{background-color:seagreen;}`+
		`}}`+
		'@media (max-width:600px){.user{color:red;}}'+
		`.user:hover{color:orange;}`
	},
	'@media specifity': {
		sample: `
		> #box-not-working {
		  background:red;
		  padding-left:8px;

		  width:10px;

		  @media only screen and (min-width:10px) {
				width:calc(
					10px + 90px *
					(100vw - 10px) / 90
				);
		  }

		  @media only screen and (min-width:90px) {
				width:90px;
		  }

		  height: 10px;

		  @media only screen and (min-width:10px) {
				height:calc(
					10px + 90px *
					(100vw - 10px) / 90
				);
		  }

		  @media only screen and (min-width:90px) {
		    height: 90px;
		  }
		}`,
		expected: ``+
		`.user > #box-not-working{background:red;padding-left:8px;width:10px;height:10px;}`+
		`@media only screen and (min-width:10px){`+
		`.user > #box-not-working{width:calc( 10px + 90px * (100vw - 10px) / 90 );}`+
		`}`+
		`@media only screen and (min-width:90px){`+
		`.user > #box-not-working{width:90px;}`+
		`}`+
		`@media only screen and (min-width:10px){`+
		`.user > #box-not-working{height:calc( 10px + 90px * (100vw - 10px) / 90 );}`+
		`}`+
		`@media only screen and (min-width:90px){`+
		`.user > #box-not-working{height:90px;}`+
		`}`
	},
	'@font-face': {
		sample: `
			@font-face {
				font-family:Pangolin;
				src:url('Pangolin-Regular.ttf') format('truetype');
			}
		`,
		expected: `@font-face{font-family:Pangolin;src:url('Pangolin-Regular.ttf') format('truetype');}`
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
		`,
		expected: `.user .test:matches(a,b,c),.user .test{color:blue;}`+
		`.user .test[title=","]{color:red;}`+
		`.user [title="a,b,c, something"],.user h1,.user [title="a,b,c"]{color:red;}`+
		`.user [title="a"],.user [title="b"]{color:red;}`
	},
	'quoutes': {
		sample: `
			.foo:before {
		  		content:".hello {world}";
		  		content:".hello {world} ' ";
		  		content:'.hello {world} " ';
			}
		`,
		expected: `.user .foo:before{content:".hello {world}";`+
		`content:".hello {world} ' ";`+
		`content:'.hello {world} " ';}`
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
			background:url(http://url.com/});

			background:url(http://url.com//1234) '('; // sdsd

			background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAABCAIAAADsEU8HAAAACXBIW`+
			`XMAAAsTAAALEwEAmpwYAAAAIklEQVQI12P8//8/Aw4wbdq0rKysAZG1trbGJXv06FH8sgDIJBbBfp+hFAAAAABJRU5ErkJggg==");`,
		expected: `.user{background:url(http://url.com/});`+
		`background:url(http://url.com//1234) '(';`+
		`background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAABCAIAAADsEU8HAAAACXBIW`+
		`XMAAAsTAAALEwEAmpwYAAAAIklEQVQI12P8//8/Aw4wbdq0rKysAZG1trbGJXv06FH8sgDIJBbBfp+hFAAAAABJRU5ErkJggg==");}`
	},
	'last semicolon omission': {
		sample: `
			.content {
				display:none
			}

			.content {
				display:flex
			}
		`,
		expected: `.user .content{display:none;}`+
		`.user .content{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}`
	},
	':matches(:not())': {
		sample: `
			h1:matches(.a,.b,:not(.c)) {
				display: none
			}
		`,
		expected: `.user h1:matches(.a,.b,:not(.c)){display:none;}`
	},
	'vendor prefixing': {
		sample: `
			html {
			  text-size-adjust: none;
			}
			input.red::placeholder {
		  	color:red;
			}
			& {
				display:flex!important;
				display:inline-flex;
				display:inline-box;
			  transform:rotate(30deg);
			  cursor:grab;

			  justify-content:flex-end;
			  justify-content:flex-start;
			  justify-content:justify;
			}

			div {
				align-items:value;
				align-self:value;
				align-content:value;
			}

			div {
				align-content:flex-start;
				align-content:flex-end;
			}

			div {
				color:papayawhip;
				order:flex;
			}

			div {
				backface-visibility:hidden;
			}

			h1:read-only {
			  color:red;
			}

			& {
				transition:transform 1s,transform all 400ms,text-transform;
			}
		`,
		expected:
			`.user html{-webkit-text-size-adjust:none;text-size-adjust:none;}`+
			`.user input.red::-webkit-input-placeholder{color:red;}`+
			`.user input.red::-moz-placeholder{color:red;}`+
			`.user input.red:-ms-input-placeholder{color:red;}`+
			`.user input.red::placeholder{color:red;}`+

			`.user{`+

			`display:-webkit-box!important;`+
			`display:-webkit-flex!important;`+
			`display:-ms-flexbox!important;`+
			`display:flex!important;`+

			`display:-webkit-inline-box;`+
			`display:-webkit-inline-flex;`+
			`display:-ms-inline-flexbox;`+
			`display:inline-flex;`+
			`display:-webkit-inline-box;`+
			`display:inline-box;`+

			`-webkit-transform:rotate(30deg);`+
			`-ms-transform:rotate(30deg);`+
			`transform:rotate(30deg);`+

			`cursor:-webkit-grab;`+
			`cursor:-moz-grab;`+
			`cursor:grab;`+

			`-webkit-box-pack:end;`+
			`-webkit-justify-content:flex-end;`+
			`-ms-flex-pack:end;`+
			`justify-content:flex-end;`+

			`-webkit-box-pack:start;`+
			`-webkit-justify-content:flex-start;`+
			`-ms-flex-pack:start;`+
			`justify-content:flex-start;`+

			`-webkit-box-pack:justify;`+
			`-webkit-justify-content:justify;`+
			`-ms-flex-pack:justify;`+
			`justify-content:justify;`+

			`}` +

			`.user div{`+

			`-webkit-align-items:value;`+
			`-webkit-box-align:value;`+
			`-ms-flex-align:value;`+
			`align-items:value;`+

			`-webkit-align-self:value;`+
			`-ms-flex-item-align:value;`+
			`align-self:value;`+

			`-webkit-align-content:value;`+
			`-ms-flex-line-pack:value;`+
			`align-content:value;`+

			`}`+

			`.user div{`+

			`-webkit-align-content:flex-start;`+
			`-ms-flex-line-pack:start;`+
			`align-content:flex-start;`+

			`-webkit-align-content:flex-end;`+
			`-ms-flex-line-pack:end;`+
			`align-content:flex-end;`+

			`}`+

			'.user div{'+
			'color:papayawhip;'+
			`-webkit-order:flex;`+
			`-ms-flex-order:flex;`+
			`order:flex;`+
			'}'+

			'.user div{'+
			`-webkit-backface-visibility:hidden;`+
			`backface-visibility:hidden;`+
			'}'+
			'.user h1:-moz-read-only{'+
			'color:red;'+
			'}'+
			'.user h1:read-only{'+
			'color:red;'+
			'}'+

			`.user{`+
			`-webkit-transition:-webkit-transform 1s,-webkit-transform all 400ms,text-transform;`+
			`-webkit-transition:transform 1s,transform all 400ms,text-transform;`+
			`transition:transform 1s,transform all 400ms,text-transform;`+
			`}`
	},
	'vendor prefixing II': {
		sample: `
			div {
				writing-mode:vertical-lr;
				writing-mode:vertical-rl;
				writing-mode:horizontal-tb;
				writing-mode:sideways-rl;
				writing-mode:sideways-lr;
			}
		`,
		expected: ``+
		`.user div{`+
		`-webkit-writing-mode:vertical-lr;`+
		`-ms-writing-mode:tb;`+
		`writing-mode:vertical-lr;`+

		`-webkit-writing-mode:vertical-rl;`+
		`-ms-writing-mode:tb-rl;`+
		`writing-mode:vertical-rl;`+

		`-webkit-writing-mode:horizontal-tb;`+
		`-ms-writing-mode:lr;`+
		`writing-mode:horizontal-tb;`+

		`writing-mode:sideways-rl;`+
		`writing-mode:sideways-lr;`+
		`}`
	},
	'vendor prefixing III': {
		sample: `
			color:red;
			columns:auto;
			column-count:auto;
			column-fill:auto;
			column-gap:auto;
			column-rule:auto;
			column-rule-color:auto;
			column-rule-style:auto;
			column-rule-width:auto;
			column-span:auto;
			column-width:auto;
		`,
		expected: ``+
		`.user{`+
		`color:red;`+

		`-webkit-columns:auto;`+
		`columns:auto;`+

		`-webkit-column-count:auto;`+
		`column-count:auto;`+

		`-webkit-column-fill:auto;`+
		`column-fill:auto;`+

		`-webkit-column-gap:auto;`+
		`column-gap:auto;`+

		`-webkit-column-rule:auto;`+
		`column-rule:auto;`+

		`-webkit-column-rule-color:auto;`+
		`column-rule-color:auto;`+

		`-webkit-column-rule-style:auto;`+
		`column-rule-style:auto;`+

		`-webkit-column-rule-width:auto;`+
		`column-rule-width:auto;`+

		`-webkit-column-span:auto;`+
		`column-span:auto;`+

		`-webkit-column-width:auto;`+
		`column-width:auto;`+

		`}`
	},
	'vendor prefixing IV': {
		sample: `
			text-align:none;
			text-transform:none;
			text-shadow:none;
			text-size-adjust:none;
			text-decoration:none;
			filter:grayscale(100%);
			fill:red;
			position: sticky;
			mask-image: linear-gradient(#fff);
			mask-image: none;
		`,
		expected: `.user{`+
		`text-align:none;`+
		`text-transform:none;`+
		`text-shadow:none;`+
		`-webkit-text-size-adjust:none;`+
		`text-size-adjust:none;`+
		`-webkit-text-decoration:none;`+
		`text-decoration:none;`+
		'-webkit-filter:grayscale(100%);'+
		'filter:grayscale(100%);'+
		'fill:red;'+
		'position:-webkit-sticky;'+
		'position:sticky;'+
		'-webkit-mask-image:linear-gradient(#fff);'+
		'mask-image:linear-gradient(#fff);'+
		'-webkit-mask-image:none;'+
		'mask-image:none;'+
		`}`
	},
	'vendor prefixing V': {
		sample: `
			display :flex!important;
			justify-content: space-between;
			align-self: flex-start;
			align-self: flex-end;
		`,
		expected: ``+
		`.user{`+
			`display :-webkit-box!important;`+
			`display :-webkit-flex!important;`+
			`display :-ms-flexbox!important;`+
			`display :flex!important;`+
			`-webkit-box-pack:justify;`+
			`-webkit-justify-content:space-between;`+
			`-ms-flex-pack:justify;`+
			`justify-content:space-between;`+
			`-webkit-align-self:flex-start;`+
			`-ms-flex-item-align:start;`+
			`align-self:flex-start;`+
			`-webkit-align-self:flex-end;`+
			`-ms-flex-item-align:end;`+
			`align-self:flex-end;`+
		`}`
	},
	'vendor prefixing VI': {
		sample: `
			clip-path: none;
			mask-image: none;
			justify-items: center;

			flex-grow: none;
			flex-shrink: none;
			flex-basis: none;

			box-decoration-break: none;
			box-sizing:none;
		`,
		expected: ``+
		`.user{`+
			`-webkit-clip-path:none;`+
			`clip-path:none;`+

			`-webkit-mask-image:none;`+
			`mask-image:none;`+
			`justify-items:center;`+

			`-webkit-box-flex:none;`+
			`-webkit-flex-grow:none;`+
			`-ms-flex-positive:none;`+
			`flex-grow:none;`+

			`-webkit-flex-shrink:none;`+
			`-ms-flex-negative:none;`+
			`flex-shrink:none;`+

			`-webkit-flex-basis:none;`+
			`-ms-flex-preferred-size:none;`+
			`flex-basis:none;`+

			`-webkit-box-decoration-break:none;`+
			`box-decoration-break:none;`+

			`box-sizing:none;`+
		`}`
	},
	'vendor prefixing VII': {
		sample: `
			min-zoom: 0;
			width: auto;
			width: unset;
			width: initial;
			width: inherit;
			width: 10;
			width: min();

			width: var(--foo-content);
			width: var(-content);
			width: var(--max-content);
			width: --max-content;

			width: fit-content;
			min-width: max-content;
			max-width: min-content;
			height: fill-available;
			max-height: fit-content;
			width: stretch;
			width: stretch !important;
			min-block-size:max-content;
			min-inline-size:max-content;
		`,
		expected: ``+
		`.user{`+
			`min-zoom:0;`+
			`width:auto;`+
			`width:unset;`+
			`width:initial;`+
			`width:inherit;`+
			`width:10;`+
			`width:min();`+

			'width:var(--foo-content);'+
			'width:var(-content);'+
			`width:var(--max-content);`+
			`width:--max-content;`+

			`width:-webkit-fit-content;`+
			`width:-moz-fit-content;`+
			`width:fit-content;`+

			`min-width:-webkit-max-content;`+
			`min-width:-moz-max-content;`+
			`min-width:max-content;`+

			`max-width:-webkit-min-content;`+
			`max-width:-moz-min-content;`+
			`max-width:min-content;`+

			`height:-webkit-fill-available;`+
			`height:-moz-available;`+
			`height:fill-available;`+

			`max-height:-webkit-fit-content;`+
			`max-height:-moz-fit-content;`+
			`max-height:fit-content;`+

			`width:-webkit-fill-available;`+
    	`width:-moz-available;`+
    	`width:stretch;`+

    	`width:-webkit-fill-available !important;`+
    	`width:-moz-available !important;`+
    	`width:stretch !important;`+

    	`min-block-size:-webkit-max-content;`+
    	`min-block-size:-moz-max-content;`+
    	`min-block-size:max-content;`+

    	`min-inline-size:-webkit-max-content;`+
    	`min-inline-size:-moz-max-content;`+
    	`min-inline-size:max-content;`+
		`}`
	},
	'vendor prefixing VIII': {
		sample: `
			background:image-set(url(foo.jpg) 2x);
			background-image:image-set(url(foo.jpg) 2x);
		`,
		expected: ``+
		`.user{`+
			`background:-webkit-image-set(url(foo.jpg) 2x);`+
			`background:image-set(url(foo.jpg) 2x);`+
			`background-image:-webkit-image-set(url(foo.jpg) 2x);`+
			`background-image:image-set(url(foo.jpg) 2x);`+
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
				cubic-bezier(1,2,4)
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
				reverse
				alternate-reverse
				step-start
				step-end
				step-end-something
				steps(4,end)
				`.replace(/\n|\r| +/g, ' ') +
				`;
			}
			span {
  			animation-duration: 0.6s;
  			animation-name: slidein;
  			animation-iteration-count: infinite;
  			animation-timing-function: cubic-bezier(0.1,0.7,1.0,0.1);
	    }

	    input {
	    	animation-name: anim1, anim2;
	    	animation-name: none;
	    }
		`,
		expected:
		/*
			this also tests the parses ability to find and namespace
			the animation-name in a grouped animation: property
		*/
		`.user h2{`+
			`-webkit-animation:initial inherit unset --invalid;animation:initial inherit unset --invalid;}`+
		`.user span{`+
			`-webkit-animation:_name_-user -name-user %name 1name __name-user;`+
			`animation:_name_-user -name-user %name 1name __name-user;`+
		`}`+
		`.user div{`+
			`-webkit-animation-name:bounce-user;animation-name:bounce-user;`+
		`}`+
		`.user h1{`+
			`-webkit-animation:0.6s .6ms 200ms infinite something-ease-user `+
			`infinite-fire-user slidein-user cubic-bezier() cubic-bezier(1,2,4) `+
			`ease-in-out ease ease-inOuter-user linear alternate normal forwards both `+
			`none ease-in ease-out backwards running paused reverse alternate-reverse `+
			`step-start step-end step-end-something-user steps(4,end);`+
			`animation:0.6s .6ms 200ms infinite something-ease-user infinite-fire-user `+
			`slidein-user cubic-bezier() cubic-bezier(1,2,4) ease-in-out ease `+
			`ease-inOuter-user linear alternate normal forwards both none ease-in `+
			`ease-out backwards running paused reverse alternate-reverse step-start `+
			`step-end step-end-something-user steps(4,end)`+
		`;}`+
		`.user span{`+
			`-webkit-animation-duration:0.6s;animation-duration:0.6s;`+
			`-webkit-animation-name:slidein-user;animation-name:slidein-user;`+
			`-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;`+
			`-webkit-animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);`+
			`animation-timing-function:cubic-bezier(0.1,0.7,1.0,0.1);`+
		`}`+
		`.user input{`+
			`-webkit-animation-name:anim1-user,anim2-user;`+
			`animation-name:anim1-user,anim2-user;`+
			`-webkit-animation-name:none;`+
			`animation-name:none;`+
		`}`
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
				animation:slidein 3s ease infinite;
			}
			@keyframes slidein {
				to { transform:translate(20px); }
			}
		`,
		expected: `.user{-webkit-animation:slidein-user 3s ease infinite;animation:slidein-user 3s ease infinite;}`+
			`@-webkit-keyframes slidein-user`+
			`{to{-webkit-transform:translate(20px);-ms-transform:translate(20px);transform:translate(20px);}}`+

			`@keyframes slidein-user`+
			`{to{-webkit-transform:translate(20px);-ms-transform:translate(20px);transform:translate(20px);}}`
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
			`{to{-webkit-transform:translate(20px);-ms-transform:translate(20px);transform:translate(20px);}}`+

			`@keyframes slidein`+
			`{to{-webkit-transform:translate(20px);-ms-transform:translate(20px);transform:translate(20px);}}`
	},
	'nested': {
		sample: `
			:global(div) {
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
		`,
		expected: `div h2{color:red;}`+
		`div h2 h3{color:blue;}`+
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
	},
	'class namespace': {
		selector: ' .foo',
		sample: `h1 {animation:slide 1s;}`,
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
		h1 {animation:slide 1s;}
		@keyframes name {
			0: {
				top:0
			}
		}
		`,
		expected: ``+
		`h1{-webkit-animation:slide 1s;animation:slide 1s;}`+
		`@-webkit-keyframes name{0:{top:0;}}@keyframes name{0:{top:0;}}`
	},
	'edge cases': {
		 sample: `
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
		 `,
		 expected: `@media (min-width:537px){`+
		 	`.user{border-bottom:4px solid red;}}`+
		 	`.user::-webkit-input-placeholder{color:pink;}`+
		 	`.user::-moz-placeholder{color:pink;}`+
		 	`.user:-ms-input-placeholder{color:pink;}`+
		 	`.user::placeholder{color:pink;}`+
		 	`.user .a{color:'red';}`+
		 	`.user .b{color:"red";}`+
		 	`.user .a{color:red;}.user [role=button]{color:red;}`+
		 	`.user .b{padding:30 3;}`+
		 	`.user .c{v-text-anchor:middle;}`
	},
	// note the spaces after ;
	'whitespace cascade true': {
		sample: `
			html {
				width:0;
			}
		`,
		expected: `.user html{width:0;}`
	},
	// note the spaces after ;
	'whitespace cascade false': {
		options: {
			cascade: false
		},
		sample: `
			html{
				width:0;
			}
		`,
		expected: `html.user{width:0;}`
	},
	'cascade isolation simple': {
		options: {
			cascade: false
		},
		sample: `
			[data-id=foo] {
				color:red;
			}

			p {
				color:red;
			}

			p a {
				color:red;
			}

			p:hover {
			  color:red;
			}

			p::before {
			  color:red;
			}

			:hover {
			  color:red;
			}

			::before {
			  color:red;
			}

			:hover p {
			  color:red;
			}

			html.something & {
				color:red;
			}

			.class #id {
				color:red;
			}

			& {
				color:red
			}

			.a.b .c {
				color:red;
			}

			:nth-child(2n),
			:nth-last-child(2n),
			:nth-of-type(2n) {
				color:red;
			}

			a:not(:focus):disabled {
				color:red;
			}
			a:not(:focus) :disabled {
				color:red;
			}
		`,
		expected: ``+
		`[data-id=foo].user{color:red;}`+
		`p.user{color:red;}`+
		`p.user a.user{color:red;}`+
		`p.user:hover{color:red;}`+
		`p.user::before{color:red;}`+
		`.user:hover{color:red;}`+
		`.user::before{color:red;}`+
		`.user:hover p.user{color:red;}`+
		'html.something.user .user{color:red;}'+
		`.class.user #id.user{color:red;}`+
		`.user{color:red;}`+
		`.a.b.user .c.user{color:red;}`+
		`.user:nth-child(2n),.user:nth-last-child(2n),.user:nth-of-type(2n){color:red;}`+
		`a.user:not(:focus):disabled{color:red;}`+
		`a.user:not(:focus) .user:disabled{color:red;}`
	},
	'cascade isolation complex': {
		options: {
			cascade: false
		},
		sample: `
			.List :global(>) :global(*) {
			  margin-top:10px;
			}

			.List :global(*) :global(+) :global(*) {
			  margin-top:10px;
			}

			.List :global(> *) {
			  margin-top:10px;
			}

			.List :global(* + *) {
			  margin-top:10px;
			}

			:global(.foo #bar > baz) {
				color:red;
			}

			div :global(.react-select .some-child-of-react-select) {
				color:red;
			}

			.root > :global(*):not(header) {
			  color:red;
			}

			a:matches( a +b foo:hover :global(marquee) a) > :hover {
			  color:red;
			}
		`,
		expected: ``+
		`.List.user >*{margin-top:10px;}`+
		`.List.user *+*{margin-top:10px;}`+
		`.List.user > *{margin-top:10px;}`+
		`.List.user * + *{margin-top:10px;}`+
		`.foo #bar > baz{color:red;}`+
		`div.user .react-select .some-child-of-react-select{color:red;}`+
		`.root.user>*:not(header){color:red;}`+
		`a.user:matches(a.user+b.user foo.user:hover marquee a.user)>.user:hover{color:red;}`
	},
	'cascade isolation @at-rules': {
		options: {
			cascade: false
		},
		sample: `
			@keyframes hahaha {
			  from { top:0 }
			  to { top:100 }
			}

			span {}
			      @media (min-width:480px) { div { color:red } }
		`,
		expected: ``+
		`@-webkit-keyframes hahaha-user{from{top:0;}to{top:100;}}`+
		`@keyframes hahaha-user{from{top:0;}to{top:100;}}`+
		`@media (min-width:480px){div.user{color:red;}}`
	},
	'cascade isolation nesting': {
		options: {
			cascade: false
		},
		sample: `
			color:red;

			h1 {
				:global(section) {
					color:red
				}
			}

			h1 {
				h2 {
					color:red
				}
			}

			div, span {
				h1 {
					color:red
				}
			}

			span {
				&:hover {
					color:red
				}
			}

			[data-id=foo] {
				&:hover {
					color:red
				}
			}
		`,
		expected: ``+
		`.user{color:red;}`+
		`h1.user section{color:red;}`+
		`h1.user h2.user{color:red;}`+
		`div.user h1.user,span.user h1.user{color:red;}`+
		`span.user:hover{color:red;}`+
		`[data-id=foo].user:hover{color:red;}`
	},
	'isolation edge cases': {
		options: {
			cascade: false
		},
		sample: `
			width:0;

			@media(screen) {
			  color:red;
			}

			h1 {
				color:red;
			}

			.a
			:global(.b
					.c) .d {
			  color:red;
			}

			.foo :global(path),
			.bar
			  :global(path) {
			  stroke: red;
			}

			@keyframes hahaha {
			  0%,
			  1%{t:0}
			}

			:global(.a)
			.b
			.c{background:red}
		`,
		expected: ``+
		`.user{width:0;}`+
		`@media(screen){.user{color:red;}}`+
		`h1.user{color:red;}`+
		`.a.user .b .c .d.user{color:red;}`+
		`.foo.user path,.bar.user path{stroke:red;}`+
		`@-webkit-keyframes hahaha-user{0%,1%{t:0;}}`+
		`@keyframes hahaha-user{0%,1%{t:0;}}`+
		`.a .b.user .c.user{background:red;}`
	},
	'semi-colons': {
		options: {
			semicolon: true
		},
		sample: `
			color:red

			h2 {
				color:blue
				width:0

				h3 {
					display:none
				}
			}
		`,
		expected: ``+
		`.user color:red `+
		`h2 color:blue `+
		`width:0 `+
		`h3{display:none;}`
	},
	'no semi-colons I': {
		sample: `
			color:red

			h2 {
				color:blue
				width:0

				h3 {
					display:none
				}
			}

			div:hover
				{
				color:red
			}
		`,
		expected: ``+
		`.user{color:red;}`+
		`.user h2{color:blue;width:0;}`+
		`.user h2 h3{display:none;}`+
		`.user div:hover{color:red;}`
	},
	'no semi-colons II': {
		options: {
			semicolon: false
		},
		sample: `
			color:red
			color:red

			h1:hover,
			h2:hover
			,
			h3
			{
				color:red
				width:0/
					2
			}

			h1 {
				grid-template-areas:
					"header header header"
					'. main .';
			}

			h1 {
				width:calc(20px)
								20px;
			}
		`,
		expected: ``+
		`.user{color:red;color:red;}`+
		`.user h1:hover,.user h2:hover,.user h3{color:red;width:0/ 2;}`+
		`.user h1{grid-template-areas: "header header header" '. main .';}`+
		`.user h1{width:calc(20px) 20px;}`
	},
	'no semi-colon III': {
		sample: `
			grid:
			  50%
			  50%

			grid:
				50%
				/
			  50%

			grid-template-areas: "a b b"
			                     "a c d";

			background-image: center
			  center no-repeat;

			color:red;

			grid-template-columns: minmax(100px, max-content)
			                       repeat(auto-fill, 200px) 20%;
			grid-template-columns: [linename1] 100px [linename2]
			                       repeat(auto-fit, [linename3 linename4] 300px)
			                       100px;
			grid-template-columns: [linename1 linename2] 100px
			                       repeat(auto-fit, [linename1] 300px) [linename3];
		`,
		expected: ``+
		`.user{`+
			`grid: 50% 50%;`+
			`grid: 50% / 50%;`+
			`grid-template-areas:"a b b" "a c d";`+
			`background-image:center center no-repeat;`+
			`color:red;`+
			`grid-template-columns:minmax(100px,max-content) repeat(auto-fill,200px) 20%;`+
			`grid-template-columns:[linename1] 100px [linename2] repeat(auto-fit,[linename3 linename4] 300px) 100px;`+
			`grid-template-columns:[linename1 linename2] 100px repeat(auto-fit,[linename1] 300px) [linename3];`+
		`}`
	},
	'multiline declaration': {
		sample: `
			html {
			  background-image:
			    linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
			    url(/static/background.svg);
			}
		`,
		expected: ``+
		`.user html{background-image: linear-gradient(0deg,rgba(255,255,255,0.8),rgba(255,255,255,0.8)), url(/static/background.svg);}`
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
		`,
		expected: `.user a a a a a a a a a a a a{color:red;}`
	},
	'nesting @media multiple levels': {
		sample: `
			div {
				@media {
					a {
						color:red;

						@media {
							h1 {
								color:red;
							}
						}
					}
				}
			}
		`,
		expected: `@media{.user div a{color:red;}@media{.user div a h1{color:red;}}}`
	},
	'compress': {
		options: {
			compress: true
		},
		sample: `
		  background-image:
		    linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
		    url(/static/background.svg);
			width: calc(20% + 503px)
		`,
		expected: ``+
		`.user{`+
		`background-image:linear-gradient(0deg,rgba(255,255,255,0.8),rgba(255,255,255,0.8)), url(/static/background.svg);`+
		`width:calc(20% + 503px)`+
		`}`+
		``
	},
	'disable global': {
		options: {
			global: false
		},
		sample: `:global(h1) {color:red;}`,
		expected: `.user :global(h1){color:red;}`
	},
	'middleware contracts': {
		options: {
			plugins: function (context, content, selector, parents, line, column, length, ns, depth, at) {
				if (typeof ns !== 'number') {
					throw 'ns argument not passed to middleware'
				}

				if (typeof depth !== 'number') {
					throw 'depth argument not passed to middleware'
				}

				if (typeof at !== 'number') {
					throw 'at argument not passed to middleware'
				}

				switch (context) {
					case -1: if (content.indexOf('.user') > -1) throw 'not prep context'; break
					case -2: if (content.indexOf('.user') === -1) throw 'not post context'; break
					case 1: return content+'/* property */';
					case 2: return content+'/* block */';
					case 3: return content+'/* at-rule */'
				}
			}
		},
		sample: `
			color:blue;
			h1 { color:red; }
			@media {
				color:red;
			}
		`,
		expected: ``+
		`.user{color:blue/* property */;/* block */}`+
		`.user h1{color:red/* property */;/* block */}`+
		`@media{.user{color:red/* property */;/* block */}/* at-rule */}`
	},
	'middleware remove property': {
		options: {
			plugins: function (context, content) {
				switch (context) {
					// i.e extract and polyfil custom properties
					case 1: if (content.indexOf('--') > -1) return '';
				}
			}
		},
		sample: `
		--foo:'value';
		color:red;
		`,
		expected: `.user{color:red;}`
	},
	'middleware remove block': {
		options: {
			plugins: function (context, content, selector) {
				switch (context) {
					// i.e extract and polyfill @apply/custom selectors
					case 2: if (selector[0].indexOf('--') > -1) return '';
				}
			}
		},
		sample: `
		--foo: {
			color:red;
		}

		div {
			color:red;
		}
		`,
		expected: `.user div{color:red;}`
	},
	'middleware post process': {
		options: {
			plugins: [
				function (ctx, cont) {
					if (ctx===-2) {
						return cont+'/*a*/'
					}
				}
			]
		},
		sample: `color:red;`,
		expected: ``+
		`.user{color:red;}/*a*/`
	},
	'multiple middlewares': {
		options: {
			plugins: [
				function (ctx, cont) {
					if (ctx===1) {
						return cont+'/*a*/'
					}
				},
				function (ctx, cont) {
					if (ctx===1) {
						return cont+'/*b*/'
					}
				}
			]
		},
		sample: `color:red;`,
		expected: ``+
		`.user{color:red/*a*//*b*/;}`
	},
	'new instance': {
		reset: false,
		setup: function (stylis) {
			var instance = new stylis({compress: true});

			if (instance === stylis)
				throw 'could not create a new instance'

			// this should prevent the previous test from affeting
			// this test if every works as expected
			return instance
		},
		sample: `color:red;`,
		expected: `.user{color:red}`
	},
	'position fixed without prefixing [issue#53]': {
		sample: `
			position: fixed;
		`,
		expected: `.user{`+
		'position:fixed;'+
		`}`
	},
	'disable prefixing': {
		sample: `
				transform: none;
				animation: none;
				@keyframes name {0: {color:red;}}
				input::read-only, h1{color:red;}
		`,
		expected: `
			.user{`+
				`transform:none;`+
				`animation:none;`+
			`}`+
			`@keyframes name-user{`+
				`0:{color:red;}`+
			`}`+
			`.user input::read-only,.user h1{`+
				`color:red;`+
			`}
		`,
		options: {
			prefix: false
		}
	},
	'disable prefixing dynamically': {
		sample: `
				display: flex;
				transform: none;
				animation: none;
				@keyframes name {0: {color:red;}}
				input::read-only, h1{color:red;}
		`,
		expected: `
			.user{`+
				`display:flex;`+
				`-webkit-transform:none;`+
				`-ms-transform:none;`+
				`transform:none;`+
				`animation:none;`+
			`}`+
			`@keyframes name-user{`+
				`0:{color:red;}`+
			`}`+
			`.user input::read-only,.user h1{`+
				`color:red;`+
			`}
		`,
		options: {
			prefix: function (key, value, context) {
				if (typeof context !== 'number')
					throw 'fail'

				switch (key) {
					case 'transform':
						return true
					case 'disable':
						if (value !== 'flex')
							throw 'fail'
					default:
						return false
				}
			}
		}
	},
	'preserve empty selectors option': {
		sample: `h1 {}`,
		expected: `.user h1{}`,
		options: {
			preserve: true
		}
	},
	'noop tail I': {
		sample: `color:red/**/`,
		expected: `.user{color:red;}`
	},
	'noop tail II': {
		sample: `color:red//`,
		expected: `.user{color:red;}`
	},
	'noop tail III': {
		sample: `color:red[]`,
		expected: `.user{color:red[];}`
	},
	'noop tail IV': {
		sample: `color:red()`,
		expected: `.user{color:red();}`
	},
	'noop tail V': {
		sample: `color:red''`,
		expected: `.user{color:red'';}`
	},
	'noop tail VI': {
		sample: `color:red""`,
		expected: `.user{color:red"";}`
	},
	'noop tail VII': {
		sample: `h1{color:rgb([`,
		expected: `.user h1{color:rgb([;}`
	},
	'noop tail VIII': {
		sample: `h1{color:red/**}`,
		expected: `.user h1{color:red;}`
	},
	'comments(context character I)': {
		sample:`.a{color:red;/* } */}`,
		expected:`.user .a{color:red;}`
	},
	'comments(context character II)': {
		sample:`.a{color:red;/*}*/}`,
		expected:`.user .a{color:red;}`
	},
	'comments(context character III)': {
		sample:`.a{color:red;/*{*/}`,
		expected:`.user .a{color:red;}`
	},
	'comments(context character IV)': {
		sample:`.a{/**/color:red}`,
		expected:`.user .a{color:red;}`
	},
	'comments(context character V)': {
		sample:`.a{color:red;/*//color:blue;*/}`,
		expected:`.user .a{color:red;}`
	},
	'comments(context character VI)': {
		sample: `background: url("img}.png");.a {background: url("img}.png");}`,
		expected: `.user{background:url("img}.png");}.user .a{background:url("img}.png");}`
	},
	'comments(context character VII)': {
		sample: `background: url(img}.png);.a {background: url(img}.png);}`,
		expected: `.user{background:url(img}.png);}.user .a{background:url(img}.png);}`
	},
	'comments(context character VIII)': {
		sample: `background: url[img}.png];.a {background: url[img}.png];}`,
		expected: `.user{background:url[img}.png];}.user .a{background:url[img}.png];}`
	}
};

if (typeof module === 'object') {
	module.exports = spec;
}
