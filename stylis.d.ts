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

interface use {
	(plugin?: Array<Function>|Function|null): use
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
