// Isolated in its own file: initTerminal registers a `window`-level popstate
// listener that outlives the test, so sharing a jsdom window with other
// terminal-controller tests would let older listeners react to newer tests'
// popstate events. A fresh per-file jsdom environment avoids that.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initTerminal } from './terminal-controller';

const FIXED_TIME_MS = new Date('2026-07-11T10:20:30').getTime();
const EARLIER_TIME_MS = FIXED_TIME_MS - 60_000;

const timeAt = (ms: number, offsetSeconds = 0): string =>
	new Date(ms + offsetSeconds * 1000).toLocaleTimeString('en-GB');

const registry = [
	{
		command: 'npm run home',
		route: '/',
		title: 'Mark Schenzle',
		lines: [{ time: '00:00:00', text: 'Line one' }],
	},
	{
		command: 'npm run job-experience',
		route: '/job-experience',
		title: 'Job Experience · Mark Schenzle',
		lines: [{ time: '00:01:00', text: 'Job line' }],
	},
];

function renderDom(): void {
	document.body.innerHTML = `
		<nav>
			<a class="header__link" href="/">Home</a>
			<a class="header__link" href="/job-experience">Job Experience</a>
		</nav>
		<div id="terminal-announcer" aria-live="polite"></div>
		<div class="resume-log" data-terminal-log>
			<p class="resume-log__line" style="--resume-log-index: 0">
				<span class="resume-log__meta" aria-hidden="true">00:00:00 [home]</span> Line one
			</p>
			<p class="resume-log__prompt" style="--resume-log-index: 1">
				visitor@markschenzle.me:~$
				<span class="resume-log__cursor" aria-hidden="true"></span>
			</p>
		</div>
	`;
}

beforeEach(() => {
	renderDom();
	window.history.replaceState(null, '', '/');
	vi.useFakeTimers();
	vi.setSystemTime(FIXED_TIME_MS);
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe('popstate rebuild', () => {
	it('rebuilds the accumulated view using each run\'s original timestamp, not a new one', () => {
		initTerminal(registry);

		window.dispatchEvent(
			new PopStateEvent('popstate', {
				state: { routes: ['/', '/job-experience'], timestamps: [EARLIER_TIME_MS, FIXED_TIME_MS] },
			}),
		);

		const lines = document.querySelectorAll('.resume-log__line');
		expect(lines).toHaveLength(2);
		expect(lines[0].querySelector('.resume-log__meta')?.textContent).toBe(`${timeAt(EARLIER_TIME_MS)} [home]`);
		expect(lines[1].textContent).toContain('Job line');
		expect(lines[1].querySelector('.resume-log__meta')?.textContent).toBe(
			`${timeAt(FIXED_TIME_MS)} [job-experience]`,
		);

		// The first route's command isn't echoed inside the log — it's shown
		// by the static top-of-page prompt outside this container.
		const echoes = document.querySelectorAll('.resume-log__command');
		expect(echoes).toHaveLength(1);
		expect(echoes[0].textContent).toBe('npm run job-experience');

		expect(document.title).toBe('Job Experience · Mark Schenzle');
		expect(
			document.querySelector('a[href="/job-experience"]')?.classList.contains('header__link--active'),
		).toBe(true);
	});

	it('falls back to the initial route/timestamp when history state is missing', () => {
		initTerminal(registry);

		window.dispatchEvent(new PopStateEvent('popstate', { state: null }));

		expect(document.querySelectorAll('.resume-log__line')).toHaveLength(1);
		expect(document.querySelectorAll('.resume-log__command')).toHaveLength(0);
		expect(document.querySelector('.resume-log__meta')?.textContent).toBe(`${timeAt(FIXED_TIME_MS)} [home]`);
	});
});
