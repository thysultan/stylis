declare enum Context {
	POSTS = -2,
	PREPS = -1,
	UNKWN = 0,
	PROPS = 1,
	BLCKS = 2,
	ATRUL = 3
}

declare namespace Stylis {
	interface StylisStatic {
		new(options?: IOptions): StylisStatic
		(namescope: string, input: string): string | any;
		set: ISet;
		use: IUse;
	}

	interface IOptions {
		keyframe?: boolean
		global?: boolean
		cascade?: boolean
		compress?: boolean
		prefix?: boolean
		semicolon?: boolean,
		preserve?: boolean
	}

	interface ISet {
		(options?: IOptions): ISet
	}

	interface IPlugin {
		(this: StylisStatic,
			context: Context,
			content: string,
			selector: ISelectors,
			parent: ISelectors,
			line: number,
			column: number,
			length: number): null | void | string
	}

	interface IUse {
		(plugin?: Array<IPlugin> | IPlugin | null): IUse
	}

	type ISelectors = Array<string>;
}

declare const stylis: Stylis.StylisStatic;
export = stylis
export as namespace Stylis;

declare global {
	export const stylis: Stylis.StylisStatic;
}
