## Set an issue's boundary

In Prisma, the boundary is an issue-framing convention for recording the team's current view of an issue's relevance to the decision:

- **In**: the issue is judged relevant to the decision or to confidence in it.
- **On**: the team is uncertain whether the issue is relevant; leave it visible for further assessment rather than treating that uncertainty as resolved.
- **Out**: the issue is judged not relevant to the current decision and is outside the active model scope.

This use of *boundary* is associated with Chevron's practice; it is not a standard term used consistently across decision-analysis and decision-quality literature. It is related to **requisite decision modeling**: include the distinctions needed to identify and justify a preferred action, without adding detail that cannot practically improve the decision. Relevance is not always known at the start, which is why **on** is useful. It does not mean "half included": record what is uncertain and what evidence or analysis could resolve it. **Out** means outside this model's current scope, not proven irrelevant for every future question.

For example, when deciding whether to drill an appraisal well, the team might list a possible adjacent reservoir compartment. If whether it contains movable hydrocarbons could plausibly change the drill recommendation or confidence in it, model the issue as **in**. If the team does not yet know whether it matters, mark it **on**, note what evidence (such as seismic interpretation or pressure data) could help, and revisit it. If sensitivity analysis shows that plausible values cannot change the recommendation or confidence in a practically meaningful way, the team may place it **out** and stop refining it. Revisit the boundary if new evidence changes that assessment.

Use sensitivity analysis when uncertainty in a probability or value could reverse the recommendation. Add a variable, branch, probability refinement, or utility detail only when it could plausibly affect the recommendation or confidence; stop elaborating when more detail would not improve the decision in a practically meaningful way.

Boundary is applied to **issues** in Prisma, and it does not replace issue classification or the diagram's inclusion rules. For example, Focus decisions and Key uncertainties enter by their respective designations, while Utility issues with boundary **in** or **on** enter the influence diagram. Check the inclusion explanation below when an issue is absent from the diagram.

![Issue boundary menu](<./menu - Boundary.png>)
