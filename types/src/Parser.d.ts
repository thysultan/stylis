/**
 * @param {string} value
 * @return {object[]}
 */
export function compile(value: string): any[];
/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {string[]} rule
 * @param {string[]} rules
 * @param {string[]} rulesets
 * @param {number[]} pseudo
 * @param {number[]} points
 * @param {string[]} declarations
 * @return {object}
 */
export function parse(value: string, root: any, parent: any, rule: string[], rules: string[], rulesets: string[], pseudo: number[], points: number[], declarations: string[]): any;
/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {number} index
 * @param {number} offset
 * @param {string[]} rules
 * @param {number[]} points
 * @param {string} type
 * @param {string[]} props
 * @param {string[]} children
 * @param {number} length
 * @return {object}
 */
export function ruleset(value: string, root: any, parent: any, index: number, offset: number, rules: string[], points: number[], type: string, props: string[], children: string[], length: number): any;
/**
 * @param {number} value
 * @param {object} root
 * @param {object?} parent
 * @return {object}
 */
export function comment(value: number, root: any, parent: any): any;
/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {number} length
 * @return {object}
 */
export function declaration(value: string, root: any, parent: any, length: number): any;
