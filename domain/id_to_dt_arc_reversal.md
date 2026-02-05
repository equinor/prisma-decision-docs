## Arc reversal in ID to DT conversion

When reversing an arc between 2 chance nodes in an ID $X\rightarrow Y$ to $Y\rightarrow X$, this is equivalent to applying the Bayes' theorem

$$
P(Y|X) = \frac{P(Y)}{P(X)}P(X|Y).
$$

A condition for deciding about the need of reversing arcs is given in [^1]

> Any regular influence diagram can be transformed to a decision tree network 
by this process: While there is a reversible arc from a chance node in one 
decision window to a chance node in an earlier decision window, reverse the 
arc. 

In the above theorem, a decision tree network is a symmetric decision tree and a decision window contains the chance nodes observed for the first time between two consecutive decisions (see [Partial order](./partial_order.md)).


Let consider the used car buyer problem represented on the Figure below.

<br>

<p align="center">
<img src="./figures/used_car_buyer.png" 
    alt="Influence diagram of the used car buyer problem"
    title="Influence diagram of the used car buyer problem"
    width="400">
</p>

*Influence diagram of the used car buyer problem. T is the decision of testing or not, A is the decision of purchasing, R is the result of the test, O is the initial state of the car, and V<sub>1</sub>, V<sub>2</sub>, and V<sub>3</sub> are the cost of the test, the profit of the car and the maintenance costs.*


The decisions windows are

$$
W_1 = \emptyset, W_2 = {R}, W_3 = {O},
$$

which gives the partial order

$$
T \preceq R \preceq A \preceq O
$$  

In the influence diagram, there is an arc from the state of the car, $O$, and the test results, $R$. $R$ is found in an earlier decision window than $O$, and the arc from $O \rightarrow R$ needs to be reversed when converting to a DT (meaning applying the Bayes' theorem).

Now, if we had modelled the used car buyer problem with an arc $R \rightarrow O$ (thus deducing the possible state of the car from the test results), we would have the same partial order, but $R$ would point to the chance node $O$ which _not_ in an earlier decision window. Therefore, no arc reversal has to be done.

It is worth noticing that one of the advantages of influence diagrams (ID) to decision trees (DT) is that probabilities can be entered as observed. For example, we can naturally model the causality or the way conditional probabilities are measured, as for example, observing symptomes given the possible prevalence of a disease. The DT may use the reciprocal conditional probability and the brute-force conversion by computing the joint may be intractable in problems that have many chance variables [^2].


### See also
- [Influence diagram](./influence_diagram.md)
- [Decision tree](./decision_tree.md)
- [Partial order](./partial_order.md)


### References

[^1]: Shachter, Ross. (1990). An Ordered Examination of Influence Diagrams. Networks. 20. 535 - 563. 10.1002/net.3230200505.
[@ResearchGate](https://www.researchgate.net/publication/227656993_An_Ordered_Examination_of_Influence_Diagrams)

[^2]: Shenoy, Prakash. (2000).Valuation network representation and solution of asymmetric decision problems. European Journal of Operational Research. 121. 579-608.
[@ResearchGate](https://www.researchgate.net/publication/29441258_Valuation-Based_Systems_for_Bayesian_Decision_Analysis)
