/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {string} type
 * @param {string[]} props
 * @param {object[]} children
 * @param {number} length
 */
export function node(value: string, root: any, parent: any, type: string, props: string[], children: any[], length: number): {
    value: string;
    root: any;
    parent: any;
    type: string;
    props: string[];
    children: any[];
    line: number;
    column: number;
    length: number;
    return: string;
};
/**
 * @param {string} value
 * @param {object} root
 * @param {string} type
 */
export function copy(value: string, root: any, type: string): {
    value: string;
    root: any;
    parent: any;
    type: string;
    props: string[];
    children: any[];
    line: number;
    column: number;
    length: number;
    return: string;
};
/**
 * @return {number}
 */
export function char(): number;
/**
 * @return {number}
 */
export function next(): number;
/**
 * @return {number}
 */
export function peek(): number;
/**
 * @return {number}
 */
export function caret(): number;
/**
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function slice(begin: number, end: number): string;
/**
 * @param {number} type
 * @return {number}
 */
export function token(type: number): number;
/**
 * @param {string} value
 * @return {any[]}
 */
export function alloc(value: string): any[];
/**
 * @param {any} value
 * @return {any}
 */
export function dealloc(value: any): any;
/**
 * @param {number} type
 * @return {string}
 */
export function delimit(type: number): string;
/**
 * @param {string} value
 * @return {string[]}
 */
export function tokenize(value: string): string[];
/**
 * @param {number} type
 * @return {string}
 */
export function whitespace(type: number): string;
/**
 * @param {string[]} children
 * @return {string[]}
 */
export function tokenizer(children: string[]): string[];
/**
 * @param {number} type
 * @return {number}
 */
export function delimiter(type: number): number;
/**
 * @param {number} type
 * @param {number} index
 * @return {number}
 */
export function commenter(type: number, index: number): number;
/**
 * @param {number} index
 * @return {string}
 */
export function identifier(index: number): string;
export var line: number;
export var column: number;
export var length: number;
export var position: number;
export var character: number;
export var characters: string;
