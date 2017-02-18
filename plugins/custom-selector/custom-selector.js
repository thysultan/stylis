(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	}
	else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} 
	else {
		window.customSelectors = factory(window);
	}
}(function (window) {
	var regex = /(:--[^:\s]*).*/g;
	var vars = {};
	
	function process (match, group) {
		// everything after the first space(if it exists) are sibling selectors
		var indexOf = match.indexOf(' ');
		var sibling = '';

		// sibling selectors exists i.e `div` in :--heading div {}
		if (indexOf !== -1) {
			sibling = ' ' + match.substring(indexOf + 1).trim();

			// remove sibling selectors
			match = match.substring(0, indexOf);
		}

		// retrieve custom-selector value
		var selector = vars[group] || '';

		// split parts
		var parents = selector.split(',');
		var children = match.replace(group, '').replace(regex, process).split(',');

		// if a custom selector :--heading holds `h1, h2` and :--enter holds `:hover, :active`
		// :--heading:--enter should yield `h1:hover, h1:active, h2:hover, h2:active`
		for (var i = 0; i < parents.length; i++) {
			selector = parents[i].trim();
			parents[i] = '';

			for (var j = 0; j < children.length; j++) {
				match = children[j].trim();

				parents[i] += (
					(j === 0 ? '' : ',') + 
					selector + 
					(match.charCodeAt(0) === 58 ? match : (match.length === 0 ? '' : ' ') + match) + 
					sibling
				);
			}
		}

		return parents.join(',');
	}

	return function (ctx, str) {
		// @, c
		if (ctx === 2 && str.charCodeAt(0) === 64 && str.charCodeAt(1) === 99) {
			str = str.substring(16).trim();

			var indexOf = str.indexOf(' ');
			var key = str.substring(0, indexOf);
			var value = str.substring(indexOf, str.length - 1).trim();

			vars[key] = value;

			return '';
		}

		// :, -, -
		if (ctx === 1 && str.charCodeAt(0) === 58 && str.charCodeAt(1) === 45 && str.charCodeAt(2) === 45) {
			return str.replace(regex, process);
		}

		// flush store
		if (ctx === 6) {
			vars = {};
		}
	}
}));