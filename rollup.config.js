import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const mergeAll = objs => Object.assign({}, ...objs)

const configBase = {
	input: 'src/index.js',
	plugins: [],
}

const devUmdConfig = mergeAll([
	configBase,
	{
		output: {
			file: `dist/${ pkg.name }.js`,
			format: 'umd',
			name: pkg.name,
		},
	},
])

const prodUmdConfig = mergeAll([
	devUmdConfig,
	{
		output: mergeAll([
			devUmdConfig.output,
			{ file: devUmdConfig.output.file.replace(/\.js$/, '.min.js') }
		])
	},
	{
		plugins: devUmdConfig.plugins.concat(
			uglify({
				compress: {
					conditionals: false,
					if_return: false,
					booleans: false,
				},
			})
		),
	},
])

const cjsConfig = mergeAll([
	configBase,
	{ output: { file: pkg.main, format: 'cjs' } },
])

export default [devUmdConfig, prodUmdConfig, cjsConfig]
