/**
 * tester runner
 *
 * excutes tests given an object describing the tests
 * based on sample input vs expected output
 * if output === expected output, test passed
 * else test failed
 *
 * log format
 *
 * ------
 * 
 * Tests Passed #
 *
 * ...
 *
 * [Finnished In] #ms
 * 
 * Tests Failed #
 *
 * ...
 *
 * [Finnished In] #ms
 */


/**
 * define tests
 * @type {Object}
 */
var tests = {
	'flat': {
		name: 'flat',
		sample: `
			color: 20px;
			font-size: 20px;
			transition: all;
		`,
		expected: `.user {color: 20px;font-size: 20px;-webkit-transition: all;transition: all;}`
	},
	'namespace': {
		name: 'namespace',
		sample: `
			{
				color: blue;
			}
		`,
		expected: `.user {color: blue;}`
	},
	'globals': {
		name: '@global/:global',
		sample: `
			@global {
				body {
					background: yellow;
				}
			}
			:global(body) {
				background: yellow;
			}
		`,
		expected: 'body {background: yellow;}body {background: yellow;}'
	},
	'comment': {
		name: 'comments',
		sample: `
			// line comment

			// color: red;

			/**
			 * removes block comments and line comments
			 */
		`,
		expected: ''
	},
	'&': {
		name: '&',
		sample: `
			&{
				color: blue;
			}
		`,
		expected: '.user{color: blue;}'
	},
	'&:before': {
		name: '&:before',
		sample: `
			&:before{
				color: blue;
			}
		`,
		expected: '.user:before{color: blue;}'
	},
	'@media': {
		name: '@media',
		sample: `
			@media (max-width: 600px) {
				color: red;	
				h1 { color: red; }
				display: none;
			}
		`,
		expected: `@media (max-width: 600px) {.user h1 {color: red;}.user {color: red;display: none;}}`
	},
	'multiple selectors': {
		name: 'multiple selectors',
		sample: `
			span, h1 {
				color:red;
			}
			h1, &:after, &:before {
				color:red;
			}
		`,
		expected: `.user span,.user h1 {color:red;}.user h1,.user:after,.user:before {color:red;}`
	},
	'prefixer': {
		name: 'prefixer',
		sample: `
			& {
			    transform: rotate(30deg);
			}
		`,
		expected: `.user {-webkit-transform: rotate(30deg);-ms-transform: rotate(30deg);transform: rotate(30deg);}`
	},
	'keyframes': {
		name: 'keyframes',
		sample: `
			&{
				animation: slidein 3s ease infinite;
			}
			@keyframes slidein {
				to { transform: translate(20px); }
			}
		`,
		expected: `.user{-webkit-animation:userslidein 3s ease infinite;animation:userslidein 3s ease infinite;}`+

			`@-webkit-keyframes userslidein `+
			`{to {-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`+

			`@keyframes userslidein `+
			`{to {-webkit-transform: translate(20px);-ms-transform: translate(20px);transform: translate(20px);}}`
	},
	':host': {
		name: ':host',
		sample: `
			color: red;
			& { color: red; }
			:host { color: red; }
			:hover { color: red; }

			:host(.fancy) { color: red; }
			:host-context(body) { color: red; }
			:root { color: red; }
		`,
		expected: '.user {color: red;}.user {color: red;}.user:hover {color: red;}.user.fancy {color: red;}'+
			'body .user {color: red;}.user:root {color: red;}.user {color: red;}'
	},
	'[title="a,b"]': {
		name: '[title="a,b"]',
		sample: `
			[title="a,b,c, something"], h1 {
		  		color: red
			}
		`,
		expected: `.user [title="a,b,c, something"],.user h1 {color: red}`
	},
	'nested': {
		name: 'nested',
		sample: `
			h1, div {
				color: red;

				h2, &:before {
					color: red;
				}

				color: blue;

				header {
					font-size: 12px;
				}
			}
		`,
		expected: '.user h1,.user div {color: red;color: blue;}.user h1 h2,.user h1:before,.user div h2,'+
		'.user div:before{color: red;}.user h1 header,.user div header{font-size: 12px;}'
	},
	'strings': {
		name: 'strings',
		sample: `
			.foo:before {
		  	content: ".hello {world}"
			}
		`,
		expected: `.user .foo:before {content: ".hello {world}"}`
	},
};


var browser = this && !!this.window;
var stylis = browser ? this.stylis : require('../stylis.js');

/**
 * run tests
 * @return {Object} tests
 */
function run (tests) {
	var start = Date.now();

	var passed = [];
	var failed = [];

	var format = {
		reset:     browser ? '' : '\x1b[0m',
		green:     browser ? '' : '\x1b[32m',
		red:       browser ? '' : '\x1b[31m',
		yellow:    browser ? '' : '\x1b[33m',
		underline: browser ? '' : '\x1b[4m',
		dim:       browser ? '' : '\x1b[2m',
		bold:      browser ? '' : '\x1b[1m',
		clear:     browser ? '' : '\x1Bc\n'
	};

	for (var name in tests) {
		var test = tests[name];

		var name = test.name.trim();
		var sample = test.sample.trim();
		var expected = test.expected.trim();

		var result = stylis('.user', sample, true, true);

		(result === expected ? passed : failed).push(name);

		if (result !== expected) {
			// log why it failed
			console.log('failed:\n'+ result);
			console.log('expected:\n'+ expected);
		}
	}

	var end = '\n\n'+format.reset+'[Finnished In] '+(Date.now()-start)+'ms\n';

	// start test logger
	console.log('\n------');

	// passed
	console.log(
		format.bold+'\nTests Passed '+passed.length+format.reset+format.green + '\n\n'+passed.join('\n')+end
	);

	// failed
	console.log(
		format.bold+'Tests Failed '+failed.length+format.reset+format.red + 
		'\n\n'+(failed.join('\n') || 'no failed tests')+end
	);

	// if failed trigger exit
	if (failed.length) {
		if (browser) {
			console.error(new Error('^^^'));
		} else {
			process.exit(1);
		}
	}
}


/**
 * execute tests
 */
run(tests);
