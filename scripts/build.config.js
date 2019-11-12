import pkg from '../package.json'

function onwarn (warning, warn) {
	switch (warning.code) {
		case 'CIRCULAR_DEPENDENCY':
			return
		default:
			warn(warning)
	}
}

export default [
	{
		context: 'this',
		onwarn: onwarn,
		input: pkg.main,
		output: [
			{
				file: 'dist/stylis.es.js',
				format: 'es'
			}
		]
	}
]
