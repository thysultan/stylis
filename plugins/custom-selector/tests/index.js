var server = this.window !== this;

var stylis = this.stylis || require('stylis');
var customSelector = this.customSelector || require('../custom-selector.js');

var sample = `
	@custom-selector :--heading h1, h2;
	@custom-selector :--enter :hover, :active;
	@custom-selector :--button a, button;

	:--heading { color: red; }
	:--heading:--enter { color: red; }
	:--button div { display: block; }
	div :--button { display: block; }

`;

var expected = (
	`.ns h1,.ns h2 {color: red;}`+
	`.ns h1:hover,.ns h1:active,.ns h2:hover,.ns h2:active {color: red;}`+
	`.ns a div,.ns button div {display: block;}`+
	`.ns div a,.ns div button {display: block;}`
);

var output = stylis('.ns', sample, false, false, customSelector);

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

	console.log('\n\n'+output);
}
