# Limited-memory influence diagrams

## What is a LIMID?

A **limited-memory influence diagram** (LIMID)[^1][^2] is an [influence diagram](./influence_diagram.md) that retains the same basic representation: an acyclic directed graph of [decision, uncertainty, and utility nodes](./influence_diagram.md#node-types), with the same [probabilistic, information, and value meanings for arrows](./influence_diagram.md#reading-the-arrows). As with classical IDs, a strategy specifies a rule for each decision and is evaluated by its expected total utility using the model's probabilities and utility functions (see the [mathematical definition](./influence_diagram.md#mathematical-definition)).

The main difference is the information available to those rules. In a classical ID, the [no-forgetting assumption](./influence_diagram_assumptions.md) makes every earlier decision and observation available at later decisions. A LIMID relaxes this: each rule can depend on its specified information parents, and an earlier observation or decision is not available merely because it happened earlier. This makes restrictions on information explicit and can change which strategies are allowed and the best expected utility[^3][^4]. Depending on the formulation, LIMIDs may also relax the classical ordering of decisions, and may represent total utility with several additively combined utility nodes rather than one value node (see [utility separability](./utility_separability.md)).

## Reading information at decisions

For each decision, look at its **direct parents**: those are the variables on which its decision rule may depend. An earlier observation or decision is not automatically available just because it happened earlier, or because it has a directed path to the decision. Similarly, an uncertainty that affects utility is not necessarily observed.

An absent information arrow can mean different things:

- The variable has not been observed, or has not yet been realized when the decision is made.
- It was observed earlier but is no longer available to this decision, for example because a record was not passed on.
- It is physically available but deliberately excluded from the permitted decision rule, for example to describe a simplified model.
- In a simplified diagram, the arrow has been removed because the information has been shown to be **non-requisite**: it is not needed to obtain an optimal strategy for the original problem[^3].

The diagram alone may not say which interpretation applies. Document it. In particular, omitting information as a genuine restriction can reduce the best achievable expected utility, while removing a proven non-requisite link is intended to preserve an optimum. Do not remove a link merely because the information seems unimportant: its usefulness may depend on other observations and decisions.

Unlike the usual classical formulation, a LIMID need not impose a total order on all decisions[^4]. An information arrow from one decision to another means that the former decision's outcome is available to the latter; absence of such an arrow does not, by itself, establish that the decisions are simultaneous. Record the intended timing separately where needed, and do not give a decision information from the future. See [classical assumptions](./influence_diagram_assumptions.md) and [partial order](./partial_order.md).

## Advantages and limitations

LIMIDs share the [advantages and limitations of influence diagrams](./influence_diagram.md#advantages-and-limitations), including compactness, dependence on assessed inputs, computational cost, and difficulty displaying certain asymmetries.

**Additional advantages**

- They can represent decision rules with genuinely limited information without pretending that every earlier observation and action is remembered.
- When a link is proven non-requisite, omitting it can simplify an otherwise no-forgetting problem while preserving an optimal strategy; this can reduce computation[^3]. Multiple utility nodes can also make an additive objective more compact.
- They can represent some problems without a total decision order, including simultaneous decisions[^4].

**Additional limitations**

- A missing information link restricts the allowed rules unless it has been justified as a simplification. Accidentally omitting useful information can change the problem and its optimal value.
- Solving a general limited-memory problem may require joint optimization of decision rules rather than ordinary backward induction; some methods provide only local or approximate solutions[^3][^4].
- Limited memory or an unspecified total order alone does not model conditional observability, state-dependent feasible choices, or a decision order that changes with observations. These [asymmetries](./asymmetry.md) need further modeling and a compatible evaluation method.

## Related work on decision networks

Zhang, Qi, and Poole's *decision networks* are an influence-diagram-based representation that also considers decisions independent of some available information and permits separable utility and cooperative agents[^5]. Their work studies when networks can be decomposed and solved one decision at a time; in general, decisions may need to be considered together. This overlaps with the information and evaluation issues in LIMIDs, but the terms and assumptions are not automatically interchangeable.

The term *decision network* is also used in a more specific no-forgetting sense in the [arc-reversal note](./id_to_dt_arc_reversal.md). Check the definition used by each source rather than assuming that every decision network is a LIMID or has limited memory.

## See also

- [Decision trees](./decision_tree.md)
- [Influence diagrams](./influence_diagram.md)
- [Assumptions of classical influence diagrams](./influence_diagram_assumptions.md)
- [Asymmetry in decision problems](./asymmetry.md)
- [Utility separability](./utility_separability.md)
- [Partial order](./partial_order.md)
- [Arc reversal in ID to decision-tree conversion](./id_to_dt_arc_reversal.md)

## References

[^1]: Lauritzen, S. and Nilsson, D. (1999). *Limids of Decision Problems*. Research Report Series, No. R-99-2024. Aalborg Universitetsforlag.

[^2]: Lauritzen, S. L. and Nilsson, D. (2001). *Representing and Solving Decision Problems with Limited Information*. Management Science, 47(9), 1235-1251. [https://doi.org/10.1287/mnsc.47.9.1235.9779](https://doi.org/10.1287/mnsc.47.9.1235.9779).

[^3]: Nilsson, D. and Lauritzen, S. L. (2000). *Evaluating Influence Diagrams using LIMIDs*. Proceedings of the 16th Conference on Uncertainty in Artificial Intelligence, 436-445. [Open paper](https://arxiv.org/abs/1301.3881).

[^4]: Mauá, D. D., de Campos, C. P. and Zaffalon, M. (2012). *Solving Limited Memory Influence Diagrams*. Journal of Artificial Intelligence Research, 44, 97-140. [https://doi.org/10.1613/jair.3625](https://doi.org/10.1613/jair.3625); [open preprint](https://arxiv.org/abs/1109.1754).

[^5]: Zhang, N. L., Qi, R. and Poole, D. (1994). *A Computational Theory of Decision Networks*. International Journal of Approximate Reasoning, 11(2), 83-158. [https://doi.org/10.1016/0888-613X(94)90026-4](https://doi.org/10.1016/0888-613X(94)90026-4); [institutional record and abstract](https://repository.hkust.edu.hk/ir/Record/1783.1-46791).
