(function () {
	var editor = document.getElementById('editor');
	var output = document.getElementById('output');

	// simple syntax highlighter and formatter
	var format = {
		tabs: function (match) {
			return '\t' + match;
		},
		newlines: function (match, group) {
			return group + (group === '}' ? '\n\n' : '\n');
		},
		value: function (match, group) {
			return ': <span class=value>' + group.trim() + '</span>;';
		},
		selector: function (match, group) {
			return '<span class=selector>' + group.trim() + '</span> {\n';
		},
		block: function (match, group1, group2, group3) {
			return group1 + group2.split('\n').join('\n\t') + group3;
		},
		string: function (match) {
			return '<span class=string>'+ match.trim() +'</span>';
		}
	};

	// update output preview
	function update (e) {
		// tab indent
		if (e.keyCode === 9) {
			e.preventDefault();

         var selection = window.getSelection();
         var range = selection.getRangeAt(0);
         var text = document.createTextNode('\t');

         range.deleteContents();
         range.insertNode(text);
         range.setStartAfter(text);
         selection.removeAllRanges();
         selection.addRange(range);

         return;
		}

		var namespace = '.scope';
		var raw = editor.textContent;
		var pragma = /\/\* @scope (.*?) \*\//g.exec(raw);

		if (pragma != null) {
			namespace = pragma[1].trim();
		}

		var processed = stylis(namespace, raw);

		// apply formatting
		processed = processed.replace(/(;|\})/g, format.newlines);
		processed = processed.replace(/(.*?)\{/g, format.selector);
		processed = processed.replace(/:(.*);/g, format.value);
		processed = processed.replace(/^.*;$/gm, format.tabs);
		processed = processed.replace(/\}\n\n\}/g, '}\n}');
		processed = processed.replace(/(.*@.*\{)([^\0]+\})(\n\})/g, format.block);
		processed = processed.replace(/['"`].*?['"`]/g, format.string);

		output.innerHTML = processed;
	}

	editor.addEventListener('keydown', update);
	editor.addEventListener('input', update);

	update({keyCode: 219});
})();
