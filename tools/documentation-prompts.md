# Documentation creation prompts

This file gathers the key requests that shaped the Prisma how-to documentation.
It is a reference for a future documentation-update agent, not an agent
configuration. The quotations record the original intent; the workflow below
describes the current implementation.

## Requests to preserve

### Capture page details

> Add per-page `steps` in `pages.mjs` for the how-to details (e.g. Issues:
> "button - Create Issue", "popup - Create Issue"; Decision tree: "Expand All";
> Assessments: the existing `dq_assignment` set). Add the home
> project_information.

> Add per-page `steps` in `pages.mjs` for the how-to details (e.g. Issues:
> "button - Create Issue", "popup - Create Issue"; Decision tree: "Expand All";
> Assessments: the existing `dq_assignment` set). Add the objectives page.

Capture a page overview and useful controls, forms, dialogs, and relevant
states, not just the page itself. Preserve existing project data and restore
temporary UI state after capture. The assessment figures use the existing
`dq_assignment` directory so established references continue to work.

### Describe and organize figures

> I want now that each produced figure has a short description in markdown.
> Then they will be used later in merged documents describing each page.
> Finally all the pages will be linked to a single document gathering the
> process step by step. Organize optimally the files.

The chosen format is an editable Markdown sidecar beside each PNG, with the
same basename, a concise description, and a relative image link. Figure
fragments are sources for page guides, not generated descriptions that are
replaced on recapture.

### Merge page guides

> Create the merged files page per page showing the possibilities. Choose
> wisely the order to merge so the document reads in a logical manner.

Order material by user task and decision workflow, rather than capture order
or alphabetical filename. The single process index links the page guides;
the workflow is iterative, and not every feature is required for every decision.

### Incorporate existing documentation

> Can you review the content of
> `/workspaces/prisma-decision-docs/Prisma_Decision_User_How_To.docx` and update
> the existing markdown files with relvant information found in the docx
> document?

Review source material for useful explanations and instructions. Compare
version-specific claims with the current application before adopting them;
do not describe an unavailable screen or an unverified calculation as current
behavior. Preserve existing useful documentation and identify material that
does not apply.

### Keep the root overview concise

> remove the parts from the file `/workspaces/prisma-decision-docs/README.md`
> which are redundant with `/workspaces/prisma-decision-docs/tools/README.md`
> and add a link instead of.

Keep detailed tooling instructions in the tooling guide and link to it from the
repository overview rather than maintaining duplicate instructions.

### Scope of the last documentation review

> accept all changes except the ones in the domain subdirectory

The preceding Word-document review excluded changes to `domain/` at the user's
request. Treat that as the scope of that review, not as a permanent prohibition
on future domain updates; check the scope of each future request.

## Current update workflow

1. Review the requested scope, existing documentation, current app behavior, and
   any supplied source material. Check the worktree and preserve unrelated edits.
2. If figures need to change, update [pages.mjs](./pages.mjs) and the matching
   Markdown sidecars under [workflow/figures](../workflow/figures/). Use the
   naming and capture conventions in the [tooling guide](./README.md).
3. Capture affected pages with `node tools/capture.mjs --pages <page>` after
   starting the required local services. Use `--out <dir>` for a non-destructive
   trial; inspect the actual images as well as command success.
4. Update figure prose in its sidecar, and update page introductions, grouping,
   or ordering in [guides.mjs](./guides.mjs). Regenerate with
   `node tools/merge-guides.mjs`; do not edit generated page guides directly.
5. Update the manually maintained [workflow index](../workflow/README.md),
   [decision-quality guidance](../workflow/decision_quality.md), or
   [troubleshooting](../troubleshooting/README.md) when relevant. Avoid changing
   unrelated domain content.
6. Run `node --test tools/figure-descriptions.test.mjs tools/merge-guides.test.mjs`
   and `node tools/merge-guides.mjs --check`. Verify factual claims against
   current sources and report any captures or checks that could not be run.

See the [figure source layout](../workflow/figures/README.md) for composition
details and the [tooling guide](./README.md) for setup, options, and requirements.
