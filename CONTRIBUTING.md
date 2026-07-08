# Contributing

We love your input! The following is a set of guidelines for contributing to **Prisma Decision Docs**.

Whether it's fixing a typo, improving explanations, proposing new documentation, or restructuring content — we want to make contributing as easy and transparent as possible.

## Ground Rules

1. Documentation should be clear, concise, and accurate.
2. All content should be written in Markdown.
3. Security vulnerabilities must be reported privately — see [SECURITY.md](SECURITY.md) if available.

## Getting Started

This repository contains the domain documentation and design decisions for the Prisma Decision project. It is a Markdown-based documentation repository — no build tools or programming languages are required.

### Prerequisites

- A text editor with Markdown support
- [Git](https://git-scm.com/)
- Familiarity with the Prisma Decision domain (see [README.md](README.md))

### Local Setup

```bash
git clone https://github.com/equinor/prisma-decision-docs.git
cd prisma-decision-docs
```

You can preview Markdown files using your editor's built-in preview (e.g., VS Code) or any Markdown viewer of your choice.

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
- Keep figures and images in the relevant subdirectory (e.g., `domain/figures/`).

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
