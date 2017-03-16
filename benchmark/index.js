var postcss = require('postcss');
var stylis = require('stylis');
var csstree = require('css-tree');
var stylus = require('stylus');

var test = `
.foo:before { content: ".hello {world} ' " }

.container { display: flex; padding-bottom: 80px; }
.row { flex: 1; }

.container > .welcome, .wrap { max-width: 600px; width: 100%; margin: 0 auto; padding:0 20px; }
.header { padding-top: 40px; padding-bottom: 30px; min-height: 203px; }
.logo { margin-bottom: 40px; display: block; }
.logo a { display: block; width: 82px; height: 64px; }
`

function bench (fn, name) {
	var start = Date.now();
	var output = fn();
	var end = Date.now();

	console.log((end-start)+'ms', name);
	console.log(output, '\n\n');
}


function benchPostCSS () {
	return postcss.parse(test).toResult().css;
}

function benchStylis () {
	return stylis('', test);
}

function benchCSSTree () {
	return csstree.translate(csstree.parse(test));
}

function benchStylus () {
	var start = Date.now();

	stylus.render(test, function(err, output) {
		var end = Date.now();

		console.log((end-start)+'ms', 'stylus', '\n\n', output);
	});
}

bench(benchStylis, 'stylis');
bench(benchCSSTree, 'css-tree');
bench(benchPostCSS, 'post-css');
benchStylus();

// * denotes without vendor prefixing & namespacing
// 
// 4ms stylis
// 5ms css-tree *
// 7ms post-css *
// 132ms stylus *