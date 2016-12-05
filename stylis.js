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
    function stylis (selector, styles, namespaceAnimations, namespaceKeyframes) {
        var prefix = '';
        var id = '';
        var type = selector.charCodeAt(0);

        // [
        if (type === 91) {
            var attr = selector.substring(1, selector.length-1).split('=');
            prefix = '['+ attr[0] + '=' + (id = attr[1]) +']';
        }
        // `>` or `#` or `.`
        else if (type === 62 || type === 35 || type === 46) {
            id = (prefix = selector).substring(1);
        }
        // i.e section 
        else {
            id = prefix = selector;
        }

        var keyframeId  = (namespaceAnimations === void 0 || namespaceAnimations === true ) ? id : '';
        var animationId = (namespaceKeyframes === void 0 || namespaceKeyframes === true ) ? id : '';

        var output = '';
        var line   = '';
        var blob   = '';

        var len = styles.length;
        var i   = 0;

        var flat    = 1;
        var special = 0;
        var type    = 0;
        var closing = 0;

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

                var second = line.charCodeAt(1) || 0;

                // /, *, block comment
                if (first === 47 && second === 42) {
                    first = (line = line.substring(line.indexOf('*/')+2)).charCodeAt(0);
                    second = line.charCodeAt(1) || 0;
                }

                // /, / line comment
                if (first === 47 && second === 47) {
                    line = code === 125 ? '}' : '';
                }
                // @, special block
                else if (first === 64) {
                    // exit flat css context with the first block context
                    if (flat === 1) {
                        flat = 0;
                        
                        if (output.length !== 0) {
                            output = prefix + '{' + output + '}'
                        }
                    }

                    // @keyframe/@root, `k` or @root, `r` character
                    if (second === 107 || second === 114) {
                        special++;

                        if (second === 107) {
                            line = line.substring(0, 11) + keyframeId + line.substring(11);
                            blob = line.substring(1);
                            type = 1;
                        } else {
                            line = '';
                        }
                    }
                } else {
                    var third = line.charCodeAt(2) || 0;

                    // animation: a, n, i characters
                    if (first === 97 && second === 110 && third === 105) {
                        var anims = line.substring(10).split(',');
                        var build = 'animation:';

                        for (var j = 0, length = anims.length; j < length; j++) {
                            build += (j === 0 ? '' : ',') + animationId + anims[j].trim();
                        }

                        // vendor prefix
                        line = '-webkit-' + build + '-moz-' + build + build;
                    }
                    // appearance: a, p, p
                    // flex: f, l, e
                    // order: o, r, d
                    else if (
                        (first === 97 && second === 112 && third === 112) ||
                        (first === 102 && second === 108 && third === 101) ||
                        (first === 111 && second === 114 && third === 100)
                    ) {
                        // vendor prefix
                        line = '-webkit-' + line + '-moz-' + line + line;
                    }
                    // transforms & transitions: t, r, a 
                    // hyphens: h, y, p
                    // user-select: u, s, r, s
                    else if (
                        (first === 116 && second === 114 && third === 97) ||
                        (first === 104 && second === 121 && third === 112) ||
                        (first === 117 && second === 115 && third === 101 && line.charCodeAt(5) === 115)
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
                    // selector declaration
                    else if (code === 123) {
                        // exit flat css context with the first block context
                        if (flat === 1) {
                            flat = 0;
                            
                            if (output.length !== 0) {
                                output = prefix + '{' + output + '}'
                            }
                        }

                        if (special === 0) {
                            var split = line.split(',');
                            var _line = '';

                            // iterate through characters and prefix multiple selectors with namesapces
                            // i.e h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
                            for (var j = 0, length = split.length; j < length; j++) {
                                var selector = split[j];
                                var _first = selector.charCodeAt(0);
                                var affix = '';

                                // trim if first character is a space
                                if (_first === 32) {
                                    _first = (selector = selector.trim()).charCodeAt(0);
                                }

                                // first selector
                                if (j === 0) {
                                    // :, &, { characters
                                    if (_first === 58 || _first === 38 || _first === 123) {
                                        affix = prefix;
                                    } else {
                                        affix = prefix + ' ';
                                    }
                                } else {
                                    // ` `, &
                                    affix = ',' + prefix + (_first !== 32 && _first !== 38 ? ' ' : '');
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

                    // @root/@keyframes
                    if (special > 0) {
                        // find the closing tag
                        if (code === 125) {
                            closing++;
                        } else if (code === 123 && closing !== 0) {
                            closing--;
                        }

                        // closing tag
                        if (closing === 2) {
                            // @root
                            if (type === 0) {
                                line = '';
                            }
                            // @keyframes 
                            else {
                                // vendor prefix
                                line = '}@-webkit-'+blob+'}@-moz-'+blob+'}';
                                // reset blob
                                blob = '';
                            }

                            // reset flags
                            type = 0;
                            closing = special > 1 ? 1 : 0;
                            special--;
                        }
                        // @keyframes 
                        else if (type === 1) {
                            blob += line;
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

        return flat && output.length !== 0 ? prefix+'{'+output+'}' : output;
    }

    return stylis;
}));