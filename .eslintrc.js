module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true,
		jquery: true,
	},
	globals: {},
	extends: 'eslint:recommended',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: '2018',
	},
	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['warn', 'single', { allowTemplateLiterals: true }],
		'no-console': [
			'error',
			{
				allow: ['log', 'warn', 'error'],
			},
		],
		'no-unused-vars': ['warn', { vars: 'all', args: 'none', ignoreRestSiblings: true }],
		'no-constant-condition': ['warn'],
	},
}
