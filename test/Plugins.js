import {compile, serialize, pluginMiddleware, prefix} from "../index.js"

describe('prefixer plugin', () => {
    const prefixPlugin = node => {
        switch (node.type) {
            case 'decl':
                node.value = prefix(node.value, node.props.length)
        }
    }

    const stylis = string => serialize(pluginMiddleware([prefixPlugin])(compile(`.user{${string}}`)))

    test('prefix declarations', () => {
        expect(stylis('display:flex;')).to.equal('.user{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}')
    })
})
