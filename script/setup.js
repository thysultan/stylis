import {expect} from 'chai'
import {describe, test} from 'mocha'

const {assign} = Object
const that = () => typeof globalThis == 'object' ? globalThis :
	typeof global == 'object' ? global :
		typeof window == 'object' ? window :
			typeof self == 'object' ? self : Function('return this')()

assign(that(), {expect, describe, test, globalThis: that()})
