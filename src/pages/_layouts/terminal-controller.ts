// Hydrates the trailing prompt rendered by TerminalLog.astro into a real,
// typable input, and intercepts header nav clicks — both funnel into the
// same `handleSubmit`, which appends the target route's log lines (and a
// fresh prompt) to the current page's terminal container instead of doing a
// real navigation, so earlier commands' output stays on screen. History is
// tracked as an ordered list of {route, timestamp} runs in `history.state`,
// so back/forward can rebuild the accumulated view — using the *original*
// run time for each, not a freshly regenerated one — instead of losing it to
// a real reload. See docs/adr/0008-client-side-terminal-navigation.md.

interface LogLine {
	time: string;
	text: string;
	url?: string;
}

interface CommandEntry {
	command: string;
	route: string;
	title: string;
	lines: LogLine[];
}

interface Run {
	route: string;
	timestamp: number;
}

const PROMPT_TEXT = 'visitor@markschenzle.me:~$ ';

const formatTime = (date: Date): string => date.toLocaleTimeString('en-GB');

export function initTerminal(registry: CommandEntry[]): void {
	const byCommand = new Map(registry.map((entry) => [entry.command, entry]));
	const byRoute = new Map(registry.map((entry) => [entry.route, entry]));

	const announcer = document.getElementById('terminal-announcer');
	const announce = (message: string): void => {
		if (announcer) announcer.textContent = message;
	};

	const tagFor = (route: string): string => (route === '/' ? 'home' : route.replace(/^\//, ''));

	const setActiveRoute = (route: string): void => {
		document.querySelectorAll<HTMLAnchorElement>('.header__link').forEach((link) => {
			const isActive = link.getAttribute('href') === route;
			link.classList.toggle('header__link--active', isActive);
			if (isActive) {
				link.setAttribute('aria-current', 'page');
			} else {
				link.removeAttribute('aria-current');
			}
		});
	};

	// `time` is the real wall-clock time this specific line should show —
	// the command's run timestamp plus one second per line, so a run's
	// output still reads as printed sequentially. The static `line.time`
	// from the content collection is only ever seen with JS disabled.
	const buildLineEl = (line: LogLine, time: string, index: number, tag: string): HTMLParagraphElement => {
		const p = document.createElement('p');
		p.className = 'resume-log__line';
		p.style.setProperty('--resume-log-index', String(index));

		const meta = document.createElement('span');
		meta.className = 'resume-log__meta';
		meta.setAttribute('aria-hidden', 'true');
		meta.textContent = `${time} [${tag}]`;
		p.append(meta, ' ');

		if (line.url) {
			const a = document.createElement('a');
			a.className = 'resume-log__link';
			a.href = line.url;
			a.target = '_blank';
			a.rel = 'noopener noreferrer';
			a.textContent = line.text;
			p.append(a);
		} else {
			p.append(line.text);
		}

		return p;
	};

	const appendLines = (container: HTMLElement, entry: CommandEntry, timestamp: number): void => {
		const tag = tagFor(entry.route);
		entry.lines.forEach((line, index) => {
			const time = formatTime(new Date(timestamp + index * 1000));
			container.append(buildLineEl(line, time, index, tag));
		});
	};

	const wirePrompt = (promptEl: HTMLParagraphElement): void => {
		const input = promptEl.querySelector<HTMLInputElement>('input');
		if (!input) return;
		input.addEventListener('keydown', (event) => {
			if (event.key !== 'Enter') return;
			const raw = input.value.trim();
			if (!raw) return;
			const container = promptEl.closest<HTMLElement>('[data-terminal-log]');
			if (!container) return;
			handleSubmit(raw, container);
		});
	};

	// The decorative cursor stays in the DOM — CSS hides it once the input
	// gains focus (`:focus-within`) and shows it again on blur, so the prompt
	// always has a visible "type here" indicator, not just an invisible 1ch
	// input. Clicking *anywhere in the terminal* (not just this exact line —
	// see the document-level listener below) refocuses it, matching how a
	// real terminal emulator behaves.
	const activatePrompt = (promptEl: HTMLParagraphElement): void => {
		let input = promptEl.querySelector<HTMLInputElement>('input');
		if (!input) {
			input = document.createElement('input');
			input.type = 'text';
			input.className = 'resume-log__input';
			input.autocomplete = 'off';
			input.spellcheck = false;
			input.setAttribute('aria-label', 'Terminal command input');
			promptEl.append(input);
		}
		wirePrompt(promptEl);
		// No-op if `input` isn't attached to the document yet (e.g. built by
		// buildPromptEl() before it's appended) — `handleSubmit` re-focuses
		// explicitly once it is. For the very first, server-rendered prompt,
		// this is what makes it writable without requiring a click at all.
		input.focus();
	};

	const buildPromptEl = (index: number): HTMLParagraphElement => {
		const p = document.createElement('p');
		p.className = 'resume-log__prompt';
		p.style.setProperty('--resume-log-index', String(index));
		p.append(PROMPT_TEXT);
		const cursor = document.createElement('span');
		cursor.className = 'resume-log__cursor';
		cursor.setAttribute('aria-hidden', 'true');
		p.append(cursor);
		activatePrompt(p);
		return p;
	};

	const freezePrompt = (promptEl: HTMLParagraphElement, text: string): void => {
		promptEl.querySelector('input')?.remove();
		promptEl.querySelector('.resume-log__cursor')?.remove();
		const command = document.createElement('span');
		command.className = 'resume-log__command';
		command.textContent = text;
		promptEl.append(command);
	};

	const initialRoute = window.location.pathname.replace(/\/+$/, '') || '/';
	const initialTimestamp = Date.now();
	const runHistory: Run[] = [{ route: initialRoute, timestamp: initialTimestamp }];

	const pushHistoryState = (replace: boolean): void => {
		const state = {
			routes: runHistory.map((run) => run.route),
			timestamps: runHistory.map((run) => run.timestamp),
		};
		const route = runHistory[runHistory.length - 1].route;
		if (replace) {
			history.replaceState(state, '', route);
		} else {
			history.pushState(state, '', route);
		}
	};
	pushHistoryState(true);

	const commitRoute = (route: string, timestamp: number): void => {
		runHistory.push({ route, timestamp });
		pushHistoryState(false);
	};

	const focusLastPrompt = (container: HTMLElement): void => {
		container.querySelector<HTMLInputElement>('.resume-log__prompt:last-of-type input')?.focus();
	};

	const handleSubmit = (raw: string, container: HTMLElement): void => {
		const promptEl = container.querySelector<HTMLParagraphElement>('.resume-log__prompt:last-of-type');
		if (!promptEl) return;

		const entry = byCommand.get(raw);
		const timestamp = Date.now();
		freezePrompt(promptEl, raw);

		if (entry) {
			appendLines(container, entry, timestamp);
			commitRoute(entry.route, timestamp);
			document.title = entry.title;
			setActiveRoute(entry.route);
			announce(`Ran ${entry.command}`);
			container.append(buildPromptEl(entry.lines.length));
		} else {
			const errorLine = document.createElement('p');
			errorLine.className = 'resume-log__line resume-log__line--error';
			errorLine.style.setProperty('--resume-log-index', '0');
			const meta = document.createElement('span');
			meta.className = 'resume-log__meta';
			meta.setAttribute('aria-hidden', 'true');
			meta.textContent = `${formatTime(new Date(timestamp))} [error]`;
			errorLine.append(meta, ' ', `command not found: ${raw}`);
			container.append(errorLine);
			announce(`Command not found: ${raw}`);
			container.append(buildPromptEl(1));
		}

		focusLastPrompt(container);
	};

	const wireNavLinks = (): void => {
		document.querySelectorAll<HTMLAnchorElement>('.header__link').forEach((link) => {
			link.addEventListener('click', (event) => {
				// Only hijack plain left-clicks — let modifier-clicks and
				// non-primary buttons (new tab/window, etc.) behave normally.
				if (
					event.button !== 0 ||
					event.ctrlKey ||
					event.metaKey ||
					event.shiftKey ||
					event.altKey
				) {
					return;
				}
				const href = link.getAttribute('href');
				if (!href) return;
				const entry = byRoute.get(href);
				if (!entry) return; // Not part of the registry yet — let it navigate normally.
				const container = document.querySelector<HTMLElement>('[data-terminal-log]');
				if (!container) return; // No terminal log to render into — let it navigate normally.
				event.preventDefault();
				handleSubmit(entry.command, container);
			});
		});
	};

	const rebuild = (runs: Run[]): void => {
		const container = document.querySelector<HTMLElement>('[data-terminal-log]');
		if (!container) return;
		container.replaceChildren();

		runs.forEach(({ route, timestamp }, i) => {
			const entry = byRoute.get(route);
			if (!entry) return;

			if (i > 0) {
				const echo = document.createElement('p');
				echo.className = 'resume-log__prompt';
				echo.append(PROMPT_TEXT);
				const command = document.createElement('span');
				command.className = 'resume-log__command';
				command.textContent = entry.command;
				echo.append(command);
				container.append(echo);
			}

			appendLines(container, entry, timestamp);
		});

		const lastRun = runs[runs.length - 1];
		const lastEntry = byRoute.get(lastRun.route);
		container.append(buildPromptEl(lastEntry ? lastEntry.lines.length : 0));
		focusLastPrompt(container);

		if (lastEntry) document.title = lastEntry.title;
		setActiveRoute(lastRun.route);
		runHistory.length = 0;
		runHistory.push(...runs);
	};

	const container = document.querySelector<HTMLElement>('[data-terminal-log]');
	const initialPrompt = container?.querySelector<HTMLParagraphElement>('.resume-log__prompt');

	// Progressive enhancement: the server-rendered lines use the static,
	// decorative time from the content collection (so they still make sense
	// with JS disabled). Once JS is running, replace them with the real time
	// this page actually loaded, matching how every later run behaves.
	if (container) {
		const initialEntry = byRoute.get(initialRoute);
		if (initialEntry) {
			const tag = tagFor(initialRoute);
			container.querySelectorAll<HTMLElement>('.resume-log__line .resume-log__meta').forEach((meta, index) => {
				const time = formatTime(new Date(initialTimestamp + index * 1000));
				meta.textContent = `${time} [${tag}]`;
			});
		}
	}

	if (initialPrompt) activatePrompt(initialPrompt);

	wireNavLinks();

	// Clicking anywhere in the terminal (not just precisely on the live
	// prompt's tiny input) refocuses it, like a real terminal emulator.
	// A single document-level listener also avoids the alternative — one
	// listener per prompt — leaving stale handlers on frozen/historical
	// prompts whose input has already been removed.
	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (!target.closest('[data-terminal-log]')) return; // only in-terminal clicks refocus
		if (target.closest('a')) return; // real links (nav, project URLs) behave normally
		const activeContainer = document.querySelector<HTMLElement>('[data-terminal-log]');
		activeContainer?.querySelector<HTMLInputElement>('.resume-log__prompt:last-of-type input')?.focus();
	});

	window.addEventListener('popstate', (event) => {
		const state = event.state as { routes?: string[]; timestamps?: number[] } | null;
		const runs: Run[] =
			state?.routes && state.timestamps
				? state.routes.map((route, i) => ({ route, timestamp: state.timestamps![i] }))
				: [{ route: initialRoute, timestamp: initialTimestamp }];
		rebuild(runs);
	});
}
