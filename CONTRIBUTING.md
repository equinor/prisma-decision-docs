# Contributing

We love your input! The following is a set of guidelines for contributing to **Prisma Decision Docs**.

Whether it's fixing a typo, improving explanations, proposing new documentation, or restructuring content — we want to make contributing as easy and transparent as possible.

## Ground Rules

1. Documentation should be clear, concise, and accurate.
2. All content should be written in Markdown.
3. Security vulnerabilities must be reported privately — see [SECURITY.md](SECURITY.md) if available.

## Getting Started

This repository contains the domain documentation and design decisions for the Prisma Decision project. The content is written in Markdown and published as a static site with [Starlight](https://starlight.astro.build/) (an [Astro](https://astro.build/) documentation framework) at https://equinor.github.io/prisma-decision-docs/.

### Prerequisites

- A text editor with Markdown support
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 22.23 or later (see [`.nvmrc`](.nvmrc)) — only needed to preview or build the site
- Familiarity with the Prisma Decision domain (see [README.md](README.md))

### Local Setup

```bash
git clone https://github.com/equinor/prisma-decision-docs.git
cd prisma-decision-docs
npm ci
npm run dev
```

The dev server runs at http://localhost:4321/prisma-decision-docs/ and reloads when you edit a file. For small edits you can also just preview Markdown files in your editor (e.g., VS Code).

Before opening a pull request, make sure `npm run build` completes without errors. The same command runs in CI for every pull request.

### Repository Layout

| Path | Purpose |
| --- | --- |
| `src/content/docs/` | All documentation pages (Markdown/MDX). Each file becomes a page, except `README.md` files and files starting with `_`. |
| `src/content/docs/methodology/` | Methodology section: `da_dq/` (DA/DQ introduction) and `technical_notes/` |
| `src/content/docs/methodology/technical_notes/figures/` | Figures used by the technical notes |
| `src/content/docs/workflow/` | Workflow: how to use prisma-decision step by step |
| `src/content/docs/troubleshooting/` | Troubleshooting: known issues and workarounds |
| `src/content/docs/index.mdx` | Landing page of the site |
| `src/plugins/` | Markdown plugins (KaTeX math rendering, `.md` link rewriting) |
| `src/styles/custom.css` | Custom styles applied on top of Starlight and the Material Design 3 theme |
| `astro.config.mjs` | Site configuration (title, sections/sidebars, theme options, GitHub Pages `base`, etc.) |
| `.github/workflows/deploy.yml` | Builds the site and deploys it to GitHub Pages |

## How to Suggest Changes

We use **GitHub Issues** to track suggestions and discussions.

- **For minor fixes** (typos, broken links, formatting): Feel free to open a pull request directly.
- **For larger changes** (new documents, restructuring, significant rewrites): Please open an issue first to discuss the proposed change. This helps ensure alignment before you invest time writing.

When opening an issue, include:

- A brief description of the change
- Why the change is needed
- Any relevant context or references

## Writing Style

- Use clear, concise language.
- Write for an audience familiar with decision analysis concepts.
- Use headings, lists, and tables to structure content for readability.
- Include references where appropriate, using Markdown footnotes.
- Keep figures and images in the relevant subdirectory (e.g., `src/content/docs/methodology/technical_notes/figures/`).

### Page Format

Every page starts with a frontmatter block declaring at least a `title`. The title is rendered as the top-level heading, so sections in the body start at level 2 (`##`):

```md
---
title: Influence diagrams
description: Optional short summary used for SEO and link previews.
---

Introductory paragraph.

## First section
```

Each section (Methodology, Workflow, Troubleshooting) has its own sidebar, generated from the files in the matching sub-folder of `src/content/docs/` and ordered alphabetically by title; the sections are configured with `starlightSidebarTopics` in `astro.config.mjs`. Add `sidebar: { order: N }` to the frontmatter to override the position.

### Links

Link to other pages with relative paths to their Markdown files, e.g. `[Influence diagram](./influence_diagram.md)`. These links work on GitHub and are rewritten to the correct site URLs at build time.

### Figures

Use standard Markdown image syntax with a relative path, optionally followed by an italic caption paragraph. Images are optimized automatically at build time.

```md
![Influence diagram of the used car buyer problem](./figures/used_car_buyer.png)

*Influence diagram of the used car buyer problem.*
```

### Math

LaTeX math is rendered with [KaTeX](https://katex.org/): use `$...$` for inline math and `$$ ... $$` on their own lines for display math.

### Callouts

Use [Starlight asides](https://starlight.astro.build/guides/authoring-content/#asides) for notes and warnings:

```md
:::note
Useful information.
:::

:::caution[Optional custom title]
Something to be careful about.
:::
```

Supported types are `note`, `tip`, `caution` and `danger`.

## Commits

We strive to keep a consistent and clean git history. All contributions should adhere to the following:

1. A commit should do one atomic change on the repository
2. The commit message should be descriptive

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- **docs:** documentation changes (most common for this repo)
- **fix:** corrects an error in existing documentation
- **feat:** adds new documentation or significant new content
- Other types are allowed: `chore:`, `ci:`, `style:`, `refactor:`

### Commit Message Format

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Wrap the body at 72 characters
7. Use the body to explain *what* and *why* vs. *how*

Reference: [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

## Pull Request Process

1. Work on your own fork of the main repo.
2. Squash/organize your work into meaningful atomic commits.
3. Push your commits and make a **draft** pull request. Describe what the pull request is about and link the relevant issue.
4. While you wait, carefully review the diff yourself.
5. When you are happy with your changes, change your pull request to **"Ready for review"** and request a code review.
6. As a courtesy to the reviewer(s), you may mark commits that react to review comments with `fixup` (see `git commit --fixup`) rather than immediately squashing and force pushing.
7. When the review is concluded, squash what needs squashing and merge.

### Pull Request Scoping

Ideally a pull request will be small in scope and atomic, addressing precisely one issue. It is permissible to fix minor details (formatting, typos) in the vicinity of your work.

If you want to make changes that are not directly related to the issue you're working on, create a separate PR to avoid noise in the review process.

## Reporting Issues

Create a new issue to report problems with the documentation, including:

- Which document has the issue
- What is incorrect or unclear
- What you expected or suggest instead

## Proposing New Documentation

Create a new issue to propose new documentation, including:

- Brief description of the topic
- Why it should be documented
- Suggested location in the repository structure

## License

By contributing, you agree that your contributions will be licensed under the same license as this repository.
