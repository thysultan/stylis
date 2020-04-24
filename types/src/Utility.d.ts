/**
 * @param {string} value
 * @param {number} length
 * @return {number}
 */
export function hash(value: string, length: number): number;
/**
 * @param {string} value
 * @return {string}
 */
export function trim(value: string): string;
/**
 * @param {string} value
 * @param {RegExp} pattern
 * @return {string?}
 */
export function match(value: string, pattern: RegExp): string;
/**
 * @param {string} value
 * @param {(string|RegExp)} pattern
 * @param {string} replacement
 * @return {string}
 */
export function replace(value: string, pattern: string | RegExp, replacement: string): string;
/**
 * @param {string} value
 * @param {string} value
 * @return {number}
 */
export function indexof(value: string, search: any): number;
/**
 * @param {string} value
 * @param {number} index
 * @return {number}
 */
export function charat(value: string, index: number): number;
/**
 * @param {string} value
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
export function substr(value: string, begin: number, end: number): string;
/**
 * @param {string} value
 * @return {number}
 */
export function strlen(value: string): number;
/**
 * @param {any[]} value
 * @return {number}
 */
export function sizeof(value: any[]): number;
/**
 * @param {any} value
 * @param {any[]} array
 * @return {any}
 */
export function append(value: any, array: any[]): any;
/**
 * @param {string[]} array
 * @param {function} callback
 * @return {string}
 */
export function combine(array: string[], callback: Function): string;
/**
 * @param {number}
 * @return {number}
 */
export var abs: (x: number) => number;
/**
 * @param {number}
 * @return {string}
 */
export var from: (...codes: number[]) => string;
