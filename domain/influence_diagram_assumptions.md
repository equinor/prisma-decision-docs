# Assumptions of classical influence diagrams

An [influence diagram](./influence_diagram.md) supports the representation and solution of sequential decision problems with multiple local utility functions under the **no-forgetting assumption**: perfect recall is assumed of all observations and decisions made in the past[^1]. Together with a few structural requirements on the graph, this defines the **classical single-decision-maker, no-forgetting formulation**. Zhang, Qi and Poole summarize the requirements as five constraints that one can impose on an influence diagram[^2]:

1. the acyclic constraint,
2. the regularity constraint,
3. the no-forgetting constraint,
4. the single-value-node constraint,
5. the no-children-to-value-node constraint.

These are a useful formulation, not five universal rules for every extension of IDs[^3][^4]. Each constraint is stated below with its rationale and with the extensions that relax it. Distinguishing them helps identify what a particular model and solver assume.

## 1. The acyclic constraint

**Statement.** Following arrow directions can never bring you back to the starting node; the diagram is a directed acyclic graph. For example, `A -> B -> A` is not allowed.

**Rationale.** An arc into an uncertainty says what its probabilities are conditioned on, and an arc into a decision says what is known when it is made. A cycle would make a quantity conditional on, or informed by, itself. Feedback over time must be represented with distinct variables for the different times, as in a dynamic Bayesian network.

**Relaxation.** None in the influence diagram family; acyclicity is a defining property of the graphical model.

## 2. The regularity constraint

**Statement.** There exists a directed path in the graph that contains all decision nodes[^2]. Equivalently, the decision nodes are totally ordered: for any two decisions, the model specifies which comes first, and there is only one sequence in which the decisions can be made[^1]. A diagram satisfying this is called *regular*.

**Rationale.** The regularity constraint comes from the fact that an influence diagram represents a single agent's view of the world as relevant to a decision problem[^2]. One decision maker takes the decisions one after another, so the order is known in advance and establishes when information can be used. The order of the decisions, together with the observations between them, defines the [partial order](./partial_order.md) used by the solution algorithms.

**Relaxation.** [Limited-memory influence diagrams](./limid.md) do not require a total order of the decisions: a LIMID is any acyclic graph in which only the explicit arcs into a decision define its information, and the solution methods work with the partial order induced by the graph, treating the decisions in any order compatible with it[^5]. Beyond that, if the order can itself depend on what happens, or if some decisions exist only on certain paths, a fixed order may not describe the actual problem at all (order asymmetry). Sequential influence diagrams[^6], unconstrained influence diagrams[^7] and decision analysis networks[^8], for instance, remove the requirement of a total order for this reason. See [asymmetry](./asymmetry.md).

## 3. The no-forgetting constraint

**Statement.** Each decision node and its parents are parents of all subsequent decision nodes[^2]. A later decision therefore has access to earlier decisions and to the information available at those decisions. In practice, the no-forgetting arcs are usually left implicit and added by the solver.

**Rationale.** Arcs into a decision node represent information availability only[^2]. The constraint is therefore a statement about the decision maker: a single agent with perfect recall does not lose information it once had. It is an assumption about the decision maker's information, not a consequence of simply drawing an acyclic graph. Under no forgetting, the problem can be solved by dynamic programming, settling the last decision first and working backwards, because the optimal choice at each decision depends only on what has been observed up to that point (the principle of optimality).

**When it fails.** The no-forgetting assumption often holds, but it breaks down in distributed decision making and in adversarial risk analysis, where the decisions are taken by several agents who cannot communicate with each other, such as military patrols acting on separate information[^9]. It also fails for a single decision maker who deliberately does not use earlier information, for example to keep a policy simple. If the no-forgetting assumption does not hold, the principle of optimality breaks down: the best policy at one decision can depend on the policies chosen at other decisions, and backward induction no longer applies in general[^9].

**Relaxation.** In case of non-perfect recall, [limited-memory influence diagrams](./limid.md) (LIMIDs) can be used[^5][^1]. In a LIMID, only the explicitly drawn arcs into a decision are available to it. An absent information arrow therefore has a different interpretation than in a classical no-forgetting diagram: it means the information is *not* used, rather than that it is implicitly remembered. Review the intended decision order and information availability whenever a solver accepts both interpretations.

## 4. The single-value-node constraint

**Statement.** There is exactly one value node, representing the overall objective used to compare consequences.

**Rationale.** A single terminal value gives a single number to maximize in expectation. It is a modeling convention, not a requirement that every effect be assessed in one enormous table.

**Relaxation.** Tatman and Shachter relaxed this constraint with the concept of *super value nodes*, which combine several value nodes by a sum or a product[^10]. A value function that is separable in this sense can be represented by several utility nodes, each with its own parents; see [utility separability](./utility_separability.md). Most software implements the additive case by convention.

## 5. The no-children-to-value-node constraint

**Statement.** Value nodes have no outgoing arrows (no children).

**Rationale.** A value node evaluates consequences; it is not an observed variable, so it cannot inform a decision, and it is not a random quantity, so it cannot condition an uncertainty. The nodes pointing to it specify what the value depends on.

**Relaxation.** With super value nodes, a value node may have another value node as child, so that the components flow into the super value node[^10]. The super value node itself has no children. Deterministic quantities that feed into a value, such as a cash flow, are modeled as deterministic uncertainty nodes rather than as value nodes with children.

## Summary

| Constraint | Graph statement | What it assumes | Relaxed by |
|---|---|---|---|
| Acyclic | No directed cycle | Conditioning and information are not circular | — |
| Regularity | A directed path contains all decisions | Single agent, known decision sequence | [LIMIDs](./limid.md)[^5]; sequential IDs[^6], unconstrained IDs[^7], decision analysis networks[^8], see [asymmetry](./asymmetry.md) |
| No forgetting | Each decision and its parents are parents of later decisions | Perfect recall | [LIMIDs](./limid.md) |
| Single value node | One value node | One objective to maximize | [Super value nodes](./utility_separability.md) |
| No children to value node | Value nodes are terminal | Values evaluate, they do not inform or condition | Super value nodes |

## See also

- [Influence diagrams](./influence_diagram.md)
- [Limited-memory influence diagrams](./limid.md)
- [Utility separability](./utility_separability.md)
- [Partial order](./partial_order.md)
- [Asymmetry in decision problems](./asymmetry.md)

## References

[^1]: Kjærulff, U. B. and Madsen, A. L. (2013). *Bayesian Networks and Influence Diagrams: A Guide to Construction and Analysis*, 2nd ed. Springer. [https://doi.org/10.1007/978-1-4614-5104-4](https://doi.org/10.1007/978-1-4614-5104-4).

[^2]: Zhang, N. L., Qi, R. and Poole, D. (1994). *A Computational Theory of Decision Networks*. International Journal of Approximate Reasoning, 11(2), 83-158. [https://doi.org/10.1016/0888-613X(94)90026-4](https://doi.org/10.1016/0888-613X(94)90026-4).

[^3]: Poole, D. L. and Mackworth, A. K. (2023). *Artificial Intelligence: Foundations of Computational Agents*, 3rd ed., section 12.3, Sequential Decisions. Cambridge University Press. [Open textbook](https://www.cs.ubc.ca/~poole/aibook/3e/html/ArtInt3e.Ch12.S3.html).

[^4]: Shachter, R. D. (1990). *An Ordered Examination of Influence Diagrams*. Networks, 20, 535-563. [https://doi.org/10.1002/net.3230200505](https://doi.org/10.1002/net.3230200505).

[^5]: Nilsson, D. and Lauritzen, S. L. (2000). *Evaluating Influence Diagrams Using LIMIDs*. Proceedings of the 16th Conference on Uncertainty in Artificial Intelligence, 436-445. [Open paper](https://arxiv.org/abs/1301.3881).

[^6]: Jensen, F. V., Nielsen, T. D. and Shenoy, P. P. (2006). *Sequential Influence Diagrams: A Unified Asymmetry Framework*. International Journal of Approximate Reasoning, 42(1-2), 101-118. [https://doi.org/10.1016/j.ijar.2005.10.007](https://doi.org/10.1016/j.ijar.2005.10.007).

[^7]: Jensen, F. V. and Vomlelova, M. (2002). *Unconstrained Influence Diagrams*. Proceedings of the 18th Conference on Uncertainty in Artificial Intelligence, 234-241. [Open paper](https://arxiv.org/abs/1301.0574).

[^8]: Díez, F. J., Luque, M. and Bermejo, I. (2018). *Decision Analysis Networks*. International Journal of Approximate Reasoning, 96, 1-17. [https://doi.org/10.1016/j.ijar.2018.02.007](https://doi.org/10.1016/j.ijar.2018.02.007); [open institutional record](https://hdl.handle.net/20.500.14468/12465).

[^9]: Salo, A., Andelmin, J. and Oliveira, F. (2022). *Decision Programming for Mixed-Integer Multi-Stage Optimization under Uncertainty*. European Journal of Operational Research, 299(2), 550-565. [https://doi.org/10.1016/j.ejor.2021.12.013](https://doi.org/10.1016/j.ejor.2021.12.013).

[^10]: Tatman, J. A. and Shachter, R. D. (1990). *Dynamic Programming and Influence Diagrams*. IEEE Transactions on Systems, Man, and Cybernetics, 20(2), 365-379. [https://doi.org/10.1109/21.52548](https://doi.org/10.1109/21.52548).
