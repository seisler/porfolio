// Commit message rules — see docs/commit-convention.md for the human version.
export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// Trimmed type set for a solo static portfolio (no test/perf/revert).
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'docs', 'style', 'refactor', 'chore', 'ci', 'build'],
		],
		// Scope is optional, but when present must be one of the FSD layers /
		// cross-cutting concerns below.
		'scope-enum': [
			2,
			'always',
			['pages', 'widgets', 'shared', 'tokens', 'adr', 'ci', 'build', 'deps'],
		],
	},
};
