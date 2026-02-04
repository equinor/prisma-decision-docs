## Partial order

### Definition

A strong connection between partial orderings and directed (acyclic) graphs exists[^1] and ordering elements of an [influence diagram](./influence_diagram.md) may be an important step in the analysis. 

A *binary relation* on a finite set of elements $N$ compares pairs of elements from $N$. For the binary relation $\preceq$, let's consider the properties:
 

- Reflexive: $x \preceq x$ for all $x \in N$; 
- Transitive: if $x \preceq y$ and $y \preceq z$, then $x \preceq z$ for all $x, y, \text{ and } z \in N$; 
- Antisymmetric: if $x \preceq y$ and $y \preceq x$, then $x$ is $y$ for all $x$ and $y \in N$;  
- Complete: $x \preceq y$ and/or $y \preceq x$ for all $x$ and $y \in N$. 

The relation $\preceq$ is a partial ordering if it is reflexive, transitive, and antisymmetric. A partial ordering is a total ordering if it is also complete. 

### Algorithm

Given the $m$ decision nodes $d_1, d_2, \ldots d_m$ in the influence diagram and assuming they are completely ordered (regularity constraint of the influence diagram), we have $m+1$ *decision windows*. A decision
window, $W_j$ contains the chance nodes observed for the first time between the decision $d_{j-1}$ and $d_{j}$.

Chance nodes that are never observed are included with those observed 
after the last decision in $W_{m+l}$. The windows partition then all of the chance nodes.

This leads to the algorithm

> 1. Inputs: The influence diagram without the value nodes; The order of decision nodes, $\mathcal D$
> 1. Initialize the partial order, $\preceq=\empty$
> 1. Repeat from the last node, $d$ in the decision order, $\mathcal D$, until $\mathcal D$ is empty :
>     1. Find all chance nodes in the decision windows preceeding $d$, $\mathcal C$
>     1. Add $d$ to $\preceq$
>     1. Add $\mathcal C$ to $\preceq$
>     1. Remove $d$ from $\mathcal D$
> 1. Add all reminding chance nodes to $\preceq$



**See also:**
- [Influence diagram](./influence_diagram.md)
- Topological order
- Decision tree
- Junction tree


**References:**

[^1]: Shachter, Ross. (1990). An Ordered Examination of Influence Diagrams. Networks. 20. 535 - 563. 10.1002/net.3230200505.
[@ResearchGate](https://www.researchgate.net/publication/227656993_An_Ordered_Examination_of_Influence_Diagrams)