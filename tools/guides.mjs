// Editorial order, independent of the order used to capture screenshots.
export const guides = [
	{
		page: 'home',
		file: 'get_started.md',
		title: 'Get started',
		intro: 'Start a decision project or return to an existing one. You can create a project from scratch or import a saved Prisma export.',
		sections: [
			{ title: 'Overview', figures: ['page - Home'] },
			{ title: 'Create a project', figures: [
				'button - Create Project', 'popup - Create Project', 'popup - Create Project filled',
			] },
			{ title: 'Import a saved project', figures: [
				'button - Import Project', 'popup - Import Project', 'popup - Import Project file selected',
			] },
			{ title: 'Find and open an existing project', figures: [
				'field - Search projects', 'page - Home search', 'card - Project',
			] },
			{ title: 'Keep frequently used projects at hand', figures: [
				'button - Favorite', 'page - Home with favorite project',
			] },
		],
	},
	{
		page: 'project_information',
		title: 'Project information',
		intro: 'Establish a shared decision context before developing the model. Record the opportunity, review the team, and manage the project settings.',
		sections: [
			{ title: 'Overview and navigation', figures: [
				'button - Project Information', 'page - Project information',
			] },
			{ title: 'Define the decision context', figures: [
				'field - Project Name', 'field - Opportunity Statement', 'field - End date',
			] },
			{ title: 'Review the team and visibility', figures: [
				'card - Team members', 'field - Make Project Public',
			] },
			{ title: 'Back up or reuse the project', figures: [
				'button - Download', 'button - Duplicate', 'window - Duplicate Project',
			] },
			{ title: 'Delete a project', figures: ['button - Delete', 'window - Delete Project'] },
		],
	},
	{
		page: 'objectives',
		title: 'Objectives',
		intro: 'Record what the decision should achieve before comparing alternatives. Add objectives, clarify their descriptions, and classify them as the team refines its understanding.',
		sections: [
			{ title: 'Overview and navigation', figures: ['button - Objectives', 'page - Objectives'] },
			{ title: 'Add an objective', figures: [
				'field - Create objective', 'field - Create objective filled', 'button - Create objective',
			] },
			{ title: 'Review and edit objectives', figures: [
				'card - Objective', 'field - Edit objective name', 'field - Edit objective description',
			] },
			{ title: 'Classify objectives', figures: ['button - Objective type', 'menu - Objective type'] },
			{ title: 'Arrange the list', figures: ['button - Move objective'] },
			{ title: 'Remove an objective', figures: ['window - Delete Objective'] },
		],
	},
	{
		page: 'stakeholder_matrix',
		title: 'Stakeholder matrix',
		intro: 'Identify the people and groups involved in the decision. Discuss their influence and how the decision affects them, then use the matrix to support stakeholder engagement.',
		sections: [
			{ title: 'Overview and interpretation', figures: [
				'button - Stakeholder Matrix', 'page - Stakeholder matrix',
				'button - About this view', 'popup - About this view',
			] },
			{ title: 'Add stakeholders', figures: [
				'button - Add', 'popup - Add stakeholder', 'popup - Add stakeholder filled',
			] },
			{ title: 'Find and position stakeholders', figures: [
				'card - Stakeholders', 'field - Search stakeholders', 'card - Stakeholder',
			] },
			{ title: 'Update stakeholder details', figures: ['window - Edit stakeholder'] },
			{ title: 'Make room for the matrix', figures: ['page - Stakeholder matrix without list'] },
			{ title: 'Remove a stakeholder', figures: ['window - Delete stakeholder'] },
		],
	},
	{
		page: 'issues',
		title: 'Issues',
		intro: 'Capture the decisions, uncertainties, and other issues raised by the team. Classify them and define the model boundary before structuring the influence diagram.',
		sections: [
			{ title: 'Overview and navigation', figures: ['button - Issues', 'page - Issues'] },
			{ title: 'Create an issue', figures: [
				'button - Create Issue', 'popup - Create Issue', 'popup - Create Issue filled',
				'field - Quick-create issue',
			] },
			{ title: 'Review classification and model inclusion', figures: [
				'card - Issue', 'button - Issue type', 'menu - Issue type', 'menu - Boundary',
				'popup - About issues used in the influence diagram',
			] },
			{ title: 'Edit issue details', figures: ['window - Edit Issue'] },
			{ title: 'Explore the list and board', figures: [
				'button - List view', 'button - Board view', 'page - Issues board view',
				'field - Board focus', 'button - Expand All',
			] },
			{ title: 'Remove an issue', figures: ['window - Delete Issue'] },
		],
	},
	{
		page: 'whiteboard',
		title: 'Whiteboard',
		intro: 'Use the whiteboard to explore and organize issues with the team. Sheets provide separate spaces for different discussions or arrangements.',
		sections: [
			{ title: 'Overview and navigation', figures: ['button - Whiteboard', 'page - Whiteboard'] },
			{ title: 'Navigate and choose tools', figures: ['menu - Whiteboard toolbar', 'field - Tool modes'] },
			{ title: 'Choose or create a sheet', figures: ['button - Sheet', 'menu - Sheet'] },
			{ title: 'Place issues on the sheet', figures: ['button - Add Issue', 'popup - Add Issue'] },
		],
	},
	{
		page: 'strategies',
		title: 'Strategies',
		intro: 'Develop distinct courses of action by combining options across focus decisions. Review each strategy before comparing the selected combinations.',
		sections: [
			{ title: 'Overview and navigation', figures: ['button - Strategies', 'page - Strategies'] },
			{ title: 'Create a strategy', figures: [
				'field - Create strategy', 'popup - Strategy icon',
				'field - Create strategy filled', 'button - Create strategy',
			] },
			{ title: 'Review choices and edit the strategy', figures: ['card - Strategy', 'window - Edit Strategy'] },
			{ title: 'Compare strategies', figures: ['field - Add to compare', 'card - Strategy table'] },
			{ title: 'Remove a strategy', figures: ['window - Delete Strategy'] },
		],
	},
	{
		page: 'influence_diagram',
		title: 'Influence diagram',
		intro: 'Structure the decision model using decisions, uncertainties, utilities, and their relationships. Inspect model inputs before interpreting calculated results. See [Influence diagrams](../domain/influence_diagram.md) for arrow meanings, information timing, and input checks.',
		sections: [
			{ title: 'Overview and navigation', figures: ['button - Influence Diagram', 'page - Influence diagram'] },
			{ title: 'Choose how to work with the diagram', figures: [
				'menu - Influence diagram toolbar', 'field - Diagram view', 'field - Tool modes',
			] },
			{ title: 'Add an issue', figures: ['button - Create Issue', 'popup - Create Issue'] },
			{ title: 'Inspect nodes and probability inputs', figures: [
				'card - Issue node', 'menu - Issue actions', 'window - Probability Table',
			] },
			{ title: 'Arrange the diagram', figures: ['button - Layout controls', 'popup - Layout controls'] },
			{ title: 'Explore states and alternative views', figures: [
				'button - Expand All', 'page - Influence diagram expanded', 'page - Influence diagram shape view',
			] },
			{ title: 'Review calculated results', figures: ['card - Expected value metrics'] },
		],
	},
	{
		page: 'decision_tree',
		title: 'Decision tree',
		intro: 'Explore the model as sequences of decisions and uncertain outcomes. Start with the visible branches and expand them progressively to inspect the paths of interest. See [Decision trees](../domain/decision_tree.md) for interpreting branches, policies, and expected values.',
		sections: [
			{ title: 'Choose the tree view', figures: [
				'button - Decision Tree', 'popup - Decision Tree', 'page - Decision tree',
			] },
			{ title: 'Navigate and expand branches', figures: [
				'menu - Decision tree toolbar', 'button - Expand node', 'button - Expand All',
				'page - Decision tree expanded',
			] },
			{ title: 'Review calculated results', figures: ['card - Expected value metrics'] },
		],
	},
	{
		page: 'compact_tree',
		title: 'Compact tree',
		intro: 'Choose **Compact** from the **Decision Tree** sidebar popup for a condensed representation of the model. Use it as an alternative view when reviewing the decision structure.',
		sections: [
			{ title: 'Overview', figures: ['page - Compact tree'] },
			{ title: 'Inspect a node', figures: ['card - Decision node'] },
		],
	},
	{
		page: 'solution_tree',
		title: 'Solution tree',
		intro: 'Choose **Solution** from the **Decision Tree** sidebar popup to inspect the solution representation. Relate the displayed paths to the assumptions and inputs reviewed in the model.',
		sections: [
			{ title: 'Overview', figures: ['page - Solution tree'] },
			{ title: 'Inspect a node', figures: ['card - Decision node'] },
		],
	},
	{
		page: 'assessments',
		title: 'Assessments',
		intro: 'Assess the quality of the decision-making process, not the eventual outcome. See [Assess decision quality](./decision_quality.md) for the six elements, discussion prompts, and scoring guidance. Repeat assessments as the decision work progresses, not only at the end.',
		sections: [
			{ title: 'Overview and navigation', figures: ['button - evaluation', 'page - Assessments'] },
			{ title: 'Start an assessment round', figures: ['button - Create Assessment', 'popup - Create Assessment'] },
			{ title: 'Score and submit your evaluation', figures: [
				'button - Incomplete evaluation', 'window - Create Assessment',
			] },
			{ title: 'Review responses and complete the round', figures: ['window - Complete assessment'] },
			{ title: 'Repeat and review progress', figures: [
				'window - Complete assessment update', 'window - Time evolution',
			] },
		],
	},
];
