# Asymmetry in decision problems

## What is asymmetry?

The basic limitation of [influence diagrams](./influence_diagram.md) is that they can only represent symmetric decision problems efficiently[^1]. In practice, virtually all real-world problems are asymmetric, in particular all those that involve the possibility of getting additional information at a cost[^2]. Often, such asymmetry arises because the states of one variable are constrained by the states of others: a state of one variable rules out some states of another, so some combinations are impossible and the joint state space is smaller than the Cartesian product of the individual state spaces[^3]. A [decision tree](./decision_tree.md) can show different branches with different subsequent choices and observations; a conventional influence diagram uses one set of nodes and links for every situation, so these differences must be represented elsewhere[^4][^2].

### Definition

Call a **scenario** a path from the root node to a leaf node in a decision tree. A decision problem is **symmetric** if

1. the number of scenarios is equal to the cardinality of the Cartesian product of the state spaces of all uncertainty and decision variables, and
2. in the decision tree, the sequence of uncertainty and decision variables is the same in all scenarios.

Problems that are not symmetric are **asymmetric**[^1][^5]. Shenoy's earlier definition considered only the first criterion[^6]. In the used car buyer problem, criterion 1 fails: the result *pass* or *fail* exists only on the *test* branch, so the tree has fewer scenarios than the product of the state spaces. In a problem where the decision maker chooses which of two inspections to perform first, criterion 2 fails as well.

This is not simply a question of unequal probabilities or unequal utilities. The distinction concerns which states, actions, observations, or sequences are possible and available in each context. Several forms can occur in the same problem.

### Types of asymmetry

Both Díez, Luque and Bermejo[^2] and Yet et al.[^3] use the two criteria above to define three types of asymmetry, with slightly different definitions. Yet et al. define:

- **Functional asymmetry.** The availability of some decision alternatives depends on preceding variables.
- **Structural asymmetry.** The possibility of a variable depends on the preceding variables; the variable is defined only given certain states of its predecessors.
- **Order asymmetry.** The sequential order of the variables is not defined.

Díez, Luque and Bermejo split the same phenomena as:

- **Domain asymmetry.** The value taken by a variable restricts the values that other variables can take.
- **Information asymmetry.** A variable $Y$ is observed for some values of a variable $X$ but not for others.
- **Order asymmetry.** The decisions can be made in different orders.

The two classifications correspond as follows. Functional asymmetry is closely related to domain asymmetry, with the restriction that Yet et al. only consider decision variables; structural asymmetry is equivalent to information asymmetry. In structural or information asymmetry an entire variable becomes impossible, while in functional or domain asymmetry only a state of a variable becomes unavailable. Jensen, Nielsen and Shenoy[^1] use *structural asymmetry* for any case where a variable depends on the past, thus covering both the functional and the structural asymmetry of Yet et al. The oil wildcatter problem is a typical example of structural asymmetry: only when the seismic test is performed can the test result be observed; in the used car buyer problem, $R$ plays the same role with respect to $T$.

| | Only a state is unavailable | A whole variable is unavailable | The order is not fixed |
|---|---|---|---|
| Yet et al.[^3] | Functional | Structural | Order |
| Díez et al.[^2] | Domain | Information | Order |
| Jensen et al.[^1] | Structural | Structural | Order |

Do not assume that *structural*, *functional*, and *informational* are exact synonyms across sources. Below, "functional" is used for context-dependent restrictions and relationships, including the domain asymmetry of Díez et al.

## Functional and domain asymmetry

### Context-dependent states and options

The possible outcomes or feasible actions, or the relationships among variables, can depend on the context. For example, if the team does not order a test, its result is **not performed**; positive and negative results are possible only if it orders the test. This is a restriction on the joint values of the test decision and result, often called **domain asymmetry**[^2]. Similarly, an option may be feasible only after a favorable inspection.

Related context-specific relationships can be expressed in functions or tables. For example, if no test is performed, the distribution of its result is always "not performed" regardless of the underlying condition. Thus the result's dependence on the condition changes with the test decision. This is a context-specific independence, not necessarily a restriction on which actions are allowed.

Zero probabilities can represent impossible *uncertainty outcomes*, but do not by themselves prohibit a decision maker from selecting an infeasible action. State-dependent action restrictions need explicit support or a carefully checked equivalent formulation (use of infinite cost). An unfavorable utility is not the same as an impossible action.

### Restriction links, restriction tables and framing functions

Decision analysis networks make this restriction explicit in the graph. A **restriction link** $X \to Y$ carries a **restriction table** that states, for each value of $X$, which values of $Y$ are possible; a value of $Y$ excluded for a given value of $X$ simply does not exist in that context, whether $Y$ is a decision or an uncertainty[^2]. The symmetric encoding above, in which the result has a *not performed* state and the decision an infeasible option with an infinite cost, is what the restriction table replaces: the solver uses the table to skip impossible configurations instead of carrying them through the computation. The idea is closely related to the **framing functions** of Qi, Zhang and Poole, which assign to each variable, for every configuration of its parents, the subset of its states that is possible in that configuration, so that a symmetrized influence diagram can be evaluated without unnecessary computation on impossible configurations[^7]. A restriction table is in effect a framing function with a single parent, attached to an explicit link.

### From restriction tables to a symmetric influence diagram

A restriction table is also a recipe for building the potentials of an equivalent *symmetric* influence diagram, which is what a classical solver needs[^2]. Read the table column by column, one column per value of the parent:

- A **total restriction** is a column in which *every* value of the child is impossible. The child does not exist in that context. Add a state **NA** (not applicable) to the child, give it probability 1 in that column (or, for a decision, make it the only admissible option), and set the regular states to probability 0.
- A **partial restriction** is a column in which *some* values of the child are impossible. The child exists but with a reduced domain. Set the probability of the excluded states to 0 in that column; for a decision, give the excluded options an infinite cost.

The following total and partial restrictions illustrate the two cases.

**Total restriction on an uncertainty.** The disease test can be positive or negative only if a test is made; the *No* column is a total restriction. The result node receives an NA state:

<table>
  <tr>
    <td style="border:none; vertical-align:middle;">

<table>
  <tr>
    <th style="background-color:#D3D3D3;">Test</th>
    <th style="background-color:#D3D3D3;">No</th>
    <th style="background-color:#D3D3D3;">Yes</th>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">Positive</th>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#90EE90;">1</td>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">Negative</th>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#90EE90;">1</td>
  </tr>
</table>

</td>
<td style="border:none; vertical-align:middle; font-size:1.5em;">&#8594;</td>
<td style="border:none; vertical-align:middle;">

<table>
  <tr>
    <th style="background-color:#D3D3D3;">Test</th>
    <th colspan="2" style="background-color:#D3D3D3;">No</th>
    <th colspan="2" style="background-color:#D3D3D3;">Yes</th>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">Disease</th>
    <th style="background-color:#D3D3D3;">Present</th>
    <th style="background-color:#D3D3D3;">Absent</th>
    <th style="background-color:#D3D3D3;">Present</th>
    <th style="background-color:#D3D3D3;">Absent</th>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">Positive</th>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#90EE90;">0.02</td>
    <td style="background-color:#90EE90;">0.96</td>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">Negative</th>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#90EE90;">0.98</td>
    <td style="background-color:#90EE90;">0.04</td>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">NA</th>
    <td style="background-color:#90EE90;">1</td>
    <td style="background-color:#90EE90;">1</td>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#FAA0A0;">0</td>
  </tr>
</table>

</td>
</tr>
</table>


Each column of the resulting conditional probability table still sums to 1, and the NA state carries the information "no test was made" to the decisions that observe the result.

**Partial restriction on a decision.** An *Advanced* build is possible only if the result of a prior study is *Good* or *Excellent*; the *Bad* column is a partial restriction, since the options *None* and *Conventional* remain available. The excluded combination receives an infinite cost in the utility table:

<table>
  <tr>
    <td style="border:none; vertical-align:middle;">

<table>
  <tr>
    <th style="background-color:#D3D3D3;">Result</th>
    <th style="background-color:#D3D3D3;">Bad</th>
    <th style="background-color:#D3D3D3;">Good</th>
    <th style="background-color:#D3D3D3;">Excellent</th>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">None</th>
    <td style="background-color:#90EE90;">1</td>
    <td style="background-color:#90EE90;">1</td>
    <td style="background-color:#90EE90;">1</td>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">Conventional</th>
    <td style="background-color:#90EE90;">1</td>
    <td style="background-color:#90EE90;">1</td>
    <td style="background-color:#90EE90;">1</td>
  </tr>
  <tr>
    <th style="background-color:#D3D3D3;">Advanced</th>
    <td style="background-color:#FAA0A0;">0</td>
    <td style="background-color:#90EE90;">1</td>
    <td style="background-color:#90EE90;">1</td>
  </tr>
</table>

</td>
<td style="border:none; vertical-align:middle; font-size:1.5em;">&#8594;</td>
<td style="border:none; vertical-align:middle;">

<table>
  <tr>
    <th style="background-color:#D3D3D3;">Result</th>
    <th style="background-color:#D3D3D3;">Build</th>
    <th style="background-color:#D3D3D3;">Cost</th>
  </tr>
  <tr>
    <th rowspan="3" style="background-color:#D3D3D3;">Bad</th>
    <td style="background-color:#D3D3D3;">None</td>
    <td style="background-color:#90EE90;">0</td>
  </tr>
  <tr>
    <td style="background-color:#D3D3D3;">Conventional</td>
    <td style="background-color:#90EE90;">-100000</td>
  </tr>
  <tr>
    <td style="background-color:#D3D3D3;">Advanced</td>
    <td style="background-color:#FAA0A0;">-&#8734;</td>
  </tr>
  <tr>
    <th rowspan="3" style="background-color:#D3D3D3;">Good</th>
    <td style="background-color:#D3D3D3;">None</td>
    <td style="background-color:#90EE90;">0</td>
  </tr>
  <tr>
    <td style="background-color:#D3D3D3;">Conventional</td>
    <td style="background-color:#90EE90;">-100000</td>
  </tr>
  <tr>
    <td style="background-color:#D3D3D3;">Advanced</td>
    <td style="background-color:#90EE90;">-500000</td>
  </tr>
  <tr>
    <th rowspan="3" style="background-color:#D3D3D3;">Excellent</th>
    <td style="background-color:#D3D3D3;">None</td>
    <td style="background-color:#90EE90;">0</td>
  </tr>
  <tr>
    <td style="background-color:#D3D3D3;">Conventional</td>
    <td style="background-color:#90EE90;">-100000</td>
  </tr>
  <tr>
    <td style="background-color:#D3D3D3;">Advanced</td>
    <td style="background-color:#90EE90;">-500000</td>
  </tr>
</table>

</td>
</tr>
</table>

The infinite cost guarantees that no optimal strategy selects *Advanced* after a *Bad* result, since any finite alternative is better. In software, use a negative number far larger in magnitude than any genuine utility, and check that it does not distort averages: because the excluded option is never chosen, it does not enter the expected utility of the optimal strategy.

Notice that for a restriction on a decision, making the cost conditional on the value of the parent requires an arc from that parent to the utility node: in the example, *Result* must become a parent of the cost node even if the genuine cost does not depend on it. This adds a parent, and hence a dimension, to the utility table, which is the price of expressing a restriction in a symmetric diagram. Restrictions on uncertainties, by contrast, only add a state to a node that already has the parent. In both cases the resulting diagram is symmetric and can be solved by any classical algorithm, at the cost of carrying the impossible configurations through the computation; asymmetric representations avoid this by using the restriction tables directly[^2][^7].

## Structural and information asymmetry

This is the *structural asymmetry* of Yet et al. and the *information asymmetry* of Díez et al.: a whole variable exists, or is observed, only for some values of a preceding variable[^2][^3]. For example, a test result is observed before the treatment decision only if the test is ordered. If no test is ordered, the decision maker must not be allowed to condition treatment on an unobserved positive or negative result.

This is different from a variable being uniformly unavailable in a [LIMID](./limid.md): here availability itself depends on the earlier context. In a symmetric encoding, the result variable receives a *not performed* (NA) state with probability 1 when no test is ordered, as shown [above](#from-restriction-tables-to-a-symmetric-influence-diagram); the treatment rule observes this variable and therefore learns, on the no-test path, only that no result exists. Check that the modeled information really matches the intended process and that probabilities remain normalized. Decision analysis networks represent the same situation directly with a **revelation link** $X \to Y$, annotated with the values of $X$ for which $Y$ is revealed, so that neither an NA state nor a total restriction is needed[^2].

## Order asymmetry

The order in which decisions or observations occur may depend on earlier choices or observations, or choosing the next step may itself be part of the strategy[^2][^8]. For instance, after an initial assessment a team may decide which of two inspections to perform first, and use that inspection's result when choosing the second step.

This differs from a merely unspecified [partial order](./partial_order.md): a partial order can leave two events incomparable without specifying a context-dependent rule for choosing their order. A fixed sequence of decisions can rule out adaptive ordering or incorrectly make later information available earlier. Likewise, an acyclic LIMID without a total order does not automatically specify how an order is selected.


## See also

- [Influence diagrams](./influence_diagram.md)
- [Limited-memory influence diagrams](./limid.md)
- [Decision tree](./decision_tree.md)
- [Partial order](./partial_order.md)

## References

[^1]: Jensen, F. V., Nielsen, T. D. and Shenoy, P. P. (2006). *Sequential Influence Diagrams: A Unified Asymmetry Framework*. International Journal of Approximate Reasoning, 42(1-2), 101-118. [https://doi.org/10.1016/j.ijar.2005.10.007](https://doi.org/10.1016/j.ijar.2005.10.007).

[^2]: Díez, F. J., Luque, M. and Bermejo, I. (2018). *Decision Analysis Networks*. International Journal of Approximate Reasoning, 96, 1-17. [https://doi.org/10.1016/j.ijar.2018.02.007](https://doi.org/10.1016/j.ijar.2018.02.007); [open institutional record](https://hdl.handle.net/20.500.14468/12465).

[^3]: Yet, B., Neil, M., Fenton, N., Constantinou, A. and Dementiev, E. (2018). *An Improved Method for Solving Hybrid Influence Diagrams*. International Journal of Approximate Reasoning, 95, 93-112. [https://doi.org/10.1016/j.ijar.2018.01.006](https://doi.org/10.1016/j.ijar.2018.01.006).

[^4]: Bielza, C. and Shenoy, P. P. (1997). *A Comparison of Decision Trees, Influence Diagrams and Valuation Networks for Asymmetric Decision Problems*. Proceedings of the Sixth International Workshop on Artificial Intelligence and Statistics, 39-46. [Open paper](https://proceedings.mlr.press/r1/bielza97b.html).

[^5]: Bielza, C., Gómez, M. and Shenoy, P. P. (2011). *A Review of Representation Issues and Modeling Challenges with Influence Diagrams*. Omega, 39(3), 227-241. [https://doi.org/10.1016/j.omega.2010.07.003](https://doi.org/10.1016/j.omega.2010.07.003).

[^6]: Shenoy, P. P. (2000). *Valuation Network Representation and Solution of Asymmetric Decision Problems*. European Journal of Operational Research, 121(3), 579-608. [https://doi.org/10.1016/S0377-2217(99)00055-7](https://doi.org/10.1016/S0377-2217(99)00055-7).

[^7]: Qi, R., Zhang, N. L. and Poole, D. (1994). *Solving Asymmetric Decision Problems with Influence Diagrams*. Proceedings of the 10th Conference on Uncertainty in Artificial Intelligence, 491-497. [https://doi.org/10.1016/B978-1-55860-332-5.50067-5](https://doi.org/10.1016/B978-1-55860-332-5.50067-5); [open paper](https://arxiv.org/abs/1302.6840).

[^8]: Jensen, F. V. and Vomlelova, M. (2002). *Unconstrained Influence Diagrams*. Proceedings of the 18th Conference on Uncertainty in Artificial Intelligence, 234-241. [Open paper](https://arxiv.org/abs/1301.0574).

[^9]: Nielsen, T. D. and Jensen, F. V. (2000). *Representing and Solving Asymmetric Bayesian Decision Problems*. Proceedings of the 16th Conference on Uncertainty in Artificial Intelligence, 416-425. [Open paper](https://arxiv.org/abs/1301.3879).
