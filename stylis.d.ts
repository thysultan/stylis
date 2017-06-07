type selectors = Array<string>

interface options {
	keyframe?: boolean
	global?: boolean
	cascade?: boolean
	compress?: boolean
	prefix?: boolean
	semicolon?: boolean
}

interface set {
	(options?: options): set
}

interface plugin {
	(
		context: number, 
		content: string, 
		selector: selectors, 
		parent: selectors, 
		line: number, 
		column: number, 
		length: number
	): null|void|string
}

interface use {
	(plugin?: Array<plugin>|plugin|null): use
}

interface stylis {
	(namescope: string, input: string): string
	set: set
	use: use
}

declare global {
	export const stylis: stylis;
}

export = stylis;
