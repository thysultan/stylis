// <reference path="../stylis.d.ts" />

import * as Stylis from '../'

const stylis = new Stylis()

stylis.set()
stylis.use(function plugin (context, content, selectors, parents, line, column, length) {
	this('', '')
})

stylis.use(function foo () {

})
