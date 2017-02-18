var server = this.window !== this;

var stylis = this.stylis || require('stylis');
var customSelectors = this.customSelectors || require('../');

var sample = `
	@custom-selector :--heading h1, h2, h3, h4, h5, h6;

	:--heading {
		color: red;
	}
`;

var expected = `.ns h1,.ns h2,.ns h3,.ns h4,.ns h5,.ns h6 {color: red;}`;

var output = stylis('.ns', sample, false, false, customSelectors);

if (!server) {
	console.log(output+'\n\n');
}

if (output === expected) {
	// passed
	console.log(
		server ? 
			'\x1b[1m\x1b[32m\Tests Passed \n \x1b[0m' : 
			'%cTests Passed'
		,
		!server ? 'color:green;font-weight:bold;' : ''
	);
} else {
	// failed
	console.log(
		server ? 
			'\x1b[1m\x1b[31m\Tests Failed \n \x1b[0m' : 
			'%cTests Failed'
		,
		!server ? 'color:red;font-weight:bold' : ''
	);
}
