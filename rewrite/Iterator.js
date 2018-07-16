const {fromCharCode} = String

function iterator (value) {
	var caret = 0, line = 0, column = 0, code = 0

	return {
		read: fromCharCode,
  	next: function next () {
  		if (++column, code = value.charCodeAt(caret++) === 10)
  			++line, column = 0
			return code
  	}
	}
}
