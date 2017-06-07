/// <reference path="../stylis.d.ts" />

stylis.use([()=>{}])
stylis.set({
	global: true
})

stylis.use(function plugin (context, content, selectors, parents, line, column, length) {
	this('', '')
})
