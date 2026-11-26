// Registry of web app pages captured by capture.mjs.
//
// `folder` selects the page; `figureFolder` overrides its output directory.
// `route` is relative to /project/<id>/ (null = home page).
// `steps` is optional: an async function capturing how-to details (buttons,
// popups, dialogs) on top of the "page - <title>" overview. It receives:
//   page          Playwright page, already on the route with data loaded
//   shot(name, locator?, { pad, image })
//                 saves "<folder>/<name>.png"; whole viewport without a locator,
//                 otherwise the element plus `pad` px of context (default 12)
//                 or a precomposed PNG supplied as `image`
//   projectId     id of the imported project
//   projectFile   path of the imported project export (JSON)
//   api(method, route, body)
//                 call the local API as the capture user (cleanup of data a
//                 step created, e.g. assessments)
//   waitForApiIdle(), fitCanvas()
// Figure names follow "<element> - <description>" with the elements
// page, button, popup, window, card, field, menu.
// Each shot needs a matching Markdown description in workflow/figures/<folder>/.
// Steps should leave the page (and the project data) as they found it.

import { composeSidebarFigure } from './compose-sidebar-figure.mjs';

// EDS Popover renders in a portal; the open one is the last StyledPopover.
const popover = page => page.locator('[class*="Popover__StyledPopover"]').last();
// EDS Dialog is a native <dialog>; EDS Menu a role="menu" in a portal.
const dialog = page => page.getByRole('dialog').last();
const menu = page => page.getByRole('menu').last();
// Project pages share the collapsible EDS sidebar on the left; its entries
// link to /project/<id>[/<route>].
const sidebarLink = (page, projectId, route) =>
	page.locator(`a[class*="SidebarLink"][href="/project/${projectId}${route ? `/${route}` : ''}"]`);

const settle = (page, ms = 400) => page.waitForTimeout(ms);
const escape = async page => {
	await page.keyboard.press('Escape');
	await settle(page);
};
// Hover-free mouse position so no tooltip or hover style leaks into a shot.
const park = page => page.mouse.move(0, 0);

const captureSidebar = async (page, toggle) => {
	const clip = await toggle.evaluate(button => {
		for (let element = button; element instanceof HTMLElement; element = element.parentElement) {
			const { x, y, width, height } = element.getBoundingClientRect();
			if (x <= 2 && x >= -2 && width < window.innerWidth * 0.4 && height > window.innerHeight * 0.75) {
				return { x, y, width, height };
			}
		}
		return null;
	});
	if (!clip) throw new Error('Could not locate the sidebar for the navigation comparison figure');
	return {
		image: await page.screenshot({ animations: 'disabled', clip }),
		width: Math.round(clip.width),
		height: Math.round(clip.height),
	};
};

// Captures a sidebar entry with its label visible (sidebar expanded), then
// collapses the sidebar again.
const shotSidebarLink = async ({ page, shot, projectId }, name, route) => {
	await page.getByRole('button', { name: 'Expand', exact: true }).click();
	await settle(page);
	await shot(name, sidebarLink(page, projectId, route), { pad: 8 });
	await page.getByRole('button', { name: 'Collapse', exact: true }).click();
	await settle(page);
};

// ----------------------------------------------------------------------- home

const homeSteps = async ({ page, shot, projectFile }) => {
	const createButton = page.getByRole('button', { name: 'Create Project' }).first();
	const importButton = page.getByRole('button', { name: 'Import Project' }).first();
	const search = page.getByPlaceholder('Search projects...');
	const card = page.locator('a[href^="/project/"]').first();

	await shot('field - Search projects', search);
	await shot('button - Create Project', createButton);
	await shot('button - Import Project', importButton);
	await shot('card - Project', card);

	// Create Project popup, empty and with a name typed in
	await createButton.click();
	await settle(page);
	await shot('popup - Create Project', popover(page));
	await popover(page).getByRole('textbox').first().fill('Team building event');
	await shot('popup - Create Project filled', popover(page));
	await escape(page);

	// Import Project popup, empty and with a file selected (not imported)
	await importButton.click();
	await settle(page);
	await shot('popup - Import Project', popover(page));
	if (projectFile) {
		await page.locator('#projectJsonFile').setInputFiles(projectFile);
		await settle(page);
		await shot('popup - Import Project file selected', popover(page));
	}
	await escape(page);

	// Favorite toggle on a project card moves it to "Favorite Projects"
	const star = card.getByRole('button');
	await shot('button - Favorite', star, { pad: 8 });
	await star.click();
	await page.getByRole('heading', { name: 'Favorite Projects' }).waitFor();
	await park(page);
	await settle(page);
	await shot('page - Home with favorite project');
	await page.locator('a[href^="/project/"]').first().getByRole('button').click();
	await page.getByRole('heading', { name: 'Favorite Projects' }).waitFor({ state: 'hidden' });

	// Search filters the project list while typing
	await search.fill('team');
	await settle(page);
	await shot('page - Home search');
	await search.fill('');
};

// ---------------------------------------------------------- project information

const projectInformationSteps = async ctx => {
	const { page, shot } = ctx;
	await shotSidebarLink(ctx, 'button - Project Information', '');

	const expandSidebar = page.getByRole('button', { name: 'Expand', exact: true });
	await page.evaluate(() => {
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
	});
	await park(page);
	await settle(page);
	const collapsedSidebar = await captureSidebar(page, expandSidebar);
	await expandSidebar.click();
	let expandedSidebar;
	try {
		const collapseSidebar = page.getByRole('button', { name: 'Collapse', exact: true });
		await collapseSidebar.waitFor();
		await settle(page);
		await page.evaluate(() => {
			if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		});
		await park(page);
		expandedSidebar = await captureSidebar(page, collapseSidebar);
	} finally {
		const collapseSidebar = page.getByRole('button', { name: 'Collapse', exact: true });
		if (await collapseSidebar.count()) {
			await collapseSidebar.click();
			await settle(page);
		}
		await page.evaluate(() => {
			if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		});
		await park(page);
	}
	const sidebarFigure = await composeSidebarFigure(page, collapsedSidebar, expandedSidebar);
	await shot('pane - Side bar', undefined, { image: sidebarFigure });

	const download = page.getByRole('button', { name: 'Download' });
	const duplicate = page.getByRole('button', { name: 'Duplicate' });
	const remove = page.getByRole('button', { name: 'Delete' });
	await shot('button - Download', download);
	await shot('button - Duplicate', duplicate);
	await shot('button - Delete', remove);

	// Facilitator form: name, end date, visibility, opportunity statement, team
	await shot('field - Project Name', page.getByRole('textbox', { name: 'Project Name' }));
	await shot('field - End date', page.getByRole('button', { name: /^Change date/ }), { pad: 40 });
	await shot('field - Make Project Public', page.getByRole('switch', { name: 'Make Project Public' }));
	const statement = page.getByRole('textbox', { name: 'Opportunity Statement' });
	await shot('field - Opportunity Statement', statement, { pad: 56 });
	await shot('card - Team members', page.getByRole('heading', { name: 'Team members' }).locator('..'));

	// Duplicate and Delete open confirmation dialogs; both are dismissed
	await duplicate.click();
	await settle(page);
	await shot('window - Duplicate Project', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();
	await remove.click();
	await settle(page);
	await shot('window - Delete Project', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();
};

// ---------------------------------------------------------------- objectives

const objectivesSteps = async ctx => {
	const { page, shot } = ctx;
	await shotSidebarLink(ctx, 'button - Objectives', 'objectives');

	const form = page.getByRole('form', { name: 'Create objective' });
	const name = form.getByRole('textbox', { name: 'Objective name' });
	const description = form.getByRole('textbox', { name: 'Description' });
	const originalName = await name.inputValue();
	const originalDescription = await description.inputValue();
	const selectedType = form.getByRole('radio', { checked: true });
	const originalType = await selectedType.getAttribute('value');
	if (!originalType) throw new Error('Objectives: selected objective type has no value');
	await shot('field - Create objective', form);
	await name.fill('Stay within budget');
	await description.fill('The event must not exceed the allocated team budget.');
	await form.getByRole('radio', { name: 'Mean' }).check();
	await shot('field - Create objective filled', form);
	await shot('button - Create objective', form.getByRole('button', { name: 'Create objective' }));
	await name.fill(originalName);
	await description.fill(originalDescription);
	await form.getByRole('radio', { name: originalType, exact: true }).check();

	// One objective row and its controls
	const table = page.getByRole('table', { name: 'Objectives' });
	const row = table.getByRole('row').nth(1);
	await shot('card - Objective', row);
	await shot('button - Move objective', row.getByRole('button', { name: /^Move .* down$/ }), { pad: 8 });

	await row.getByRole('button', { name: /^Edit objective name:/ }).click();
	await shot('field - Edit objective name', row.getByRole('textbox', { name: 'Objective name' }));
	await escape(page);
	await row.getByRole('button', { name: /^Edit objective description:/ }).click();
	await shot('field - Edit objective description', row.getByRole('textbox', { name: 'Objective description' }));
	await escape(page);

	const typeButton = row.getByRole('button', { name: /^Objective type:/ });
	await shot('button - Objective type', typeButton, { pad: 8 });
	await typeButton.click();
	await settle(page);
	await shot('menu - Objective type', menu(page));
	await escape(page);

	// Delete opens a confirmation dialog, dismissed here
	await row.getByRole('button').first().click();
	await settle(page);
	await shot('window - Delete Objective', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();
	await settle(page);
};

// -------------------------------------------------------------------- issues

const issuesSteps = async ctx => {
	const { page, shot } = ctx;
	await shotSidebarLink(ctx, 'button - Issues', 'issues');

	const createButton = page.getByRole('button', { name: 'Create Issue', exact: true });
	await shot('button - Create Issue', createButton);
	await createButton.click();
	await settle(page);
	await shot('popup - Create Issue', popover(page));
	await popover(page).getByRole('textbox').first().fill('Transport');
	await popover(page).getByRole('textbox').nth(1).fill('How do employees get to the venue?');
	await popover(page).getByRole('radio', { name: 'Uncertainty' }).check();
	await settle(page);
	await shot('popup - Create Issue filled', popover(page));
	await escape(page);

	// Inline quick-create form at the top of the list
	const quick = page.getByRole('form', { name: 'Quick-create issue' });
	await shot('field - Quick-create issue', quick);

	// One issue row and its controls
	const table = page.getByRole('table', { name: 'Issues used in the influence diagram' });
	const row = table.getByRole('row').nth(1);
	await shot('card - Issue', row);
	const typeButton = row.getByRole('button', { name: /^Issue type:/ });
	await shot('button - Issue type', typeButton, { pad: 8 });
	await typeButton.click();
	await settle(page);
	await shot('menu - Issue type', menu(page));
	await escape(page);
	const boundaryButton = row.getByRole('button', { name: /^Boundary:/ });
	await boundaryButton.click();
	await settle(page);
	await shot('menu - Boundary', menu(page));
	await escape(page);

	await row.getByRole('button', { name: /^Edit issue:/ }).click();
	await settle(page);
	await shot('window - Edit Issue', dialog(page));
	await escape(page);
	await row.getByRole('button', { name: /^Delete issue:/ }).click();
	await settle(page);
	await shot('window - Delete Issue', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();

	const about = page.getByRole('button', { name: 'About issues used in the influence diagram' });
	await about.click();
	await settle(page);
	await shot('popup - About issues used in the influence diagram', popover(page));
	await escape(page);

	// List / board view toggle
	const listView = page.getByRole('button', { name: 'List view' });
	const boardView = page.getByRole('button', { name: 'Board view' });
	await shot('button - List view', listView, { pad: 8 });
	await shot('button - Board view', boardView, { pad: 8 });
	await boardView.click();
	await settle(page, 800);
	await park(page);
	await shot('page - Issues board view');
	await shot('button - Expand All', page.getByRole('button', { name: 'Expand All' }));
	await shot('field - Board focus', page.getByRole('radiogroup', { name: 'Board focus' }));
	await listView.click();
	await settle(page);
};

// ---------------------------------------------------------------- strategies

const strategiesSteps = async ctx => {
	const { page, shot } = ctx;
	await shotSidebarLink(ctx, 'button - Strategies', 'strategies');

	await shot(
		'card - Strategy table',
		page.getByRole('heading', { name: 'Strategy Table' }).locator('..').locator('..').locator('..'),
	);

	const form = page.getByRole('form', { name: 'Create strategy' });
	const name = form.getByRole('textbox', { name: 'Strategy name' });
	const rationale = form.getByRole('textbox', { name: 'Rationale' });
	await shot('field - Create strategy', form);
	await shot('button - Strategy color', form.getByLabel('Choose strategy icon color').locator('..'));
	await name.fill('Survey first');
	await rationale.fill('Ask employees before committing to an event.');
	await shot('field - Create strategy filled', form);
	await shot('button - Create strategy', form.getByRole('button', { name: 'Create strategy' }));
	const iconButton = form.getByRole('button', { name: 'Strategy icon' });
	await iconButton.click();
	await settle(page);
	await shot('popup - Strategy icon', popover(page));
	await iconButton.click();
	await popover(page).waitFor({ state: 'hidden' });
	await name.fill('');
	await rationale.fill('');

	// One strategy: header with compare toggle, edit and delete, option cards
	const compare = page.getByRole('checkbox', { name: 'Add to compare' }).first();
	const strategy = compare.locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
	await shot('field - Add to compare', compare.locator('..'));
	const [edit, remove] = await strategy.locator(':scope > div').first().getByRole('button').all();
	await edit.click();
	await settle(page);
	await shot('window - Edit Strategy', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button').first().click();
	await remove.click();
	await settle(page);
	await shot('window - Delete Strategy', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();
};

// -------------------------------------------------------- stakeholder matrix

const stakeholderMatrixSteps = async ctx => {
	const { page, shot } = ctx;
	await shotSidebarLink(ctx, 'button - Stakeholder Matrix', 'stakeholder-matrix');

	const panel = page.getByRole('complementary', { name: 'Stakeholders' })
		.or(page.locator('[aria-label="Stakeholders"]'))
		.first();
	await shot('card - Stakeholders', panel);
	await shot('field - Search stakeholders', panel.getByRole('textbox', { name: 'Search stakeholders' }));
	await shot('card - Stakeholder', page.locator('[aria-label^="Stakeholder matrix with "] [class*="cursor-grab"]').first(), { pad: 8 });

	const add = panel.getByRole('button', { name: 'Add' });
	await shot('button - Add', add, { pad: 8 });
	await add.click();
	await settle(page);
	await shot('popup - Add stakeholder', popover(page));
	await popover(page).getByRole('textbox', { name: 'Name' }).fill('Works council');
	await popover(page).getByRole('textbox', { name: 'Role' }).fill('Employee representation');
	await shot('popup - Add stakeholder filled', popover(page));
	await escape(page);

	await panel.getByRole('button', { name: 'Edit stakeholder' }).first().click();
	await settle(page);
	await shot('window - Edit stakeholder', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Close' }).click();
	await panel.getByRole('button', { name: 'Delete stakeholder' }).first().click();
	await settle(page);
	await shot('window - Delete stakeholder', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();

	const about = page.getByRole('button', { name: 'About this view' });
	await shot('button - About this view', about, { pad: 8 });
	await about.hover();
	await settle(page, 800);
	await shot('popup - About this view', page.getByRole('tooltip'), { pad: 24 });
	await park(page);

	// Hide the list to give the matrix the full width, then show it again
	await panel.getByRole('button', { name: 'Hide stakeholder list' }).click();
	await settle(page, 800);
	await shot('page - Stakeholder matrix without list');
	await page.getByRole('button', { name: 'Show stakeholder list' }).click();
	await settle(page);
};

// ---------------------------------------------------------------- whiteboard

const whiteboardSteps = async ctx => {
	const { page, shot } = ctx;
	await shotSidebarLink(ctx, 'button - Whiteboard', 'whiteboard');

	const toolbar = page.getByRole('toolbar', { name: 'Whiteboard toolbar' })
		.or(page.locator('[aria-label="Whiteboard toolbar"]'))
		.first();
	await shot('menu - Whiteboard toolbar', toolbar);
	await shot('field - Tool modes', page.getByRole('radiogroup', { name: 'Tool modes' }), { pad: 8 });

	const addIssue = page.getByRole('button', { name: 'Add Issue' });
	await shot('button - Add Issue', addIssue, { pad: 8 });
	await addIssue.click();
	await settle(page);
	await shot('popup - Add Issue', popover(page));
	await escape(page);

	// Sheet picker (named after the current sheet) lists and creates sheets
	const sheet = page.locator('[aria-label="Sheet controls"] button[aria-haspopup="menu"]').first();
	await shot('button - Sheet', sheet, { pad: 8 });
	await sheet.click();
	await settle(page);
	await shot('menu - Sheet', menu(page));
	await escape(page);
};

// --------------------------------------------------------- influence diagram

const influenceDiagramSteps = async ctx => {
	const { page, shot, fitCanvas, api, waitForApiIdle } = ctx;
	await shotSidebarLink(ctx, 'button - Influence Diagram', 'influence-diagram');

	const toolbar = page.getByRole('toolbar', { name: 'Influence diagram toolbar' })
		.or(page.locator('[aria-label="Influence diagram toolbar"]'))
		.first();
	const focusNode = async node => {
		const viewport = page.viewportSize();
		const box = await node.boundingBox();
		if (!viewport || !box) throw new Error('Influence diagram: cannot focus example node');
		await page.mouse.move(90, viewport.height / 2);
		await page.mouse.down();
		await page.mouse.move(
			90 + viewport.width * 0.35 - (box.x + box.width / 2),
			viewport.height / 2 + viewport.height * 0.42 - (box.y + box.height / 2),
			{ steps: 10 },
		);
		await page.mouse.up();
		await settle(page);
		const centered = await node.boundingBox();
		if (!centered) throw new Error('Influence diagram: focused node is not visible');
		await page.mouse.move(centered.x + centered.width / 2, centered.y + centered.height / 2);
		await page.mouse.wheel(0, -450);
		await settle(page, 800);
	};
	await shot('menu - Influence diagram toolbar', toolbar);
	await shot('field - Diagram view', page.getByRole('radiogroup', { name: 'Diagram view' }), { pad: 8 });
	await shot('field - Tool modes', page.getByRole('radiogroup', { name: 'Tool modes' }), { pad: 8 });
	await shot('card - Expected value metrics', page.locator('[aria-label="Expected value metrics"]'), { pad: 8 });

	const layout = page.getByRole('button', { name: 'Layout controls' });
	await shot('button - Layout controls', layout, { pad: 8 });
	await layout.click();
	await settle(page);
	await shot('popup - Layout controls', popover(page));
	await escape(page);

	const createIssue = page.getByRole('button', { name: 'Create Issue' });
	await shot('button - Create Issue', createIssue, { pad: 8 });
	await createIssue.click();
	await settle(page);
	await shot('popup - Create Issue', popover(page));
	await escape(page);

	// One node (uncertainty) with its actions menu and probability table
	const node = page.locator('.react-flow__node').filter({ hasText: 'Weather' }).first();
	await shot('card - Issue node', node);
	const actions = node.getByRole('button', { name: 'Issue actions' });
	await actions.click();
	await settle(page);
	await shot('menu - Issue actions', menu(page));
	await menu(page).getByRole('menuitem', { name: 'Probabilities' }).click();
	await settle(page, 800);
	const table = page.getByRole('heading', { name: 'Weather Probability Table' })
		.locator('xpath=ancestor::div[contains(@class,"border-2")][1]');
	await shot('window - Probability Table', table);
	await table.getByRole('button').last().click();

	const utilityNode = page.locator('.react-flow__node').filter({
		has: page.getByRole('heading', { name: 'Success', exact: true }),
	});
	await focusNode(utilityNode);
	await utilityNode.getByRole('button', { name: 'Issue actions' }).click();
	await menu(page).getByRole('menuitem', { name: 'Utility Table' }).click();
	const utilityTable = page.getByRole('heading', { name: 'Success Utility Table' })
		.locator('xpath=../..');
	await utilityTable.getByRole('spinbutton').nth(8).waitFor();
	await settle(page, 400);
	await shot('window - Utility Table', utilityTable);
	await utilityTable.getByRole('button').last().click();
	await fitCanvas();

	// Expand All opens every card's states; Collapse All reverts
	const expandAll = page.getByRole('button', { name: 'Expand All' });
	await shot('button - Expand All', expandAll, { pad: 8 });
	await expandAll.click();
	await settle(page, 800);
	await fitCanvas();
	await shot('page - Influence diagram expanded');

	const decision = page.locator('.react-flow__node').filter({
		has: page.getByRole('heading', { name: 'Event selection', exact: true }),
	});
	const option = decision.locator('li').filter({ hasText: 'Outdoor activiy' });
	const weather = node.locator('li').filter({ hasText: 'Good' });
	await option.click();
	await weather.click();
	await waitForApiIdle();
	await page.waitForFunction(() => {
		const metrics = document.querySelector('[aria-label="Expected value metrics"]');
		return /Scenario EV\s*-?\d/.test(metrics?.textContent ?? '');
	});
	await settle(page, 800);
	await focusNode(decision);
	const decisionBox = await decision.boundingBox();
	const weatherBox = await node.boundingBox();
	const scenarioViewport = page.viewportSize();
	if (!decisionBox || !weatherBox || !scenarioViewport) {
		throw new Error('Influence diagram: scenario nodes are not visible');
	}
	const top = Math.min(decisionBox.y, weatherBox.y);
	const bottom = Math.max(decisionBox.y + decisionBox.height, weatherBox.y + weatherBox.height);
	if (bottom - top > scenarioViewport.height - 200) {
		throw new Error('Influence diagram: scenario nodes do not fit in the viewport');
	}
	await page.mouse.move(90, scenarioViewport.height - 100);
	await page.mouse.down();
	await page.mouse.move(90, scenarioViewport.height - 100 + scenarioViewport.height * 0.52 - (top + bottom) / 2, { steps: 10 });
	await page.mouse.up();
	await park(page);
	await settle(page);
	await shot('page - What-if scenario');
	await option.click();
	await weather.click();
	await waitForApiIdle();
	await fitCanvas();
	await focusNode(decision);
	await decision.getByRole('button', { name: 'Issue actions' }).click();
	await menu(page).getByRole('menuitem', { name: 'Policy Table' }).click();
	const policyTable = page.getByRole('heading', { name: 'Event selection Policy Table' })
		.locator('xpath=../..');
	await policyTable.waitFor({ state: 'visible' });
	await shot('window - Policy Table', policyTable);
	await policyTable.getByRole('button').last().click();

	await page.getByRole('button', { name: 'Collapse All' }).click();
	await settle(page, 800);
	await fitCanvas();

	// Shape view shows nodes as classic influence diagram shapes
	await page.getByRole('radio', { name: 'Shape view' }).check();
	await settle(page, 800);
	await fitCanvas();
	await shot('page - Influence diagram shape view');

	const source = page.locator('.react-flow__node').filter({ hasText: 'Information strategy' }).first();
	const target = page.locator('.react-flow__node').filter({ hasText: 'Pilot accuracy' }).first();
	const sourceId = await source.getAttribute('data-id');
	const targetId = await target.getAttribute('data-id');
	if (!sourceId || !targetId) throw new Error('Influence diagram: example arc nodes are missing');
	const edge = page.getByRole('group', { name: `Edge from ${sourceId} to ${targetId}` });
	const edgeId = await edge.getAttribute('data-id');
	const restrictions = await api('GET', '/restriction_tables');
	if (!edgeId || !restrictions.some(table => table.edge_id === edgeId)) {
		throw new Error('Influence diagram: example arc has no existing restriction table');
	}

	const edgePoint = () => edge.locator('.react-flow__edge-path').evaluate(path => {
		const point = path.getPointAtLength(path.getTotalLength() / 2);
		const screen = new DOMPoint(point.x, point.y).matrixTransform(path.getScreenCTM());
		return { x: screen.x, y: screen.y };
	});
	const viewport = page.viewportSize();
	if (!viewport) throw new Error('Influence diagram: viewport size is unavailable');
	const pan = async (dx, dy) => {
		const start = {
			x: Math.max(30, Math.min(viewport.width - 30, viewport.width / 2 - dx / 2)),
			y: Math.max(160, Math.min(viewport.height - 70, viewport.height / 2 - dy / 2)),
		};
		await page.mouse.move(start.x, start.y);
		await page.mouse.down();
		await page.mouse.move(start.x + dx, start.y + dy, { steps: 10 });
		await page.mouse.up();
		await settle(page);
	};
	const sourceBox = await source.boundingBox();
	if (!sourceBox) throw new Error('Influence diagram: example source is not visible');
	await pan(
		viewport.width * 0.35 - (sourceBox.x + sourceBox.width / 2),
		viewport.height * 0.3 - (sourceBox.y + sourceBox.height / 2),
	);
	const centeredSource = await source.boundingBox();
	if (!centeredSource) throw new Error('Influence diagram: example source is not visible after panning');
	await page.mouse.move(centeredSource.x + centeredSource.width / 2, centeredSource.y + centeredSource.height / 2 + 80);
	await page.mouse.wheel(0, -570);
	await settle(page, 800);

	await source.hover();
	await source.getByRole('button', { name: 'Add arc' }).click();
	await shot('menu - Add arc', page.getByRole('menu', { name: 'Add arc to' }), { pad: 320 });
	await escape(page);
	await page.evaluate(() => {
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
	});

	const beforePan = await edgePoint();
	await pan(viewport.width * 0.5 - beforePan.x, viewport.height * 0.3 - beforePan.y);
	const zoomed = await edgePoint();
	await page.mouse.move(zoomed.x, zoomed.y);
	const arcActions = page.locator('.react-flow__edgelabel-renderer button').last();
	await arcActions.waitFor({ state: 'visible' });
	await shot('button - Arc actions', arcActions, { pad: 320 });
	await arcActions.click();
	const restrictionTable = page.getByText('Information strategy to Pilot accuracy Restriction Table', { exact: true })
		.locator('xpath=ancestor::div[contains(@class,"border-2")][1]');
	await shot('window - Restriction Table', restrictionTable);
	await restrictionTable.getByRole('button', { name: 'Delete edge' }).click();
	await shot('window - Delete Arc', dialog(page).locator(':scope > div').first());
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();
	await restrictionTable.getByRole('button').last().click();

	await page.getByRole('radio', { name: 'Card view' }).check();
	await settle(page, 800);
	await fitCanvas();
};

// ------------------------------------------------------------- decision tree

const decisionTreeSteps = async ({ page, shot, fitCanvas, waitForApiIdle }) => {
	// The sidebar entry opens a popup with the three tree views
	await page.getByRole('button', { name: 'Expand', exact: true }).click();
	await settle(page);
	const treeLink = page.getByText('Decision Tree', { exact: true }).locator('..');
	await shot('button - Decision Tree', treeLink, { pad: 8 });
	await treeLink.click();
	await settle(page);
	await shot('popup - Decision Tree', popover(page));
	await escape(page);
	await page.getByRole('button', { name: 'Collapse', exact: true }).click();
	await settle(page);

	const toolbar = page.locator('[aria-label="Decision tree toolbar"]').first();
	await shot('menu - Decision tree toolbar', toolbar);
	await shot('card - Expected value metrics', page.locator('[aria-label="Expected value metrics"]'), { pad: 8 });

	// Expand nodes are 1px wide; capture the visible button, not its wrapper.
	// Each "+" button expands one branch; Expand All expands all visible ones.
	const expandNode = page.locator('.react-flow__node-expandNode').first().getByRole('button');
	await shot('button - Expand node', expandNode, { pad: 220 });
	const expandAll = page.getByRole('button', { name: 'Expand All' });
	await shot('button - Expand All', expandAll, { pad: 8 });

	await expandNode.click();
	await waitForApiIdle();
	await settle(page, 1200);
	const collapseBranch = page.locator('.react-flow__edgelabel-renderer button').first();
	await collapseBranch.waitFor({ state: 'visible' });
	await shot('button - Collapse branch', collapseBranch, { pad: 180 });
	await collapseBranch.click();
	await settle(page, 1000);

	const firstExpansion = page.locator('.react-flow__node-expandNode').first().getByRole('button');
	await firstExpansion.click();
	await waitForApiIdle();
	await settle(page, 1200);
	const treeNodes = page.locator('.react-flow__node-treeNode');
	if (await treeNodes.count() < 2) throw new Error('Decision tree: expected an expanded child node');
	await treeNodes.nth(1).click();
	await fitCanvas();
	await shot('page - Decision tree selected path');
	await treeNodes.first().click();
	const prunedBranch = page.getByRole('button', { name: 'Pruned branch', exact: true }).first();
	await prunedBranch.waitFor({ state: 'visible' });
	await park(page);
	await shot('card - Pruned branch', prunedBranch, { pad: 65 });

	const expandableNodes = page.locator('.react-flow__node-expandNode');
	let leafCount = await page.locator('.react-flow__node-outputNode').count();
	for (let depth = 0; depth < 8 && leafCount === 0; depth++) {
		const treeNodeIds = await treeNodes.evaluateAll(nodes =>
			nodes.map(node => node.getAttribute('data-id')).filter(Boolean),
		);
		const expandableIds = await expandableNodes.evaluateAll(nodes =>
			nodes.map(node => node.getAttribute('data-id') ?? ''),
		);
		let nextExpansionIndex = -1;
		for (const treeNodeId of treeNodeIds.toReversed()) {
			nextExpansionIndex = expandableIds.findIndex(id => id.startsWith(`expand:${treeNodeId}:`));
			if (nextExpansionIndex >= 0) break;
		}
		if (nextExpansionIndex < 0) break;
		await expandableNodes.nth(nextExpansionIndex).getByRole('button').click();
		await waitForApiIdle();
		await settle(page, 1200);
		leafCount = await page.locator('.react-flow__node-outputNode').count();
	}
	if (leafCount === 0) throw new Error('Decision tree: could not reach a leaf for the calculation-check figure');
	await fitCanvas();
	const leaf = page.locator('.react-flow__node-outputNode').first();
	await leaf.waitFor({ state: 'visible' });
	const viewport = page.viewportSize();
	const leafBox = await leaf.boundingBox();
	if (!viewport || !leafBox) throw new Error('Decision tree: leaf is not visible for the calculation-check figure');
	const nodeBoxes = await page.locator('.react-flow__node').evaluateAll(nodes =>
		nodes.map(node => {
			const { x, y, width, height } = node.getBoundingClientRect();
			return { x, y, width, height };
		}),
	);
	const start = [
		{ x: viewport.width * 0.72, y: viewport.height * 0.78 },
		{ x: viewport.width * 0.86, y: viewport.height * 0.76 },
		{ x: viewport.width * 0.55, y: viewport.height * 0.8 },
	].find(point => nodeBoxes.every(box =>
		point.x < box.x - 12 || point.x > box.x + box.width + 12 ||
		point.y < box.y - 12 || point.y > box.y + box.height + 12,
	));
	if (!start) throw new Error('Decision tree: no clear canvas area to focus the leaf figure');
	const dx = viewport.width * 0.55 - (leafBox.x + leafBox.width / 2);
	const dy = viewport.height * 0.5 - (leafBox.y + leafBox.height / 2);
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(start.x + dx, start.y + dy, { steps: 10 });
	await page.mouse.up();
	await park(page);
	const zoomIn = page.getByRole('button', { name: 'Zoom in' });
	await zoomIn.click();
	await zoomIn.click();
	await zoomIn.click();
	await zoomIn.click();
	await settle(page);
	await shot('page - Decision tree leaf check', leaf, { pad: 260 });
	// The output-node wrapper is 1px wide; frame the value labels to include its icon.
	await shot('card - Leaf node', leaf.locator('p').first().locator('..'), { pad: 50 });
};

// ---------------------------------------------------- compact / solution tree

const compactTreeSteps = async ({ page, shot }) => {
	await shot('card - Decision node', page.locator('.react-flow__node').first(), { pad: 8 });
};

const solutionTreeSteps = async ({ page, shot }) => {
	await shot('card - Decision node', page.locator('.react-flow__node').first(), { pad: 8 });
};

// --------------------------------------------------------------- assessments

const assessmentScores = [
	{ frame: 3, alternatives: 3, information: 3, values: 3, reasoning: 3, commitment: 3 },
	{ frame: 4, alternatives: 4, information: 1, values: 2, reasoning: 3, commitment: 4 },
];

const assessmentsSteps = async ctx => {
	const { page, shot, api, waitForApiIdle, projectId } = ctx;
	await shotSidebarLink(ctx, 'button - evaluation', 'assessments');

	const createButton = page.getByRole('button', { name: 'Create Assessment' });
	await shot('button - Create Assessment', createButton);

	const createdIds = new Set();
	const trackCreated = request => {
		if (request.method() !== 'POST' || new URL(request.url()).pathname !== '/assessments') return;
		for (const assessment of request.postDataJSON()) {
			if (assessment.project_id === projectId) createdIds.add(assessment.id);
		}
	};
	const create = async name => {
		await createButton.click();
		await settle(page);
		await popover(page).getByRole('textbox', { name: 'Name' }).fill(name);
		const response = page.waitForResponse(r =>
			r.request().method() === 'POST' && new URL(r.url()).pathname === '/assessments',
		);
		await popover(page).getByRole('button', { name: 'Add Assessment' }).click();
		const result = await response;
		if (!result.ok()) throw new Error(`Create assessment failed: ${result.status()}`);
		await waitForApiIdle();
		await settle(page);
	};
	const form = name => page.locator('form').filter({
		has: page.getByRole('heading', { name, exact: true }),
	});
	const submit = async (name, scores) => {
		const inputs = form(name).getByRole('spinbutton');
		for (const [i, value] of Object.values(scores).entries()) await inputs.nth(i).fill(String(value));
		await form(name).getByRole('button', { name: 'Submit Evaluation' }).click();
		await waitForApiIdle();
		await settle(page);
	};
	const card = name => page.locator('section').filter({ hasText: name }).first();
	const complete = async name => {
		await card(name).getByRole('button', { name: 'Mark as Complete' }).click();
		await waitForApiIdle();
		await settle(page);
	};

	page.on('request', trackCreated);
	try {
		// Facilitator creates an assessment (popup), every user then gets a form
		await createButton.click();
		await settle(page);
		await shot('popup - Create Assessment', popover(page));
		await escape(page);
		await create('step 1');
		await shot('window - Create Assessment', form('step 1'));
		// Red dot: this user has not submitted yet
		await shotSidebarLink(ctx, 'button - Incomplete evaluation', 'assessments');
		await submit('step 1', assessmentScores[0]);
		await shot('window - Complete assessment', card('step 1'));
		await complete('step 1');

		// A second round shows the change per element and the trend chart
		await create('step 2');
		await submit('step 2', assessmentScores[1]);
		await shot('window - Complete assessment update', card('step 2'));
		await complete('step 2');
		const trend = page.getByRole('heading', { name: 'Metric Trends' }).locator('..');
		await trend.scrollIntoViewIfNeeded();
		await settle(page);
		await shot('window - Time evolution', trend);
		await page.mouse.wheel(0, -10_000);
	} finally {
		page.off('request', trackCreated);
		const all = await api('GET', '/assessments');
		for (const a of all.filter(a => a.project_id === projectId && createdIds.has(a.id))) {
			await api('DELETE', `/assessments/${a.id}`);
		}
	}
};

export const pages = [
	{ folder: 'home', route: null, title: 'Home', steps: homeSteps },
	{ folder: 'project_information', route: '', title: 'Project information', steps: projectInformationSteps },
	{ folder: 'objectives', route: 'objectives', title: 'Objectives', steps: objectivesSteps },
	{ folder: 'issues', route: 'issues', title: 'Issues', steps: issuesSteps },
	{ folder: 'strategies', route: 'strategies', title: 'Strategies', steps: strategiesSteps },
	{ folder: 'stakeholder_matrix', route: 'stakeholder-matrix', title: 'Stakeholder matrix', steps: stakeholderMatrixSteps },
	{ folder: 'whiteboard', route: 'whiteboard', title: 'Whiteboard', steps: whiteboardSteps },
	{ folder: 'influence_diagram', route: 'influence-diagram', title: 'Influence diagram', steps: influenceDiagramSteps },
	{ folder: 'decision_tree', route: 'decision-tree', title: 'Decision tree', steps: decisionTreeSteps },
	{ folder: 'compact_tree', route: 'compact-tree', title: 'Compact tree', steps: compactTreeSteps },
	{ folder: 'solution_tree', route: 'solution-tree', title: 'Solution tree', steps: solutionTreeSteps },
	{ folder: 'assessments', figureFolder: 'dq_assignment', route: 'assessments', title: 'Assessments', steps: assessmentsSteps },
];
