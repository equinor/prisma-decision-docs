# Figure source fragments

Each screenshot has a Markdown sidecar in the same page folder:

```text
workflow/
  README.md                          # Process index linking all page guides
  project_information.md             # Page guide
  assessments.md                     # Assessment page guide
  decision_quality.md                # Detailed scoring and discussion guidance
  figures/
    project_information/
      button - Download.png
      button - Download.md            # Reusable description and image
    issues/
      button - Create Issue.png
      button - Create Issue.md
    dq_assignment/                    # Assessment figures; existing paths retained
```

## Authoring

The Markdown files are the editable source of figure descriptions. Keep the
basename identical to the PNG, including spaces and capitalization. Each fragment
contains a heading, a short action-oriented description, and an image link:

```markdown
## Create an issue

Select **Create Issue** to open the form for adding an issue to the project.

![Create Issue button](<./button - Create Issue.png>)
```

Use angle brackets around image paths containing spaces. Keep links relative to
the fragment so it renders independently. Avoid page-level navigation or numbered
process steps inside fragments: the same figure may support different guides.
Descriptions can also follow the image. When a fragment starts with an image, a
multi-figure guide section places that image before its subsection heading.

Add the Markdown file before introducing its screenshot in
[pages.mjs](../../tools/pages.mjs). Recapturing replaces PNGs, not these descriptions.
See the [tooling guide](../../tools/README.md) for capture and validation commands.

## Composition

1. **Figure fragments** here describe individual controls, dialogs, and page states.
2. **Page guides** under `workflow/` select and order those fragments into tasks.
   The merger adjusts headings and rebases image paths to the destination document.
3. **Process index** at [workflow/workflow.md](../workflow.md) links the page guides
   in the decision workflow, allowing the process to be revisited iteratively.

Run `node tools/merge-guides.mjs` from the repository root to rebuild page guides.
Edit [guides.mjs](../../tools/guides.mjs) for the task order and guide introductions;
edit these fragments for individual figure descriptions. Generated guides are
replaced on each merge; the process index and detailed decision-quality guidance
are maintained separately. Capture order is not the final reading order.

## Page folders

| Page | Figure sources |
|---|---|
| Home | [home](./home/) |
| Project information | [project_information](./project_information/) |
| Objectives | [objectives](./objectives/) |
| Issues | [issues](./issues/) |
| Strategies | [strategies](./strategies/) |
| Stakeholder matrix | [stakeholder_matrix](./stakeholder_matrix/) |
| Whiteboard | [whiteboard](./whiteboard/) |
| Influence diagram | [influence_diagram](./influence_diagram/) |
| Decision tree | [decision_tree](./decision_tree/) |
| Compact tree | [compact_tree](./compact_tree/) |
| Solution tree | [solution_tree](./solution_tree/) |
| Assessments | [dq_assignment](./dq_assignment/) |

The older [assessments](./assessments/) overview is retained for compatibility;
new assessment captures and descriptions use `dq_assignment/`.
