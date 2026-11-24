# Documentation tooling

Runs the Prisma web app locally and captures the figures used in the how-to pages
under [`workflow/`](../workflow). The app runs in **Research mode**: no Equinor login,
SQLite database, everything on your machine. Nothing here is deployed.

## Requirements

- Docker (with Compose), Node.js 20+, git, `python3` on the `PATH`
- Network access to GitHub and the Docker/npm registries on first run

## Commands

```bash
tools/setup.sh            # clone or update the web/API sources, start everything (idempotent)
tools/setup.sh status     # versions, whether figures are stale, which services run
tools/setup.sh check      # only ask upstream for new commits, change nothing
tools/setup.sh stop       # stop web and API (SQLite data is kept)

node tools/capture.mjs                                 # all pages, project from workflow/projects/
node tools/capture.mjs --pages issues,strategies
node tools/capture.mjs --project other.json --theme dark --viewport 1920x1080
```

`setup.sh` only redoes what changed: API images are rebuilt when the API commit
changed, `npm ci` runs when `package-lock.json` changed, Chromium is installed
when the Playwright version changed. A no-change run takes a few seconds; the first
run takes several minutes.

The web app and API are cloned next to this repository
(`../prisma-decision-web`, `../prisma-decision-api`) and follow `main`.
Override with `PRISMA_SRC_DIR`, `PRISMA_REF`, or `PRISMA_NO_PULL=1` to run with
whatever is checked out.

Services: web at <http://127.0.0.1:5004>, API at <http://localhost:7075>,
FastAPI at <http://localhost:8000>. Web log: `tools/.state/web.log`.
[`compose.override.yml`](./compose.override.yml) is layered on the API's compose
file so the .NET API reaches FastAPI through the host; some Docker setups (GitHub
Codespaces) block direct container-to-container traffic, which makes every solver
call hang otherwise.

## Capturing figures

`capture.mjs` imports the project JSON (a Prisma project export, kept in
`workflow/projects/`; used automatically when there is exactly one) into the local API,
opens every page listed in [`pages.mjs`](./pages.mjs), saves the screenshots and
then deletes the imported project again (pass `--keep` to keep it).

Figures go to `workflow/figures/<page>/`, one folder per web app page:

| Folder | Web app page |
|---|---|
| `home` | Home / project list |
| `project_information` | Frame → Project information |
| `objectives` | Frame → Objectives |
| `issues` | Frame → Issues |
| `strategies` | Frame → Strategies |
| `stakeholder_matrix` | Frame → Stakeholder matrix |
| `whiteboard` | Frame → Whiteboard |
| `influence_diagram` | Structure → Influence diagram |
| `decision_tree` | Structure → Decision tree |
| `compact_tree` | Structure → Compact tree |
| `solution_tree` | Structure → Solution tree |
| `assessments` | Evaluate → Assessments |

File naming follows `<element> - <description>.png`, e.g. `page - Issues.png`,
`button - Create Assessment.png`, `popup - Create Assessment.png`. Elements used:
`page` (whole viewport), `button`, `popup` (popover anchored to a button),
`window` (modal dialog), `card`, `field`, `menu`.

Add how-to details for a page by giving its entry in `pages.mjs` a `steps`
function; see `homeSteps` for the pattern (locate elements by role/placeholder,
`shot(name, locator)` for a padded element clip, `shot(name)` for the full page,
leave the page as found). Element shots are taken from the live page, so the
app's state (open popup, typed text, toggled favorite) is what gets captured.

`workflow/figures/versions.json` records the web/API commits, project file, theme
and viewport the figures were captured from. `setup.sh status` compares the
checked-out sources against it and warns when the figures are stale.
