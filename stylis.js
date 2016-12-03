/*!
 *
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


    // enviroment variables
    var document = window.document || null;
    var browser  = document !== null;


    // regular expressions
    var regPrefixKey = /@(keyframes +.*?}$)/g;
    var regPrefix    = /((?:transform|appearance):.*?;)/g;
    var regSpaces    = /  +/g;
    var regAnimation = /(,|:) +/g;


    // css selectors
    var selectors = {
        '>': 1,
        '.': 1,
        '#': 1,
        '~': 1,
        '+': 1,
        '*': 1,
        ':': 1,
        '[': 2
    };


    /**
     * stylis, css compiler interface
     *
     * @example stylis(selector, styles);
     * 
     * @param  {string}                  selector
     * @param  {string}                  styles
     * @param  {(boolean|Node|function)} element
     * @param  {boolean}                 namespaceAnimations
     * @param  {boolean}                 namespaceKeyframes
     * @return {string}
     */
    function stylis (selector, styles, element, namespaceAnimations, namespaceKeyframes) {
        // request for element
        if (element) {
            // there are duplicate compiler(...) calls because 
            // we defer compiling styles until we know more about the requested output
            // to prevent appending dublicate content to the dom when requested
            var namespace = 'stylis-';

            // browser
            if (browser) {
                var nodeType = element.nodeType;

                if (nodeType && element.nodeName === 'STYLE') {
                    var output = compiler(selector, styles, namespaceAnimations, namespaceKeyframes);

                    // passed an element, append to preserve elements content
                    return (element.appendChild(document.createTextNode(output)), element);
                } else {
                    var id = namespace+selector;

                    // avoid adding duplicate style elements
                    if (document.getElementById(id) != null) {
                        return null;
                    }

                    var output = compiler(selector, styles, namespaceAnimations, namespaceKeyframes);

                    if (nodeType || element === true) {
                        // new element
                        var _element = document.createElement('style');

                            _element.textContent = output;
                            _element.id = id;

                        return element === true ? _element : element.appendChild(_element);
                    } else {
                        // function
                        return element('style', {id: id}, output);
                    }
                }
            } else {
                var output = compiler(selector, styles, namespaceAnimations, namespaceKeyframes);

                // node
                return '<style id="'+namespace+selector+'">'+output+'</style>';
            }
        } else {
            // string
            return compiler(selector, styles, namespaceAnimations, namespaceKeyframes);
        }
    }


    /**
     * css compiler
     *
     * @example compiler('.class1', 'css...', false);
     * 
     * @param  {string}  selector
     * @param  {string}  styles
     * @param  {boolean} namespaceAnimations
     * @param  {boolean} namespaceKeyframes
     * @return {string}
     */
    function compiler (selector, styles, namespaceAnimations, namespaceKeyframes) {
        var sel = selector[0];
        var type = selectors[sel];

        var prefix;
        var id;

        // `>` or `.` or `#` or `:` or `~`
        if (type === 1) {
            prefix = selector;
            id = selector.substring(1);
        }
        // `[` 
        else if (type === 2) {
            var attr = selector.substring(1, selector.length-1).split('=');

            prefix = '['+ attr[0] + '=' + (id = attr[1]) +']';
        }
        // i.e section 
        else {
            id = prefix = selector;
        }

        var output = '';
        var line = '';

        var keyframeId = (namespaceAnimations === void 0 || namespaceAnimations === true ) ? id : '';
        var animationId = (namespaceKeyframes === void 0 || namespaceKeyframes === true ) ? id : '';

        var len = styles.length;
        var i = 0;

        // parse + compile
        while (i < len) {
            var code = styles.charCodeAt(i);

            // {, }, ; characters
            if (code === 123 || code  === 125 || code === 59) {
                line += styles[i];

                var first = line.charCodeAt(0);

                // only trim when the first character is ` `
                if (first === 32) {
                    first = (line = line.trim()).charCodeAt(0);
                }

                // / character, line comment
                if (first === 47) {
                    line = code === 125 ? '}' : '';
                }
                // @ character, special block
                else if (first === 64) {
                    var second = line.charCodeAt(1) || 0;

                    // @keyframe/@root, `k` or @root, `r` character
                    if (second === 107 || second === 114) {
                        i++;

                        if (second == 107) {
                            // @keyframes
                            line = line.substring(1, 11) + keyframeId + line.substring(11);
                        } else {
                            // @root
                            line = '';
                        }

                        var close = 0;

                        while (i < len) {
                            var char = styles[i++];
                            var _code = char.charCodeAt(0);

                            // not `\t`, `\r`, `\n` characters
                            if (_code !== 9 && _code !== 13 && _code !== 10) {
                                // } character
                                if (_code === 125) {
                                    // previous block tag is close
                                    if (close === 1) {
                                        break;
                                    }
                                    // current block tag is close tag 
                                    else {
                                        close = 1;
                                    }
                                }
                                // { character 
                                else if (_code === 123) {
                                    // current block tag is open
                                    close = 0;
                                }

                                line += char;
                            }
                        }

                        // vendor prefix transform properties within keyframes and @root blocks
                        line = line.replace(regSpaces, '').replace(regPrefix, '-webkit-$1-moz-$1$1');
                        
                        if (second === 107) {
                            // vendor prefix keyframes blocks
                            line = '@-webkit-'+line+'}'+'@-moz-'+line+'}@'+line+'}';
                        } else {
                            // vendor prefix keyframes in @root block
                            line = line.replace(regPrefixKey, '@-webkit-$1}@-moz-$1}@$1}');
                        }
                    }
                } else {
                    var second = line.charCodeAt(1) || 0;
                    var third = line.charCodeAt(2) || 0;

                    // animation: a, n, i characters
                    if (first === 97 && second === 110 && third === 105) {
                        // remove space after `,` and `:` then split line
                        var split = line.replace(regAnimation, '$1').split(':');

                        // build line
                        line = split[0] + ':' + animationId + (split[1].split(',')).join(','+animationId);

                        // vendor prefix
                        line = '-webkit-' + line + '-moz-' + line + line;
                    }

                    // transforms & transitions: t, r, a 
                    // appearance: a, p, p
                    // flex: f, l, e
                    // order: o, r, d
                    else if (
                        (first === 116 && second === 114 && third === 97) ||
                        (first === 97 && second === 112 && third === 112) ||
                        (first === 102 && second === 108 && third === 101) ||
                        (first === 111 && second === 114 && third === 100)
                    ) {
                        // vendor prefix
                        line = '-webkit-' + line + '-moz-' + line + line;
                    }
                    // hyphens: h, y, p
                    // user-select: u, s, r, s
                    else if (
                        (first === 104 && second === 121 && third === 112) ||
                        (first === 117 && second === 115 && third === 101 && (line.charCodeAt(5) || 0) === 115)
                    ) {
                        // vendor prefix
                        line = '-webkit-' + line + '-moz-' + line + '-ms-' + line + line;
                    }
                    // display: d, i, s
                    else if (first === 100 && second === 105 && third === 115) {
                        if (line.indexOf('flex') > -1) {
                            // vendor prefix
                            line = 'display:-webkit-flex; display:flex;'
                        }
                    }

                    else {
                        // selector declaration
                        if (code === 123) {
                            var split = line.split(',');
                            var _line = '';

                            // iterate through characters and prefix multiple selectors with namesapces
                            // i.e h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
                            for (var j = 0, length = split.length; j < length; j++) {
                                var selector = split[j];
                                var _first = selector.charCodeAt(0);
                                var affix = '';

                                // first selector
                                if (j === 0) {
                                    // :, &, { characters
                                    if (_first === 58 || _first === 38 || _first === 123) {
                                        affix = prefix;
                                    } else {
                                        affix = prefix + ' ';
                                    }
                                } else {
                                    affix = ',' + prefix;
                                }

                                if (_first === 123) {
                                    // { character
                                    _line += affix + selector;
                                } else if (_first === 38) {
                                    // & character
                                    _line += affix + selector.substring(1);
                                } else {
                                    _line += affix + selector;
                                }
                            }

                            line = _line;
                        }
                    }
                }

                output += line;
                line = '';
            } 
            // not `\t`, `\r`, `\n` characters
            else if (code !== 9 && code !== 13 && code !== 10) {
                line += styles[i];
            }

            // next character
            i++; 
        }

        return output;
    }

    return (stylis.compiler = compiler, stylis);
}));