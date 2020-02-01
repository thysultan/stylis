import {compile, middleware, prefixer, serialize, stringify} from "../index.js"

describe('prefixer plugin', () => {
  const stylis = string => serialize(compile(`.user{${string}}`), middleware([prefixer, stringify]))

  test('declarations', () => {
    expect(stylis('display:flex;')).to.equal('.user{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}')
  })

  test('@keyframes', () => {
    expect(
      stylis(`
        @keyframes slidein {
          to { transform:translate(20px); }
        }
      `)
    ).to.equal([
      '@-webkit-keyframes slidein{to{-webkit-transform:translate(20px);-moz-transform:translate(20px);-ms-transform:translate(20px);transform:translate(20px);}}',
      '@keyframes slidein{to{-webkit-transform:translate(20px);-moz-transform:translate(20px);-ms-transform:translate(20px);transform:translate(20px);}}'
    ].join(''))
  })
})
