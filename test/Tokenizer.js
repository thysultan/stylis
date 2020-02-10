import {alloc, dealloc, tokenize} from "../index.js"

const stylis = string => dealloc(tokenize(alloc(string)))

describe('Tokenizer', () => {
  test('tokenize', () => {
  	expect(stylis('h1 h2 (h1 h2) 1 / 3 * 2 + 1 [1 2] "1 2" a')).to.deep.equal(['h1', 'h2', '(h1 h2)', '1', '/', '3', '*', '2', '+', '1', '[1 2]', '"1 2"', 'a'])
  })
})
