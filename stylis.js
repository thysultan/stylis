/*!
 *          __        ___     
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  ) 
 * /____/\__/\__, /_/_/____/  
 *          /____/            
 * 
 * stylis is a small css compiler
 * 
 * @licence MIT
 */
(function (factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        define(factory(window));
    } else {
        window.stylis = factory(window);
    }
}(function (window) {
    'use strict';


    /**
     * css compiler
     *
     * @example compiler('.class1', 'css...', false);
     * 
     * @param  {string}  selector
     * @param  {string}  styles
     * @param  {boolean} nsAnimations
     * @param  {boolean} nsKeyframes
     * @return {string}
     */
    function stylis (selector, styles, nsAnimations, nsKeyframes) {
        var prefix = '';
        var id     = '';
        var type   = selector.charCodeAt(0) || 0;

        // [ attr selector
        if (type === 91) {
            // `[data-id=namespace]` -> ['data-id', 'namespace']
            var attr = selector.substring(1, selector.length-1).split('=');     
            var char = (id = attr[1]).charCodeAt(0);

            // [data-id="namespace"]/[data-id='namespace']
            // --> "namespace"/'namspace' -> namespace
            if (char === 34 || char === 39) {
                id = id.substring(1, id.length-1);
            }

            prefix = '['+ attr[0] + '=\'' + id +'\']';
        }
        // `#` `.` `>` id class and descendant selectors
        else if (type === 35 || type === 46 || type === 62) {
            id = (prefix = selector).substring(1);
        }
        // element selector
        else {
            id = prefix = selector;
        }

        var keyframeNs  = (nsAnimations === void 0 || nsAnimations === true ) ? id : '';
        var animationNs = (nsKeyframes === void 0 || nsKeyframes === true ) ? id : '';

        var output  = '';
        var line    = '';
        var blob    = '';
        var prev    = '';
        var flat    = '';

        var len     = styles.length;

        var i       = 0;
        var special = 0;
        var type    = 0;
        var close   = 0;
        var comment = 0;
        var depth   = 0;

        // parse + compile
        while (i < len) {
            var code = styles.charCodeAt(i);

            // {, }, ; characters, parse line by line
            if (code === 123 || code === 125 || code === 59) {
                line += styles[i];

                var first = line.charCodeAt(0);

                // only trim when the first character is a space ` `
                if (first === 32) { 
                    first = (line = line.trim()).charCodeAt(0); 
                }

                // default to 0 instead of NaN if there is no second character
                var second = line.charCodeAt(1) || 0;

                // /, *, block comment
                if (first === 47 && second === 42) {
                    // travel to end of comment and update first and second characters
                    first = (line = line.substring(line.indexOf('*/')+2)).charCodeAt(0);
                    second = line.charCodeAt(1) || 0;
                }

                // ignore line comments
                if (comment === 1) {
                    line = ''; comment = 0;
                }
                // @, special block
                else if (first === 64) {
                    // @keyframe/@global, `k` or @global, `g` character
                    if (second === 107 || second === 103) {
                        // k, @keyframes
                        if (second === 107) {
                            blob = line.substring(1, 11) + keyframeNs + line.substring(11);
                            line = '@-webkit-'+blob;
                            type = 1;
                        }
                        // g, @global 
                        else {
                            line = '';
                        }
                    }
                    // @media `m` character
                    else if (second === 109) {
                        type = 2;
                    }

                    special++;
                }
                else {
                    var third = line.charCodeAt(2) || 0;

                    // animation: a, n, i characters
                    if (first === 97 && second === 110 && third === 105) {
                        var anims = line.substring(10).split(',');
                        var build = 'animation:';

                        for (var j = 0, length = anims.length; j < length; j++) {
                            build += (j === 0 ? '' : ',') + animationNs + anims[j].trim();
                        }

                        // vendor prefix
                        line = '-webkit-' + build + build;
                    }
                    // appearance: a, p, p
                    else if (first === 97 && second === 112 && third === 112) {
                        // vendor prefix -webkit- and -moz-
                        line = '-webkit-' + line + '-moz-' + line + line;
                    }
                    // hyphens: h, y, p
                    // user-select: u, s, e
                    else if (
                        (first === 104 && second === 121 && third === 112) ||
                        (first === 117 && second === 115 && third === 101)
                    ) {
                        // vendor prefix all
                        line = '-webkit-' + line + '-moz-' + line + '-ms-' + line + line;
                    }
                    // flex: f, l, e
                    // order: o, r, d
                    else if (
                        (first === 102 && second === 108 && third === 101) ||
                        (first === 111 && second === 114 && third === 100)
                    ) {
                        // vendor prefix only -webkit-
                        line = '-webkit-' + line + line;
                    }
                    // transforms & transitions: t, r, a 
                    else if (first === 116 && second === 114 && third === 97) {
                        // vendor prefix -webkit- and -ms- if transform
                        line = '-webkit-' + line + (line.charCodeAt(5) === 102 ? '-ms-' + line : '') + line;
                    }
                    // display: d, i, s
                    else if (first === 100 && second === 105 && third === 115) {
                        if (line.indexOf('flex') > -1) {
                            // vendor prefix
                            line = 'display:-webkit-flex; display:flex;';
                        }
                    }
                    // { character, selector declaration
                    else if (code === 123) {
                        depth++;

                        if (special === 0) {
                            // nested selector
                            if (depth === 2) {
                                // discard first character {
                                i++;

                                // inner content of block
                                var inner   = '';
                                var nestSel = line.substring(0, line.length-1).split(',');
                                var prevSel = prev.substring(0, prev.length-1).split(',');

                                // keep track of opening `{` and `}` occurrences
                                var counter = 1;

                                // travel to the end of the block
                                while (i < len) {
                                    var char = styles.charCodeAt(i);
                                    // {, }, nested blocks may have nested blocks
                                    char === 123 ? counter++ : char === 125 && counter--;
                                    // break when the has ended
                                    if (counter === 0) break;
                                    // build content of nested block
                                    inner += styles[i++];
                                }

                                // handle multiple selectors: h1, h2 { div, h4 {} } should generate
                                // -> h1 div, h2 div, h2 h4, h2 div {}
                                for (var j = 0, length = prevSel.length; j < length; j++) {
                                    // extract value, prep index for reuse
                                    var val = prevSel[j]; prevSel[j] = '';
                                    // since there can also be multiple nested selectors
                                    for (var k = 0, l = nestSel.length; k < l; k++) {
                                        prevSel[j] += (
                                            (val.replace(prefix, '').trim() + ' ' + nestSel[k].trim()).trim() + 
                                            (k === l-1  ? '' : ',')
                                        );
                                    }
                                }

                                // create block and update styles length
                                len += (styles += (prevSel.join(',') + '{' + inner + '}').replace(/&| +&/g, '')).length;

                                // clear current line, to avoid add block elements to the normal flow
                                line = '';

                                // decreament depth
                                depth--;
                            }
                            // top-level selector
                            else {
                                var split = line.split(',');
                                var build = '';

                                // prefix multiple selectors with namesapces
                                // @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
                                for (var j = 0, length = split.length; j < length; j++) {
                                    var selector = split[j];
                                    var firstChar = selector.charCodeAt(0);

                                    // ` `, trim if first char is space
                                    if (firstChar === 32) {
                                        firstChar = (selector = selector.trim()).charCodeAt(0);
                                    }

                                    // [, [title="a,b,..."]
                                    if (firstChar === 91) {
                                        for (var k = j+1, l = length-j; k < l; k++) {
                                            var broken = (selector += ',' + split[k]).trim();

                                            // ]
                                            if (broken.charCodeAt(broken.length-1) === 93) {
                                                length -= k;
                                                split.splice(j, k);
                                                break;
                                            }
                                        }
                                    }

                                    // &
                                    if (firstChar === 38) {
                                        // before: & {
                                        selector = prefix + selector.substring(1);
                                        // after: ${prefix} {
                                    }
                                    // : 
                                    else if (firstChar === 58) {
                                        var secondChar = selector.charCodeAt(1);

                                        // :host 
                                        if (secondChar === 104) {
                                            var nextChar = (selector = selector.substring(5)).charCodeAt(0);
                                            
                                            // :host(selector)                                                    
                                            if (nextChar === 40) {
                                                // before: `(selector)`
                                                selector = prefix + selector.substring(1).replace(')', '');
                                                // after: ${prefx} selector {
                                            } 
                                            // :host-context(selector)
                                            else if (nextChar === 45) {
                                                // before: `-context(selector)`
                                                selector = selector.substring(9, selector.indexOf(')')) + ' ' + prefix + ' {';
                                                // after: selector ${prefix} {
                                            }
                                            // :host
                                            else {
                                                selector = prefix + selector;
                                            }
                                        }
                                        // :global(selector)
                                        else if (secondChar === 103) {
                                            // before: `:global(selector)`
                                            selector = selector.substring(8).replace(')', '');
                                            // after: selector
                                        }
                                        // :hover, :active, :focus, etc...
                                        else {
                                            // :, insure `div:hover` does not end up as `div :hover` 
                                            selector = prefix + (firstChar === 58 ? '' : ' ') + selector;
                                        }
                                    }
                                    else {
                                        // :, insure `div:hover` does not end up as `div :hover` 
                                        selector = prefix + (firstChar === 58 ? '' : ' ') + selector;
                                    }

                                    // if first selector do not prefix with `,`
                                    build += j === 0 ? selector : ',' + selector;
                                }

                                prev = line = build;
                            }
                        }
                    }
                    // } character
                    else if (code === 125 && depth !== 0) {
                        depth--;
                    }
                    
                    // @global/@keyframes
                    if (special !== 0) {
                        // find the closing tag
                        code === 125 ? close++ : (code === 123 && close !== 0 && close--);

                        // closing tag
                        if (close === 2) {
                            // @global
                            if (type === 0) {
                                line = '';
                            }
                            // @keyframes 
                            else if (type === 1) {
                                // vendor prefix
                                line = '}@'+blob+'}';
                                // reset blob
                                blob = '';
                            }
                            // @media
                            else if (type === 2) {
                                blob.length !== 0 && (line = prefix + ' {'+blob+'}' + line);
                                // reset blob
                                blob = '';
                            }

                            // reset flags
                            type = 0; close--; special--;
                        }
                        // @keyframes 
                        else if (type === 1) {
                            blob += line;
                        }
                        // @media flat context
                        else if (type === 2 && depth === 0 && code !== 125) {
                            blob += line; line = '';
                        }
                    }
                    // flat context
                    else if (depth === 0 && code !== 125) {
                        flat += line; line = '';
                    }
                }

                // add line to output, reset line buffer and comment signal
                output += line; line = ''; comment = 0;
            }
            // build line by line
            else {
                // \r, \n, ignore line comments
                if (comment === 1 && (code === 13 || code === 10)) {
                    line = '';
                }
                // not `\t`, `\r`, `\n` characters
                else if (code !== 9 && code !== 13 && code !== 10) {
                    // / line comment signal
                    code === 47 && comment === 0 && (comment = 1);

                    // build line buffer
                    line += styles[i];
                }
            }

            // next character
            i++; 
        }

        // if there is flat css, append
        return output + (flat.length === 0 ? '' : prefix + ' {' + flat + '}');
    }

    return stylis;
}));