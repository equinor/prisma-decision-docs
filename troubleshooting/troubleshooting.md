# Troubleshooting Prisma

Start with the visible error or validation warning. Do not change assumptions
merely to make an unexplained result look plausible.

| What you see | What to check |
|---|---|
| No projects or a missing project | Confirm the instance and account, clear the project search, and review visibility and membership. An empty list can be normal for a new account. |
| A create, edit, or management action is missing | Check the selected project and your role. Some controls require Facilitator; screenshots may show controls unavailable to other roles. |
| An issue is absent from the influence diagram | Check boundary **in** or **on**, Focus status for decisions, Key status for uncertainties, and the required options or outcomes. |
| Invalid probability rows | Use fractions from 0 to 1, complete the applicable parent-state combinations, and check row sums. Review restriction tooltips for disabled cells. |
| Unexpected or inconsistent values | Check model inputs, value units, probability estimates, active issues, and unintended conditional selections. Compare the same model state in diagram and tree views. |
| A tree ends at a plus sign | Expand the branch. A plus placeholder is not a final outcome. |
| A whiteboard arrow has no effect on the model | Whiteboard arrows are annotations. Create the intended relationship in the influence diagram after agreeing its meaning and information timing. |
| An edit appears not to persist | Leave autosaved fields, or use the dialog's explicit Save/Add action. Wait for the request, inspect error notifications, and revisit the page to confirm. |
| A result appears stale | Save the intended inputs, wait for recalculation, and inspect warnings. A number already visible on screen is not proof that the latest edit has been evaluated. |
| An imported project is incomplete | Review what the export contains and check the new copy. Current downloads include stakeholder entries but not assessment submissions; retain review notes and important outputs separately. |
| A screen described in another guide is missing | Check the deployment and version. Financial-analysis, sensitivity, information-value, and drilling screens in the Word guide are not part of the current captured page set. |

## Before asking for support

Record the page, exact action, visible error, relevant inputs or selections, and
whether the model was recently edited. Use a sanitized training example when
possible. Do not send passwords, access tokens, or sensitive project exports.

Wait for pending actions to finish before retrying. Repeated clicks do not
correct invalid inputs and can make it harder to determine what was submitted.

Return to the [workflow guides](../workflow/workflow.md).