# Decision trees

## What is a decision tree?

A decision tree is a branching representation of a decision problem. It lays out the choices, uncertain outcomes, and consequences in the order in which they are considered. Each path from the start to an endpoint describes one possible sequence of actions and outcomes[^1]. It is a model of the problem, not a prediction that a particular path will occur.

This note concerns decision trees for **decision analysis**, not the similarly named machine-learning models used for classification or prediction. A decision-analysis tree can be evaluated to find a preferred **strategy**: a choice for each situation in which a decision may be made.

## Nodes, branches, and paths

Trees are commonly drawn from left to right, starting at the **root**. A node marks a point in the sequence; a branch leads to the next node or endpoint.

| Element | Conventional shape | Meaning |
|---|---|---|
| **Decision node** | Square | A choice under the decision maker's control. Each branch is a feasible option; it is not assigned a probability as if it were an uncertainty. |
| **Uncertainty node** | Circle | Also called a chance node. An uncertain outcome. Branches show possible outcomes and their conditional probabilities at that point. |
| **Terminal node** | Endpoint or triangle | The consequence of the complete path, expressed as a payoff or utility. |

At each uncertainty node, the possible branches should be mutually exclusive and exhaustive, with probabilities between 0 and 1 that sum to 1. Probabilities are conditional on the relevant preceding history, including choices already made. A probability along a path is obtained by multiplying the relevant chance-branch probabilities; decision branches themselves are choices, not random events. A path probability for a strategy depends on which decision branches that strategy selects.

A terminal value should capture all consequences on that path, including applicable costs, without counting them twice. It can be a monetary payoff or an assessed utility. Maximizing expected monetary value uses money directly and corresponds to risk-neutral preferences for money; a utility function can instead represent risk preferences[^2]. Expected utility is an average under the model, not a guaranteed outcome.

## Information and timing

Read a path in sequence. A decision may depend only on information available when it is made, not on later outcomes or earlier events that were not observed. Placing an uncertainty before a decision and optimizing each resulting decision node independently normally lets the choice depend on that uncertainty. Do so only when its outcome is known at that decision.

An unobserved quantity can still affect later probabilities and payoffs. For example, a test result may be observed while the underlying condition remains unknown. With limited memory or unobserved earlier events, different paths can be indistinguishable to the decision maker. Their corresponding decision nodes must then use the same action for the same available information; independently choosing the best action at each node would give the decision maker information it does not have. These information restrictions require care when representing or evaluating a [LIMID](./limid.md) as a tree.

### LIMIDs and decision-tree conversion

Converting a LIMID to a tree is possible, but a plain decision tree does not automatically preserve its information restrictions. A separate decision node is normally drawn for each path history, and ordinary rollback treats those nodes as separate choices. This lets a rule depend on everything along its path, as if the decision maker remembered it all. A LIMID rule, by contrast, may depend only on the decision's specified information parents.

For example, in the [LIMID worked example](./limid.md#a-worked-example), the follow-up decision receives neither the observed signal nor the initial action. A tree that first branches on the signal and initial action will therefore contain several follow-up nodes. If each is optimized independently, the tree can choose one follow-up action after signal A and another after signal B, even though the LIMID's follow-up rule cannot distinguish those cases. The tree would then describe a more informed decision maker and could report an unattainable expected utility. All those follow-up nodes must instead share the same action when their histories differ only in information unavailable to that decision.

Some tree formalisms represent this with **information sets**, groups of decision nodes that the decision maker cannot distinguish; another option is to constrain them to use the same policy. In either case, evaluation must optimize those linked choices together[^3][^4]. Ordinary node-by-node rollback is valid only when each decision can use the history represented by its path, or when the rollback method explicitly enforces the information constraints. If the LIMID does not specify a total order for its decisions, a tree also needs an explicit timing/order consistent with the model; an arbitrary order can accidentally make one decision appear to know another decision's choice.

## A worked example

Use the [used car buyer problem](./influence_diagram.md#a-worked-example). The buyer decides whether to pay $20 for a test, then whether to buy the car. The car is a peach with prior probability 0.8 and a lemon with probability 0.2. A test passes with probability 0.9 for a peach and 0.4 for a lemon; if no test is made, there is no result. Buying yields $200, with maintenance costs of $50 for a peach and $500 for a lemon; not buying yields 0. The test costs $20 whether or not the buyer ultimately purchases the car.

The tree below uses `C` for an uncertainty node and `D` for a decision node. Numbers on weather branches are conditional probabilities; numbers after the arrows are terminal utilities.

```text
D: Test choice
|-- Test (cost 20) -> C: Test result
|   |-- Pass (0.8) -> D: Purchase
|   |   |-- Buy -> C: Car condition given pass
|   |   |   |-- Peach (0.9) ->  130
|   |   |   `-- Lemon (0.1) -> -320
|   |   `-- Do not buy -> -20
|   `-- Fail (0.2) -> D: Purchase
|       |-- Buy -> C: Car condition given fail
|       |   |-- Peach (0.4) ->  130
|       |   `-- Lemon (0.6) -> -320
|       `-- Do not buy -> -20
`-- No test -> D: Purchase
    |-- Buy -> C: Car condition
    |   |-- Peach (0.8) ->  150
    |   `-- Lemon (0.2) -> -300
    `-- Do not buy ->    0
```

The car's condition appears after the purchase choice because it is hidden when the buyer decides whether to buy. After a test, the tree uses the probabilities of the car's condition given the observed result: $P(\text{peach}\mid\text{pass})=0.9$ and $P(\text{peach}\mid\text{fail})=0.4$, derived from the influence-diagram probabilities by Bayes' theorem. Terminal values include all applicable costs, including the test fee on both test branches.

## Evaluating the tree

For a finite tree in which each decision node can use the history represented by its path, evaluate from the endpoints back to the root, a process called **rollback** or **backward induction**[^1]:

1. At each uncertainty node, take the probability-weighted average of the values of its branches.
2. At each decision node, select a feasible branch with the highest value. Record the choice for that situation; ties can yield more than one optimal choice.
3. Continue until the root is evaluated. The recorded choices form an optimal strategy and the root value is its expected utility under the model.

In the example, without testing, buying is worth $0.8 \times 150 + 0.2 \times (-300) = 60$, versus 0 for not buying. After a pass, buying is worth $0.9 \times 130 + 0.1 \times (-320) = 85$, versus -20 for not buying. After a fail, buying is worth $0.4 \times 130 + 0.6 \times (-320) = -140$, so not buying is better at -20. Thus the test strategy is to buy after a pass and not buy after a fail; its expected utility is $0.8 \times 85 + 0.2 \times (-20) = 64$. Since 64 exceeds 60, the optimal first choice is to test, matching the influence-diagram analysis.

Rollback must respect information restrictions: when indistinguishable decision nodes must share an action, optimizing each independently is not generally valid. Zero-probability branches do not affect the expected value under the model; choices there are not determined by that expected value alone.

## Advantages and limitations

**Advantages**

- Paths make the sequence of choices, observations, and consequences explicit and can be easy to explain for small problems.
- Different branches can have different options, observations, or next steps, making many [asymmetries](./asymmetry.md) natural to display[^5].
- Rollback provides a transparent calculation and a contingent strategy when its information assumptions hold.

**Limitations**

- Trees can grow rapidly as choices and uncertainties multiply. Repeated subproblems and probabilities make large trees difficult to read, maintain, and check[^3].
- A tree does not automatically make probabilistic dependencies or conditional independencies as compact or visible as an [influence diagram](./influence_diagram.md). Probabilities may need to be recalculated when the order of information differs from the original probability model.
- Ordinary node-by-node rollback assumes the decision can use the relevant path history; limited memory or other linked decision constraints may require a different evaluation method.

## See also

- [Influence diagrams](./influence_diagram.md)
- [Limited-memory influence diagrams](./limid.md)
- [Asymmetry in decision problems](./asymmetry.md)
- [Arc reversal in ID to decision-tree conversion](./id_to_dt_arc_reversal.md)
- [Decision analysis](./decision_analysis.md)

## References

[^1]: Aleem, I. S., Schemitsch, E. H. and Hanson, B. P. (2008). *What is a Clinical Decision Analysis Study?* Indian Journal of Orthopaedics, 42(2), 137-139. [Open paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC2759613/).

[^2]: Poole, D. L. and Mackworth, A. K. (2023). *Artificial Intelligence: Foundations of Computational Agents*, 3rd ed., section 12.1, Preferences and Utility. Cambridge University Press. [Open textbook](https://www.cs.ubc.ca/~poole/aibook/3e/html/ArtInt3e.Ch12.S1.html).

[^3]: Lauritzen, S. L. and Nilsson, D. (2001). *Representing and Solving Decision Problems with Limited Information*. Management Science, 47(9), 1235-1251. [https://doi.org/10.1287/mnsc.47.9.1235.9779](https://doi.org/10.1287/mnsc.47.9.1235.9779).

[^4]: Mauá, D. D., de Campos, C. P. and Zaffalon, M. (2012). *Solving Limited Memory Influence Diagrams*. Journal of Artificial Intelligence Research, 44, 97-140. [https://doi.org/10.1613/jair.3625](https://doi.org/10.1613/jair.3625); [open preprint](https://arxiv.org/abs/1109.1754).

[^5]: Bielza, C. and Shenoy, P. P. (1997). *A Comparison of Decision Trees, Influence Diagrams and Valuation Networks for Asymmetric Decision Problems*. Proceedings of the Sixth International Workshop on Artificial Intelligence and Statistics, 39-46. [Open paper](https://proceedings.mlr.press/r1/bielza97b.html).