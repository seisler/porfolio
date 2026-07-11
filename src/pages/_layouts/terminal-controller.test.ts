import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initTerminal } from './terminal-controller';

const FIXED_TIME_MS = new Date('2026-07-11T10:20:30').getTime();

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
	{
		command: 'npm run projects',
		route: '/projects',
		title: 'Projects · Mark Schenzle',
		lines: [{ time: '00:02:00', text: 'Project line', url: 'https://example.com' }],
	},
];

// The controller stamps real wall-clock time (see terminal-controller.ts),
// so expectations are computed the same way rather than hardcoded — that
// keeps the tests correct regardless of the machine's timezone.
const timeAt = (offsetSeconds: number): string =>
	new Date(FIXED_TIME_MS + offsetSeconds * 1000).toLocaleTimeString('en-GB');

function renderDom(): void {
	document.body.innerHTML = `
		<nav>
			<a class="header__link" href="/">Home</a>
			<a class="header__link" href="/job-experience">Job Experience</a>
			<a class="header__link" href="/projects">Projects</a>
			<a class="header__link" href="/not-yet-registered">Not Yet Registered</a>
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

function typeAndSubmit(input: HTMLInputElement, value: string): void {
	input.value = value;
	input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

function currentPrompt(): HTMLParagraphElement {
	return document.querySelector<HTMLParagraphElement>('.resume-log__prompt:last-of-type')!;
}

function currentInput(): HTMLInputElement {
	return currentPrompt().querySelector('input')!;
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

describe('typed commands', () => {
	it('runs a known command: appends its lines (with real timestamps) and a fresh prompt', () => {
		initTerminal(registry);
		typeAndSubmit(currentInput(), 'npm run job-experience');

		const lines = document.querySelectorAll('.resume-log__line');
		expect(lines).toHaveLength(2);
		expect(lines[1].textContent).toContain('Job line');
		expect(lines[1].querySelector('.resume-log__meta')?.textContent).toBe(`${timeAt(0)} [job-experience]`);

		const prompts = document.querySelectorAll('.resume-log__prompt');
		expect(prompts).toHaveLength(2);
		expect(prompts[0].querySelector('input')).toBeNull();
		expect(prompts[0].querySelector('.resume-log__command')?.textContent).toBe('npm run job-experience');

		expect(currentPrompt().querySelector('input')).not.toBeNull();
		expect(document.title).toBe('Job Experience · Mark Schenzle');
	});

	it('stamps the real time the page loaded onto the initial, server-rendered lines', () => {
		initTerminal(registry);

		const meta = document.querySelector('.resume-log__line .resume-log__meta');
		expect(meta?.textContent).toBe(`${timeAt(0)} [home]`);
	});

	it('offsets each line in a multi-line run by one second, in real time', () => {
		const multiLineRegistry = [
			{
				command: 'npm run many',
				route: '/many',
				title: 'Many',
				lines: [
					{ time: '00:00:00', text: 'first' },
					{ time: '00:00:01', text: 'second' },
					{ time: '00:00:02', text: 'third' },
				],
			},
		];
		initTerminal([...registry, ...multiLineRegistry]);
		typeAndSubmit(currentInput(), 'npm run many');

		const metas = document.querySelectorAll('.resume-log__line .resume-log__meta');
		expect(metas[1].textContent).toBe(`${timeAt(0)} [many]`);
		expect(metas[2].textContent).toBe(`${timeAt(1)} [many]`);
		expect(metas[3].textContent).toBe(`${timeAt(2)} [many]`);
	});

	it('marks the matching nav link active after running a command', () => {
		initTerminal(registry);
		typeAndSubmit(currentInput(), 'npm run projects');

		const projectsLink = document.querySelector('a[href="/projects"]')!;
		const homeLink = document.querySelector('a[href="/"]')!;
		expect(projectsLink.classList.contains('header__link--active')).toBe(true);
		expect(projectsLink.getAttribute('aria-current')).toBe('page');
		expect(homeLink.classList.contains('header__link--active')).toBe(false);
	});

	it('renders a line with a url as a link', () => {
		initTerminal(registry);
		typeAndSubmit(currentInput(), 'npm run projects');

		const link = document.querySelector<HTMLAnchorElement>('.resume-log__link');
		expect(link?.href).toBe('https://example.com/');
		expect(link?.target).toBe('_blank');
		expect(link?.rel).toBe('noopener noreferrer');
		expect(link?.textContent).toBe('Project line');
	});

	it('pushes browser history (route + real run timestamp) for a matched command', () => {
		initTerminal(registry);
		const pushSpy = vi.spyOn(window.history, 'pushState');
		typeAndSubmit(currentInput(), 'npm run job-experience');

		expect(pushSpy).toHaveBeenCalledWith(
			{ routes: ['/', '/job-experience'], timestamps: [FIXED_TIME_MS, FIXED_TIME_MS] },
			'',
			'/job-experience',
		);
	});

	it('announces the command it ran for screen readers', () => {
		initTerminal(registry);
		typeAndSubmit(currentInput(), 'npm run job-experience');

		expect(document.getElementById('terminal-announcer')?.textContent).toBe('Ran npm run job-experience');
	});

	it('shows a "command not found" line (with a real timestamp) for unknown input, without navigating', () => {
		initTerminal(registry);
		const pushSpy = vi.spyOn(window.history, 'pushState');
		typeAndSubmit(currentInput(), 'npm run nonsense');

		const errorLine = document.querySelector('.resume-log__line--error');
		expect(errorLine?.textContent).toContain('command not found: npm run nonsense');
		expect(errorLine?.querySelector('.resume-log__meta')?.textContent).toBe(`${timeAt(0)} [error]`);
		expect(pushSpy).not.toHaveBeenCalled();
		expect(document.getElementById('terminal-announcer')?.textContent).toBe(
			'Command not found: npm run nonsense',
		);
	});

	it('ignores Enter on an empty prompt', () => {
		initTerminal(registry);
		typeAndSubmit(currentInput(), '   ');

		expect(document.querySelectorAll('.resume-log__prompt')).toHaveLength(1);
		expect(document.querySelectorAll('.resume-log__line')).toHaveLength(1);
	});
});

describe('nav link interception', () => {
	it('intercepts a click on a registered route and appends its output instead of navigating', () => {
		initTerminal(registry);
		const link = document.querySelector<HTMLAnchorElement>('a[href="/job-experience"]')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		link.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(true);
		expect(document.querySelectorAll('.resume-log__line')).toHaveLength(2);
		expect(document.title).toBe('Job Experience · Mark Schenzle');
	});

	it('leaves a click on a route not yet in the registry to navigate normally', () => {
		initTerminal(registry);
		const link = document.querySelector<HTMLAnchorElement>('a[href="/not-yet-registered"]')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		link.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
		expect(document.querySelectorAll('.resume-log__line')).toHaveLength(1);
	});
});

describe('prompt affordance', () => {
	it('keeps the decorative cursor visible (not removed) once the prompt is activated', () => {
		initTerminal(registry);

		expect(currentPrompt().querySelector('.resume-log__cursor')).not.toBeNull();
	});

	it('autofocuses the initial prompt input on load, without requiring a click', () => {
		initTerminal(registry);

		expect(document.activeElement).toBe(currentInput());
	});

	it('re-focuses the input when anywhere in the terminal is clicked, not just the live prompt line', () => {
		initTerminal(registry);
		const input = currentInput();
		input.blur();
		expect(document.activeElement).not.toBe(input);

		// Click on an *older* log line, well away from the live prompt —
		// this is the exact case that was broken: clicking anywhere but the
		// live prompt's tiny input left it permanently blurred.
		document.querySelector('.resume-log__line')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(document.activeElement).toBe(input);
	});

	it('does not steal focus from a real link click (e.g. a project URL)', () => {
		initTerminal(registry);
		typeAndSubmit(currentInput(), 'npm run projects');
		currentInput().blur();

		document.querySelector('.resume-log__link')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(document.activeElement).not.toBe(currentInput());
	});

	it('gives every freshly-appended prompt a cursor too, not just the initial one', () => {
		initTerminal(registry);
		typeAndSubmit(currentInput(), 'npm run job-experience');

		expect(currentPrompt().querySelector('.resume-log__cursor')).not.toBeNull();
	});
});
