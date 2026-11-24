// Registry of web app pages captured by capture.mjs.
//
// `folder` is the sub-directory of workflow/figures/ (named after the page),
// `route` is relative to /project/<id>/ (null = home page).
// `steps` is optional: an async function capturing how-to details (buttons,
// popups, dialogs) on top of the "page - <title>" overview. It receives:
//   page          Playwright page, already on the route with data loaded
//   shot(name, locator?, { pad })
//                 saves "<folder>/<name>.png"; whole viewport without a locator,
//                 otherwise the element plus `pad` px of context (default 12)
//   projectId     id of the imported project
//   projectFile   path of the imported project export (JSON)
//   waitForApiIdle(), fitCanvas()
// Figure names follow "<element> - <description>" with the elements
// page, button, popup, window, card, field, menu.
// Steps should leave the page as they found it.

// EDS Popover renders in a portal; the open one is the last StyledPopover.
const popover = page => page.locator('[class*="Popover__StyledPopover"]').last();

const settle = (page, ms = 400) => page.waitForTimeout(ms);

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
	await page.keyboard.press('Escape');
	await settle(page);

	// Import Project popup, empty and with a file selected (not imported)
	await importButton.click();
	await settle(page);
	await shot('popup - Import Project', popover(page));
	if (projectFile) {
		await page.locator('#projectJsonFile').setInputFiles(projectFile);
		await settle(page);
		await shot('popup - Import Project file selected', popover(page));
	}
	await page.keyboard.press('Escape');
	await settle(page);

	// Favorite toggle on a project card moves it to "Favorite Projects"
	const star = card.getByRole('button');
	await shot('button - Favorite', star, { pad: 8 });
	await star.click();
	await page.getByRole('heading', { name: 'Favorite Projects' }).waitFor();
	await page.mouse.move(0, 0);
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

export const pages = [
	{ folder: 'home', route: null, title: 'Home', steps: homeSteps },
	{ folder: 'project_information', route: '', title: 'Project information' },
	{ folder: 'objectives', route: 'objectives', title: 'Objectives' },
	{ folder: 'issues', route: 'issues', title: 'Issues' },
	{ folder: 'strategies', route: 'strategies', title: 'Strategies' },
	{ folder: 'stakeholder_matrix', route: 'stakeholder-matrix', title: 'Stakeholder matrix' },
	{ folder: 'whiteboard', route: 'whiteboard', title: 'Whiteboard' },
	{ folder: 'influence_diagram', route: 'influence-diagram', title: 'Influence diagram' },
	{ folder: 'decision_tree', route: 'decision-tree', title: 'Decision tree' },
	{ folder: 'compact_tree', route: 'compact-tree', title: 'Compact tree' },
	{ folder: 'solution_tree', route: 'solution-tree', title: 'Solution tree' },
	{ folder: 'assessments', route: 'assessments', title: 'Assessments' },
];
