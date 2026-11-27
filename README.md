# prisma-decision-docs

Domain documentation for the prisma-decision project. The documentation is published with [Starlight](https://starlight.astro.build/) at **https://equinor.github.io/prisma-decision-docs/**. See [Documentation site](#documentation-site) for how to run it locally and add new pages.

"A decision is a choice between two or more alternatives that involves an irrevocable allocation of resources."[^1]

Decisions are the only way we can change our future life and for a company the basis to create value. Decisions are taken every day, some are simple and routine, while others can be difficult and with strong impact. Having different levels of complexity, dynamic, and consequences, decisions thus require different analysis process. The figure (taken from [^1]) below illustrates this idea.

<br>
<p align="center">
<img src="./src/content/docs/methodology/technical_notes/figures/hierarchy_of_decisions.png" 
    alt="Hierarchy of decisions"
    title="Hierarchy of decisions"
    width="400">
</p>
<br>
<p align="center">
<em>Hierarchy of decisions showing the relationship between the complexity <br>of the decision, the required process and its required time.</em>
</p>


prisma-decision aims at helping problems located at the top of the pyramid, meaning following a rigorous normative decision-making process. It aims at reproducing the framework described in Bratvold and Begg (2010):

"A scalable decision-making framework broadly applicable to most decision situations: with or without uncertainty, multi-objective or single objective, single decision or linked decisions, personal or business. (...) Its principles can be applied to analyses that span a range of times from less than an hour to months or years."[^2]


## Application for decision analysis and decision quality

Making good decisions is challenging, among others due to
- Bias
- Lack of clarity
- Lack of decision-making culture
- Not innate process

Decision analysis can be seen as a dialogue between the [decision makers and the analysts](./src/content/docs/methodology/technical_notes/decision_roles.md), aiming first at providing insight and clarity. Decision makers can then choose the best course of action[^2].

prisma-decision is an application that follows the principles of [decision analysis (DA)](./src/content/docs/methodology/technical_notes/decision_analysis.md) and of [decision quality (DQ)](./src/content/docs/methodology/technical_notes/decision_quality.md). It is designed as a collaborative tool and consists of

1. A frontend enabling
    - Framing the decision opportunity
    - Structuring the decision model
    - Evaluating the decision model
1. A Backend enabling
    - Accessing all the decision data in a database
    - Computations on the decision models


On the computational part, the decision model is expressed as an [influence diagram](./src/content/docs/methodology/technical_notes/influence_diagram.md) which is solved using the [pyagrum package](./src/content/docs/methodology/technical_notes/pyagrum.md). The influence diagram can be converted into a [decision tree](./src/content/docs/methodology/technical_notes/decision_tree.md) for interpretation purpose.
 

## Documentation site

The documentation is built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/) from the Markdown files in [`src/content/docs/`](./src/content/docs/) and deployed to GitHub Pages by the [deploy workflow](./.github/workflows/deploy.yml) on every push to `main`. The look and feel comes from the [starlight-theme-md3](https://github.com/axiaobo7788/starlight-material-design-theme) plugin (Material Design 3), see [Theme](#theme).

### Running the site locally

Requirements: [Node.js](https://nodejs.org/) 22.23 or later (see [`.nvmrc`](./.nvmrc); run `nvm use` if you use nvm).

1. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/equinor/prisma-decision-docs.git
   cd prisma-decision-docs
   npm ci
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   Open http://localhost:4321/prisma-decision-docs/ in your browser. The page reloads automatically when you edit a file.

   **In a GitHub Codespace:** open the **Ports** panel (or click *Open in Browser* in the notification that appears when the server starts), and append `/prisma-decision-docs/` to the forwarded URL, e.g. `https://<codespace-name>-4321.app.github.dev/prisma-decision-docs/`. The site is served under that base path, so the forwarded root URL only shows a redirect hint. The dev server is configured to listen on all interfaces (`server.host` in [`astro.config.mjs`](./astro.config.mjs)); without that, Codespaces port forwarding fails with "refused to connect" because Node binds `localhost` to IPv6 only.

3. Before opening a pull request, check that the site builds:

   ```bash
   npm run build     # builds the static site into dist/
   npm run preview   # (optional) serves dist/ locally, as it will be published
   npm run check     # (optional) type-checks the configuration and plugins
   ```

   `npm run preview` serves the production build on http://localhost:4321/prisma-decision-docs/ (same port-forwarding notes as above apply in Codespaces). You do not need to push or merge anything to review your pages: the published site at https://equinor.github.io/prisma-decision-docs/ only changes when a pull request is merged to `main`, while the deploy workflow just verifies that the build succeeds for pull requests.

### Adding to the documentation

1. Pick the section the page belongs to — **Methodology** (`src/content/docs/methodology/`, with the sub-sections `da_dq/` and `technical_notes/`), **Workflow** (`src/content/docs/workflow/`, how to use prisma-decision step by step) or **Troubleshooting** (`src/content/docs/troubleshooting/`, known issues and workarounds) — and create a Markdown file in it, e.g. `src/content/docs/methodology/technical_notes/value_of_information.md`. The file path becomes the URL (`/methodology/technical_notes/value_of_information/`), so use lowercase words separated by underscores.

2. Start the file with a frontmatter block. The `title` is rendered as the page heading, so the body starts at level‑2 headings (`##`):

   ```md
   ---
   title: Value of information
   description: Optional one-line summary shown in search results and link previews.
   ---

   Introductory paragraph.

   ## First section
   ```

3. Write the content in Markdown:
   - **Links** to other notes use relative paths to the Markdown file, e.g. `[Influence diagram](./influence_diagram.md)`. They work on GitHub and are rewritten to the right URLs at build time.
   - **Figures** go in [`src/content/docs/methodology/technical_notes/figures/`](./src/content/docs/methodology/technical_notes/figures/) and are inserted with `![Alt text](./figures/my_figure.png)`, optionally followed by an italic caption paragraph.
   - **Math** uses `$...$` inline and `$$ ... $$` on separate lines for display equations (rendered with KaTeX).
   - **Callouts** use Starlight asides: `:::note`, `:::tip`, `:::caution`, `:::danger`, closed with `:::`.
   - **References** use Markdown footnotes (`[^1]`) under a `## References` heading.

4. The new page appears automatically in its section of the sidebar (sorted alphabetically by title). To control the position, add `sidebar: { order: N }` to the frontmatter. For technical notes, also add a link to the list in [`technical_notes/README.md`](./src/content/docs/methodology/technical_notes/README.md). `README.md` files document a folder on GitHub only and are not published on the site.

5. Preview the page with `npm run dev`, then commit and open a pull request. The [deploy workflow](./.github/workflows/deploy.yml) builds the site for every pull request and publishes it to https://equinor.github.io/prisma-decision-docs/ once the change is merged to `main
Each top-level section (Methodology, Workflow, Troubleshooting) has its own sidebar, powered by the [starlight-sidebar-topics](https://starlight-sidebar-topics.netlify.app/) plugin: only the navigation of the current section is shown, with a switcher at the top of the sidebar. The sections and their sidebar groups are defined in the `starlightSidebarTopics([...])` call in [`astro.config.mjs`](./astro.config.mjs). A new top-level section is added by creating a sub-folder of `src/content/docs/` with an `index.md` and adding a matching topic there.

### Theme

The site uses the [starlight-theme-md3](https://github.com/axiaobo7788/starlight-material-design-theme) plugin, a Material Design 3 theme for Starlight. It is already listed in [`package.json`](./package.json) and installed by `npm ci`; to add it to a fresh checkout or upgrade it, run:

```bash
npm install starlight-theme-md3
```

The theme is enabled in [`astro.config.mjs`](./astro.config.mjs):

```js
import md3Theme from 'starlight-theme-md3';

starlight({
	// ...
	plugins: [md3Theme()],
});
```

Pass options to `md3Theme({...})` to customize it, e.g. `seed: '#ff1243'` to generate the palette from a brand color, or `accent`, `density`, `shape`, `contrast`. See the [theme options](https://github.com/axiaobo7788/starlight-material-design-theme#options) for the full list. Additional styling goes in [`src/styles/custom.css`](./src/styles/custom.css).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full writing conventions and the pull request process.


## Related Repositories

- [prisma-decision-api](https://github.com/equinor/prisma-decision-api) - Backend API
- [prisma-decision-web](https://github.com/equinor/prisma-decision-web) - Frontend application


## Citing


## Licence

 
## References

[^1]: Howard R. A. and Abbas A. E. (2016). Foundations of Decision Analysis. Pearson Education 2016.

[^2]: Bratvold, R. B. and Begg, S. (2010). Making Good Decisions, Society of Petroleum Engineers,  DOI: https://doi.org/10.2118/9781555632588, ISBN electronic: 978-1-61399-948-6.


