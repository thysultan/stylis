import {tokenize} from "../index.js"

describe('Tokenizer', () => {
  test('tokenize', () => {
    expect(tokenize(`h1 h2 (h1 h2) 1 / 3 * 2 + 1 [1 2] "1 2" a`)).to.deep.equal([
      'h1', ' ', 'h2', ' ', '(h1 h2)', ' ', '1', ' ', '/', ' ', '3', ' ', '*', ' ', '2', ' ', '+', ' ', '1', ' ', '[1 2]', ' ', '"1 2"', ' ', 'a'
    ])

    expect(tokenize(`:global([data-popper-placement^='top'])`)).to.deep.equal([
      `:`, `global`, `([data-popper-placement^='top'])`
    ])
  })
})
