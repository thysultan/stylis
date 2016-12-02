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
    var rkeyf    = /@(keyframes +.*?}$)/g;
    var rtrans   = /(transform:.*?;)/g;
    var rspaces  = /  +/g;
    var ranim    = /(,|:) +/g;


    /**
     * stylis, css compiler interface
     *
     * @example stylis(selector, styles);
     * 
     * @param  {string}                  selector
     * @param  {string}                  styles
     * @param  {(boolean|Node|function)} element
     * @return {string}
     */
    function stylis (selector, styles, element) {
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
                    var output = compiler(selector[0], selector.substring(1), styles, false);

                    // passed an element, append to preserve elements content
                    return (element.appendChild(document.createTextNode(output)), element);
                } else {
                    var id = namespace+selector;

                    // avoid adding duplicate style elements
                    if (document.getElementById(id) != null) {
                        return null;
                    }

                    var output = compiler(selector[0], selector.substring(1), styles, false);

                    if (nodeType) {
                        // new element
                        var _element = document.createElement('style');

                            _element.textContent = output;
                            _element.id = id;

                        return element.appendChild(_element);
                    } else {
                        // function
                        return element('style', {id: id}, output);
                    }
                }
            } else {
                var output = compiler(selector[0], selector.substring(1), styles, false);

                // node
                return '<style id="'+namespace+selector+'">'+output+'</style>';
            }
        } else {
            // string
            return compiler(selector[0], selector.substring(1), styles, false);
        }
    }


    /**
     * css compiler
     *
     * @example compiler('.', 'class1', 'css...', false);
     * 
     * @param  {string}  ns
     * @param  {string}  id
     * @param  {string}  chars
     * @param  {boolean} isattr
     * @return {string}
     */
    function compiler (ns, id, chars, isattr) {
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
                            line = line.substring(1, 11) + id + line.substring(11);
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
                        line = line.replace(rspaces, '').replace(rtrans, '-webkit-$1$1');
                        
                        if (second === 107) {
                            // vendor prefix keyframes
                            line = '@-webkit-'+line+'}@'+line+'}';
                        } else {
                            line = line.replace(rkeyf, '@-webkit-$1}@$1}');
                        }
                    }
                } else {
                    var second = line.charCodeAt(1) || 0;
                    var third = line.charCodeAt(2) || 0;

                    // animation: a, n, i characters
                    if (first === 97 && second === 110 && third === 105) {
                        // remove space after `,` and `:` then split line
                        var split = line.replace(ranim, '$1').split(':');

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
            // `\t`, `\r`, `\n` characters
            else if (code !== 9 && code !== 13 && code !== 10) {
                line += chars[i];
            }

            // next character
            i++; 
        }

        return output;
    }


    return (stylis.compiler = compiler, stylis);
}));