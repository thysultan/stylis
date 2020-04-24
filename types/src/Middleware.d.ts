/**
 * @param {function[]} collection
 * @return {function}
 */
export function middleware(collection: Function[]): Function;
/**
 * @param {function} callback
 * @return {function}
 */
export function rulesheet(callback: Function): Function;
/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 */
export function prefixer(element: any, index: number, children: any[], callback: Function): string;
/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 */
export function namespace(element: any): void;
