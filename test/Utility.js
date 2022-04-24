import {all} from 'known-css-properties'
import {hash} from '../index.js'

describe('Utility', () => {
  test('hash - no collision', () => {
    const hashMap = all.reduce((map, property) => {
      const key = hash(property, property.length)
      map[key] = map[key] || []
      map[key].push(property)
      return map
    }, {})

    expect((Object.entries(hashMap).filter(([, value]) => value.length > 1)).reduce((obj, [key, val]) => {
      obj[key] = val
      return obj
    }, {})).to.deep.equal({})
  })
})
