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


var browser = this.window;
var stylis = browser ? this.stylis : require('../stylis.js');
var spec = browser ? this.spec : require('./spec.js');

/**
 * run tests
 * @return {Object} tests
 */
function run (tests, fn) {
	var start = Date.now();

	var passed = [];
	var failed = [];
	var temp;

	var format = {
		reset: browser ? '' : '\x1b[0m',
		green: browser ? '' : '\x1b[32m',
		red: browser ? '' : '\x1b[31m',
		yellow: browser ? '' : '\x1b[33m',
		underline: browser ? '' : '\x1b[4m',
		dim: browser ? '' : '\x1b[2m',
		bold: browser ? '' : '\x1b[1m',
		clear: browser ? '' : '\x1Bc\n'
	};

	for (var name in tests) {
		var test = tests[name];

		var sample = test.sample.trim();
		var expected = test.expected.trim();
		var options = test.options || {};

		if (options.reset !== false) {
			fn.use(null);
		}

		if (options.plugins) {
			fn.use(options.plugins);
		}

		if (options.keyframe !== void 0) {
			fn.set({keyframe: options.keyframe})
		}

		if (options.cascade !== void 0) {
			fn.set({cascade: options.cascade})
		}

		if (options.semicolon !== void 0) {
			fn.set({semicolon: options.semicolon})
		}

		if (options.compress !== void 0) {
			fn.set({compress: options.compress})
		}

		if (options.global !== void 0) {
			fn.set({global: options.global})
		}

		if (options.prefix !== void 0) {
			fn.set({prefix: options.prefix})
		}

		if (options.preserve !== void 0) {
			fn.set({preserve: options.preserve})
		}

		try {
			if (test.setup) {
				temp = fn
				fn = test.setup(fn)
			}

			var result = fn(
				test.selector !== void 0 ? test.selector : '.user',
				sample
			);

			if (temp !== void 0) {
				fn = temp
				temp = void 0
			}
		} catch (err) {
			result = err+''
		}

		if (options.cascade !== void 0) {
			fn.set({cascade: true})
		}

		if (options.keyframe !== void 0) {
			fn.set({keyframe: true})
		}

		if (options.semicolon !== void 0) {
			fn.set({semicolon: false})
		}

		if (options.compress !== void 0) {
			fn.set({compress: false})
		}

		if (options.global !== void 0) {
			fn.set({global: true})
		}

		if (options.prefix !== void 0) {
			fn.set({prefix: false})
		}

		if (options.preserve !== void 0) {
			fn.set({preserve: false})
		}

		var control = /[\0\r\n\f]/g.test(result)

		if (result !== expected || control) {
			// log why it failed
			console.log(result.length, 'failed: ', name, '\n\n', result)
			console.log(expected.length, 'expected: ', '\n\n', expected, '\n\n---------------\n\n')
			console.log(control)

			failed.push(name);

			if (browser) {
				break;
			}
		} else {
			passed.push(name);
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

run(spec, stylis)
