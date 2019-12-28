import {DECLARATION, RULE, KEYFRAMES, COMMENT} from './Enum.js'
import {push, sizeof, strlen} from './Utility.js'

export function stringify (nodes) {
    var output = ''

    for (var i = 0, size = sizeof(nodes); i < size; i++) {
        var node = nodes[i]

        switch (node.type) {
            case DECLARATION:
                output += node.value + ';'
                break
            case RULE:
                if (sizeof(node.children)) {
                    // node.value is unstable here, might not contain namespace, when .props contain it
                    output += node.props.join(',') + '{' + stringify(node.children) + '}'
                }
                break
            case KEYFRAMES:
                // TODO: I think this should just reuse `stringify`, but currently it's a reverse situation to the one describe in RULE block
                // props is unstable, while node.value has correct value
                output += node.value + '{'
                for (var j = 0, keyframesSize = sizeof(node.children); j < keyframesSize; j++) {
                    output += node.children[j].value + '{' + stringify(node.children[j].children) + '}'
                }
                output += '}'
                break
            case COMMENT:
                break
            default:
                // at-rules
                // those have namespace in props, but it stay unused - probably shouldn't be included by compile
                output += node.value + '{' + stringify(node.children) +'}'
        }
    }

    return output
}
