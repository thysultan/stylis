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
     * stylis, css compiler interface
     *
     * @example stylis(selector, styles);
     * 
     * @param  {string}         selector
     * @param  {string}         styles
     * @param  {(boolean|Node)} element
     * @return {string}
     */
    function stylis (selector, styles, element) {
        var output = cssparser(selector[0], selector.substr(1), styles, false);

        // request for element
        if (element) {
            // browser
            if (document) {
                if (element.nodeType) {
                    // passed an element, append to preserve elements content
                    return (element.appendChild(document.createTextNode(output)), element);
                } else {
                    // new element
                    var _element = document.createElement('style');
                        _element.textContent = output;

                    return _element;
                }
            } else {
                // node
                return '<style>'+output+'</style>';
            }
        } else {
            // string
            return output;
        }
    }


    /**
     * css compiler
     *
     * @example cssparser('.', 'class1', 'css...', false);
     * 
     * @param  {string}  ns
     * @param  {string}  id
     * @param  {string}  chars
     * @param  {boolean} isattr
     * @return {string}
     */
    function cssparser (ns, id, chars, isattr) {
        var prefix = isattr ? '['+ns+'='+id+']' : ns + id;
        var output = '';
        var len = chars.length;
        var i = 0;
        var line = '';

        while (i < len) {
            var code = chars.charCodeAt(i);

            // {, }, ; characters
            if (code === 123 || code  === 125 || code === 59) {
                line += chars[i];
                line  = line.trim();

                var first = line.charCodeAt(0);

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
                            line = line.substr(1, 10) + id + line.substr(11);
                        } else {
                            // @root
                            line = '';
                        }

                        var close = 0;

                        while (i < len) {
                            var char = chars[i++];
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

                        // vendor prefix transforms properties
                        line = line.replace(/  +/g, '').replace(/(transform:.*?;)/g, '-webkit-$1$1');
                        
                        if (second === 107) {
                            // vendor prefix keyframes
                            line = '@-webkit-'+line+'}@'+line+'}';
                        } else {
                            line = line.replace(/@(keyframes +.*?}$)/g, '@-webkit-$1}@$1}');
                        }
                    }
                } else {
                    var second = line.charCodeAt(1) || 0;
                    var third = line.charCodeAt(2) || 0;

                    // animation: a, n, i characters
                    if (first === 97 && second === 110 && third === 105) {
                        // remove space after `,` and `:` then split line
                        var split = line.replace(/(,|:) +/g, '$1').split(':');

                        // build line
                        line = split[0] + ':' + id + (split[1].split(',')).join(','+id);

                        // vendor prefix
                        line = '-webkit-' + line + line;
                    }
                    // transform: t, r, a 
                    // appearance: a, p, p
                    else if (
                        (first === 116 && second === 114 && third === 97) ||
                        (first === 97 && second === 112 && third === 112)
                    ) {
                        // vendor prefix
                        line = '-webkit-' + line + line;
                    } else {
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
                                    _line += affix + selector.substr(1);
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
            // `\t`, `\r`, `\n` characters
            else if (code !== 9 && code !== 13 && code !== 10) {
                line += chars[i];
            }

            // next character
            i++; 
        }

        return output;
    }

    return stylis;
}));