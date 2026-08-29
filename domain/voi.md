# Value of Information in Influence Diagrams and LIMIDs

## A Technical Note

---

**Abstract.**
This note gives a self-contained, technically rigorous treatment of value of
information (VOI) for graphical decision models.  We cover the foundational
decision-theoretic definitions, the graph-structural conditions that determine
when and how VOI can be computed, the differences between classical influence
diagrams (IDs) and Limited Memory Influence Diagrams (LIMIDs), and a unified
framework that handles both exogenous and downstream (counterfactual) variables
in a single algorithm.  All results are stated as general algorithms; no
library-specific code is included.

---

## Table of Contents

1. [Decision-Theoretic Foundations](#1-decision-theoretic-foundations)
2. [Influence Diagrams: Structure and Semantics](#2-influence-diagrams-structure-and-semantics)
3. [EVPI: Definition and Graph Interpretation](#3-evpi-definition-and-graph-interpretation)
4. [Three Necessary Conditions for EVPI > 0](#4-three-necessary-conditions-for-evpi--0)
5. [Value of Imperfect Information (EVSI)](#5-value-of-imperfect-information-evsi)
6. [Limited Memory Influence Diagrams (LIMIDs)](#6-limited-memory-influence-diagrams-limids)
7. [Converting a Classical ID to a Soluble LIMID](#7-converting-a-classical-id-to-a-soluble-limid)
8. [VOI and Memory Structure in LIMIDs](#8-voi-and-memory-structure-in-limids)
9. [Exogenous vs. Downstream Variables: The Counterfactual Problem](#9-exogenous-vs-downstream-variables-the-counterfactual-problem)
10. [Unified VOI Framework](#10-unified-voi-framework)
11. [Requisite Information](#11-requisite-information)
12. [Worked Example: Three-Stage Sequential Decision](#12-worked-example-three-stage-sequential-decision)
13. [Summary of Key Results](#13-summary-of-key-results)
14. [References](#14-references)

---

## 1. Decision-Theoretic Foundations

### 1.1 Basic setup

A decision problem consists of:

- A finite set of **actions** $\mathcal{A} = \{d_1, \ldots, d_k\}$.
- A **state of nature** $\Theta$ with prior distribution $P(\theta)$, representing
  the uncertainty not controlled by the decision maker.
- A **utility function** $V : \mathcal{A} \times \Omega_\Theta \to \mathbb{R}$
  scoring the payoff of each action–state pair.

The **maximum expected utility (MEU)** without any additional information is:

$$
\text{MEU}_0 = \max_{d \in \mathcal{A}}\; \mathbb{E}_\Theta[V(d, \Theta)]
= \max_d \sum_\theta P(\theta)\, V(d, \theta)
$$

### 1.2 Value of Perfect Information

A **clairvoyant** (in Howard's sense) reveals the true realisation of $\Theta$
*before* the decision maker acts.  This allows the decision to be conditioned on
$\theta$, converting a static decision into a **state-contingent policy**
$d^*(\theta) = \arg\max_d V(d, \theta)$.

The resulting expected utility is:

$$
\text{MEU}_{\text{PI}} = \mathbb{E}_\Theta\!\left[\max_d V(d, \Theta)\right]
= \sum_\theta P(\theta)\, \max_d V(d, \theta)
$$

The **Expected Value of Perfect Information** is:

$$
\text{EVPI}(\Theta)
= \text{MEU}_{\text{PI}} - \text{MEU}_0
= \mathbb{E}_\Theta\!\left[\max_d V(d,\Theta)\right]
- \max_d \mathbb{E}_\Theta[V(d,\Theta)]
\ge 0
$$

The inequality is Jensen's inequality applied to the convex max operator
[1, 2].  Equality holds if and only if a single action is optimal for every
realisation of $\Theta$ (i.e., one action dominates under every scenario).

**Howard (1966)** [1] used the term **Value of Clairvoyance (VoC)** as a
synonym for EVPI.  In Howard's framework $\Theta$ is always exogenous —
determined independently of the action — so the terms are interchangeable.
This note uses EVPI throughout; the term VoC is reserved for Howard's original
exogenous-observation thought experiment, not for any downstream/counterfactual
extension.

### 1.3 The fundamental inequality

The non-negativity of EVPI is a consequence of:

$$
\mathbb{E}\!\left[\max_d f(d, \Theta)\right]
\ge \max_d \mathbb{E}[f(d, \Theta)]
$$

which holds for any function $f$ because adapting after observing $\Theta$ is
always at least as good as committing before observing it [2].

### 1.4 Pre-posterior analysis

Raiffa and Schlaifer [2] introduced the term **pre-posterior analysis** for
computing EVPI (and EVSI) before any experiment is run.  The analysis is
"pre-posterior" in the sense that it averages over the distribution of possible
posterior beliefs the decision maker would hold after observing the signal.

For a signal $Z$ with distribution $P(z)$ and posterior $P(\theta \mid z)$:

$$
\text{EVSI}(Z)
= \mathbb{E}_Z\!\left[\max_d \mathbb{E}_\Theta[V(d,\Theta) \mid Z]\right]
- \max_d \mathbb{E}_\Theta[V(d,\Theta)]
$$

EVSI equals EVPI when $Z = \Theta$ (perfect signal).

---

## 2. Influence Diagrams: Structure and Semantics

### 2.1 Nodes and arcs

An **influence diagram** (ID) is a DAG whose nodes partition into three types [3]:

| Type | Symbol | Role |
|---|---|---|
| Chance node | Circle | A random variable governed by a CPT |
| Decision node | Rectangle | An action chosen by the agent |
| Utility node | Diamond | A real-valued payoff function |

**Arcs** carry two distinct semantics depending on the type of the child node:

- **Causal arc** (into a chance or utility node): the parent is a probabilistic
  or functional cause of the child.  The child's CPT or utility table conditions
  on the parent.
- **Information arc** (into a decision node): the parent's value is *known* to
  the decision maker before the decision is taken.  Changing an information arc
  does not alter any CPT or utility table.

These must not be confused: adding a causal arc modifies the probability model;
adding an information arc expands the policy space [4, 5].

### 2.2 The no-forgetting assumption

In a **classical ID**, a partial temporal order on decisions $D_1 \prec D_2
\prec \cdots \prec D_n$ is assumed.  The **no-forgetting assumption** states that
every piece of information available at stage $k$ is also available at all later
stages.  Letting $H_k$ denote the information set of $D_k$:

$$
H_k \supseteq H_{k-1} \cup \{D_{k-1}\}
\quad \forall k > 1
$$

This assumption is *implicit* in classical IDs: solvers enforce it automatically
without it being encoded as explicit arcs.

### 2.3 Solving a classical ID

The standard solution methods are:

- **Arc reversal** (Shachter 1986 [3]): iteratively reverse probability arcs and
  remove barren nodes until the graph collapses to a single utility value.
- **Variable elimination / junction tree**: convert the ID to a join tree and
  run a message-passing schedule [6].

Both methods are exact and find the globally optimal policy under the
no-forgetting assumption.

### 2.4 Computing EVPI in a classical ID

Let $X$ be a chance node not currently in the information set of $D_i$.  The
**graph-based EVPI recipe** is [3]:

1. Copy the diagram $G$ into $G'$.
2. Add the arc $X \to D_i$ in $G'$.  Under no-forgetting, also add $X \to D_k$
   for every $k > i$ (the information propagates forward automatically in a
   classical solver, but the arc must be present for a LIMID solver).
3. Solve $G'$ to obtain $\text{MEU}'$.
4. Return $\text{EVPI}(X) = \text{MEU}' - \text{MEU}$.

The augmented diagram $G'$ must be a valid DAG; if adding $X \to D_i$ would
create a cycle, the variable is **not a legitimate information source** for $D_i$
(see §9).

---

## 3. EVPI: Definition and Graph Interpretation

### 3.1 EVPI in the ID framework

In an ID with chance nodes $\mathbf{X}$, decision nodes $\mathbf{D}$, and utility
nodes $\mathbf{U}$, the MEU without additional information is:

$$
\text{MEU}(G) = \max_{\delta} \mathbb{E}_\mathbf{X}\!\left[
\sum_u U_u(\text{Pa}(U_u)) \;\Big|\; \delta
\right]
$$

where $\delta = \{\delta_i\}$ is a policy assigning an action to each decision
node conditional on its information set, and the expectation marginalises over
all chance nodes.

The EVPI of a chance node $X$ with respect to decision $D_i$ is the gain in
optimal MEU when $X$ is added to the information set of $D_i$ (and, under
no-forgetting, to all later decisions):

$$
\text{EVPI}(X, D_i) = \text{MEU}(G + \{X \to D_i\}) - \text{MEU}(G)
$$

### 3.2 EVPI is a policy-space expansion, not just a value calculation

A critical insight is that adding the arc $X \to D_i$ does **not** change the
probability model of the ID — no CPT is altered.  It enlarges the space of
admissible policies: the optimal policy at $D_i$ can now condition on the value
of $X$, not just on its previous information set.  The gain arises because this
enlarged policy space contains strategies that were previously unavailable [3, 4].

---

## 4. Three Necessary Conditions for EVPI > 0

All three conditions must hold simultaneously.  Failure of any one implies
$\text{EVPI}(X, D_i) = 0$ and the augmented diagram need not be solved.

### 4.1 Condition 1: d-Separation (graphical reachability)

$X$ must not be d-separated from the utility nodes given the information already
available at $D_i$.  Formally, using the Bayes-ball algorithm [7]:

$$
\text{EVPI}(X, D_i) = 0
\quad \text{if} \quad
X \perp_d \mathbf{U} \mid \text{Pa}(D_i)
$$

**Rationale:** if no information can flow from $X$ to $\mathbf{U}$ in the graph,
conditioning on $X$ cannot change the posterior distribution over utility, hence
no gain is possible.

**Algorithm (d-separation check):**
```
Input : BN derived from the ID (ignoring decision/utility types),
        query node X, utility nodes U, observed set S = Pa(D_i)
Output: True if X ⊥_d U | S (no VOI possible), False otherwise

Run Bayes-ball from X in the BN:
  Mark X as the source.
  Propagate balls forward and backward according to the d-separation rules
  (blocked at non-colliders in S, activated at colliders with descendants in S).
  If any utility node U_u is reachable → return False (d-connection exists).
  If no utility node is reachable  → return True  (d-separated, EVPI = 0).
```

This check is $O(|V| + |E|)$ and avoids solving the augmented diagram.

### 4.2 Condition 2: Requisiteness

Even when $X$ is d-connected to $\mathbf{U}$, it may still have zero EVPI if
the **optimal policy does not change** across different values of $X$ [5, 8].

Formally, $X$ is **requisite** for $D_i$ if:

$$
\exists x_1, x_2 \in \Omega_X : \quad
\arg\max_d \mathbb{E}[V \mid X = x_1,\, \text{Pa}(D_i)]
\ne
\arg\max_d \mathbb{E}[V \mid X = x_2,\, \text{Pa}(D_i)]
$$

If the argmax is the same for all $x$, then $X$ affects the MEU but not the
optimal decision, so $\text{EVPI}(X, D_i) = 0$.

**Requisiteness algorithm (for parent $X$ of $D_i$):**
```
Input : ID G, decision D_i, candidate parent X
Output: True if X is requisite for D_i, False otherwise

For each conditioning configuration of Pa(D_i) \ {X}:
  Compute q(d, x) = E[V | X=x, Pa(D_i)\{X} = c] for all d, x.
  If argmax_d q(d, x1) ≠ argmax_d q(d, x2) for some x1 ≠ x2:
    return True   (X is requisite)
return False
```

### 4.3 Condition 3: Temporal feasibility

The arc $X \to D_i$ is a legitimate **information arc** only if $X$ is
observable before $D_i$ is executed.  In the causal graph, $X$ must not be a
descendant of $D_i$ through any causal path.  This condition is the subject of §9.

### 4.4 Applying the three conditions

The recommended order is cheapest-first:

```
Algorithm: EVPI_with_screening(G, X, D_i)

Step 1 — d-separation check (O(|V|+|E|)):
  If X ⊥_d U | Pa(D_i):  return 0.0

Step 2 — Temporal feasibility check (O(|V|+|E|)):
  If D_i is a causal ancestor of X:
    → X is downstream; switch to counterfactual construction (§9–10)

Step 3 — Augmented diagram solve (expensive):
  G' ← copy(G) + arc X → D_i (and forward under no-forgetting)
  MEU' ← solve(G')
  EVPI ← MEU' − MEU(G)
  If EVPI = 0: X is non-requisite (record for pruning)
  return EVPI
```

---

## 5. Value of Imperfect Information (EVSI)

### 5.1 Definition

Rather than observing $X$ perfectly, the decision maker receives a signal $Z$
that is stochastically related to $X$.  The conditional distribution $P(Z \mid X)$
is the **likelihood** of the signal.

$$
\text{EVSI}(Z, D_i)
= \mathbb{E}_Z\!\left[\max_d \mathbb{E}[V \mid Z, D_i = d]\right]
- \max_d \mathbb{E}[V \mid D_i = d]
$$

### 5.2 Relationship to EVPI

By the data-processing inequality:

$$
0 \le \text{EVSI}(Z) \le \text{EVPI}(X) \le \text{EVPI}(\Theta)
$$

where $\Theta$ is the full state of nature.  EVSI reaches EVPI when $Z$ is a
sufficient statistic for $X$ (i.e., $P(X \mid Z) = P(X \mid Z, \text{rest})$).

### 5.3 Graph representation

In an ID, a signal $Z$ is modelled by:

1. Adding a new chance node $Z$ with parents including $X$ (the informative
   relationship) and any confounders.
2. Adding the information arc $Z \to D_i$.
3. Solving the augmented diagram to obtain EVSI.

The structure is identical to the EVPI recipe; the difference is that $Z \ne X$
and $P(Z \mid X)$ encodes the imperfection of the signal.

---

## 6. Limited Memory Influence Diagrams (LIMIDs)

### 6.1 Definition

A **Limited Memory Influence Diagram (LIMID)** is an ID in which the
no-forgetting assumption is *dropped* [9].  Each decision node's information set
is exactly its set of direct parents in the graph:

$$
H(D_i) = \text{Pa}(D_i) \cap (\text{Chance} \cup \text{Decision})
$$

No information is implicitly inherited from earlier stages.

### 6.2 Solution method: Single Policy Updating (SPU)

Lauritzen and Nilsson [9] proposed **Single Policy Updating (SPU)** as the
canonical algorithm for LIMIDs.

**SPU algorithm:**
```
Input : LIMID G, convergence tolerance ε
Output: policy δ = {δ_i} and MEU

Initialise each δ_i randomly or uniformly.
Repeat:
  Δ ← 0
  For each decision node D_i (in some fixed order):
    Holding all other δ_j (j ≠ i) fixed:
      Compute the expected utility of each action at D_i
      conditional on its information set H(D_i).
      δ_i ← argmax policy (best response at D_i).
      Δ ← max(Δ, change in MEU at D_i).
Until Δ < ε.
Return δ, MEU.
```

SPU converges to a **Nash equilibrium** of the multi-agent game induced by the
decision nodes.  This is a local optimum of the overall MEU.

### 6.3 Solubility

A LIMID is **soluble** if there exists an elimination ordering of decision nodes
such that each decision node's locally optimal policy (best response given the
rest) is also globally optimal.  In a soluble LIMID, SPU run in the correct
elimination order converges to the global optimum in a single pass [9].

**Sufficient condition for solubility:** A LIMID is soluble if the following
holds for every pair of decision nodes $D_i \prec D_j$:

$$
H(D_j) \supseteq H(D_i) \cup \{D_i\}
$$

i.e., each later decision sees everything the earlier decision saw, plus the
earlier decision itself.  This is exactly the no-forgetting condition — a LIMID
satisfying it is equivalent to a classical ID.

### 6.4 SPU exactness for soluble LIMIDs

**Proposition.** If a LIMID is soluble, SPU run in reverse decision order
finds the globally optimal policy and the resulting MEU is exact.

*Proof sketch.* Under solubility, backward induction in reverse decision order
gives globally optimal policies stage by stage.  Each stage's best response,
given the globally optimal policy of all later stages, is identical to the result
of backward induction in the classical ID.  SPU in reverse order replicates this
sequence exactly, so convergence is guaranteed in one pass with exact result. ∎

For a non-soluble LIMID, SPU is only guaranteed to find a Nash equilibrium, and
the true global optimum may be strictly higher.  Any EVPI computed by solving a
non-soluble augmented LIMID is therefore a **lower bound** on the true EVPI.

---

## 7. Converting a Classical ID to a Soluble LIMID

### 7.1 Motivation

Lauritzen & Nilsson introduced LIMIDs precisely to *remove* the no-forgetting
assumption [9, 13].  In their formalism each decision node's information set is
exactly its set of direct parents — nothing more is inherited.  This is a
design choice, not a limitation: it allows LIMIDs to model situations where an
agent genuinely cannot remember all previous observations.

The consequence is that **the no-forgetting assumption does not carry over
automatically** when a classical ID is translated into a LIMID.  A LIMID solver
does not enforce it.  When the same arc set is copied from a classical ID into a
LIMID without adding no-forgetting arcs explicitly, later decisions will have
*less* information than the classical ID assumed, the MEU will generally be
lower, and all EVPI values will differ.

To obtain a LIMID that is semantically equivalent to a classical ID, all
no-forgetting arcs must be materialised as explicit graph arcs, as described in
§7.2 below.  The result is the **full-memory LIMID**.

**Implication for EVPI computation.**  When an information arc $X \to D_i$ is
added to a LIMID, the information remains local to $D_i$ only.  Later decision
nodes $D_{i+1}, D_{i+2}, \ldots$ do not automatically inherit it.  If the
intended query is the classical EVPI — where $X$ becomes available at all
subsequent stages — the corresponding arcs must each be added explicitly:

$$
X \to D_i,\quad X \to D_{i+1},\quad \ldots,\quad X \to D_n
$$

Adding only $X \to D_i$ computes a different, strictly local quantity: the
value of knowing $X$ at stage $i$ alone.  This is a meaningful LIMID-specific
query in its own right (see §8.1), but it is not the classical EVPI.

### 7.2 Full-memory LIMID construction

**Algorithm (full-memory expansion):**
```
Input : Classical ID G with decision order D_1 ≺ D_2 ≺ ··· ≺ D_n
Output: Full-memory LIMID G_fm equivalent to G

G_fm ← copy(G)
For k = 2, 3, ..., n:
  // (a) Remember the previous decision
  If arc D_{k-1} → D_k does not exist:
    Add arc D_{k-1} → D_k to G_fm.
  // (b) Remember all chance-node parents inherited up to stage k-1
  H ← ∅
  For j = 1, ..., k-1:
    H ← H ∪ {chance-node parents of D_j in G_fm}
  For each C in H:
    If arc C → D_k does not exist:
      Add arc C → D_k to G_fm.
  Assert G_fm is still a DAG.
Return G_fm.
```

The result is called the **full-memory LIMID**.

### 7.3 Correctness of the conversion

**Theorem.** Let $G$ be a classical ID and $G_\text{fm}$ its full-memory LIMID
expansion.  Then:

1. $G_\text{fm}$ is soluble.
2. $\text{MEU}(G_\text{fm}) = \text{MEU}(G)$.
3. $\text{EVPI}_{G_\text{fm}}(X, D_i) = \text{EVPI}_G(X, D_i)$ for all valid pairs.

*Proof sketch.*
(1) $G_\text{fm}$ satisfies $H_k \supseteq H_{k-1} \cup \{D_{k-1}\}$ by construction, so the sufficient condition of §6.3 holds.
(2) The optimal policy in $G_\text{fm}$ can condition on the full history at each stage; backward induction in $G$ also conditions on the full history.  The two are identical.
(3) Augmenting either model by $X \to D_i$ (and forward arcs) gives the same enlarged policy space; the optimal value in that space is the same. ∎

### 7.4 VOI computations are lossless under the conversion

Any EVPI or EVSI query on the classical ID can be answered by:
1. Converting to the full-memory LIMID.
2. Running the augmented-diagram recipe (§2.4) using a LIMID solver.
3. The result is exact because the full-memory LIMID is soluble.

---

## 8. VOI and Memory Structure in LIMIDs

### 8.1 EVPI in a LIMID is a family of queries

In a classical ID, EVPI is a single number: observing $X$ before $D_i$
automatically makes it available to all later decisions.  In a LIMID, the
information carried by an arc $X \to D_i$ stays **local to $D_i$**.  The EVPI
therefore depends on which decisions receive the arc:

| Query | Arcs added | Interpretation |
|---|---|---|
| EVPI at $D_i$ only | $X \to D_i$ | Value of knowing $X$ only at stage $i$ |
| EVPI propagated forward | $X \to D_i,\, X \to D_{i+1},\, \ldots$ | Classical EVPI semantics |
| EVPI at $D_k$ only ($k > i$) | $X \to D_k$ | Value of remembering $X$ at a later stage |

Each variant can yield a different value and addresses a different question.

### 8.2 Value of memory

Let $G$ be a memory-constrained LIMID (arc $X \to D_k$ is absent even though $X$
is in the information set at an earlier stage $D_i$, $i < k$).  The **value of
memory** of $X$ at $D_k$ is:

$$
\text{VOM}(X, D_k)
= \text{MEU}(G + \{X \to D_k\}) - \text{MEU}(G)
$$

This quantity has no counterpart in classical IDs.  It measures the cost of
forgetting $X$ between stage $i$ and stage $k$.  $\text{VOM}(X, D_k) = 0$ if
$X$ is non-requisite at $D_k$; $\text{VOM}(X, D_k) > 0$ if $X$ would change
the optimal policy at $D_k$.

### 8.3 Three tiers of VOI in a LIMID

| Tier | Quantity | What it measures |
|---|---|---|
| 1 | EVPI$(X, D_i)$ | Value of first-time observation of $X$ at stage $D_i$ |
| 2 | VOM$(X, D_k)$ | Value of retaining $X$ from an earlier stage to $D_k$ |
| 3 | Cost of forgetting | $= \text{VOM}(X, D_k)$ measured from the full-memory LIMID; the loss incurred by the memory constraint |

### 8.4 Minimal soluble LIMID

The full-memory LIMID may carry redundant arcs.  An arc $X \to D_k$ is
**removable without loss** if and only if $X$ is non-requisite for $D_k$ given
the other parents of $D_k$.  Removing it does not change the MEU or any EVPI.

**Minimal-soluble-LIMID algorithm:**
```
Input : Full-memory LIMID G_fm
Output: Minimal soluble LIMID G_min with same MEU and EVPI

G_min ← copy(G_fm)
For each decision D_k (in reverse order):
  For each chance-node parent X of D_k in G_min:
    Tentatively remove arc X → D_k.
    Check requisiteness of X for D_k (Algorithm of §4.2).
    If X is not requisite:
      Confirm removal.  (MEU and all EVPI unchanged.)
    Else:
      Restore arc X → D_k.
Return G_min.
```

### 8.5 Solubility after arc removal

Removing a **requisite** arc from a soluble LIMID may destroy solubility.  After
any such removal, verify that the remaining decision graph (decision-to-decision
and chance-to-decision arcs) still admits a consistent elimination order.  If not,
SPU on the modified LIMID yields only a Nash-equilibrium bound.

---

## 9. Exogenous vs. Downstream Variables: The Counterfactual Problem

### 9.1 When standard EVPI applies

The recipe of §2.4 and §4 is valid only when $X$ is **exogenous** with respect
to $D_i$: its value is not causally determined by $D_i$ or any later decision.

**Definition.** $X$ is exogenous with respect to $D_i$ if $D_i$ is not a causal
ancestor of $X$, where "causal ancestry" follows only chance-to-chance and
decision-to-chance arcs (not information arcs).

**Exogeneity check:**
```
Algorithm: is_exogenous(G, X, D_i)

Input : ID or LIMID G, chance node X, decision D_i
Output: True if X is exogenous w.r.t. D_i

visited ← ∅
stack   ← {X}
While stack is non-empty:
  v ← pop(stack)
  If v ∈ visited: continue
  visited ← visited ∪ {v}
  For each parent p of v in G:
    If v is a decision node: skip p  // arc into decision = information arc
    Else: push p onto stack
If D_i ∈ visited: return False  // D_i is a causal ancestor of X
Else:            return True
```

### 9.2 Why naïve arc addition fails for downstream variables

If $D_i$ is a causal ancestor of $X$, adding the arc $X \to D_i$ creates a
directed cycle $D_i \to \cdots \to X \to D_i$.  Even if a cycle is avoided by
structural accident, the CPT of $X$ was estimated under a fixed policy at $D_i$;
conditioning on $X$ while simultaneously choosing $D_i$ implicitly assumes the
CPT holds for all actions, which is false when $D_i$ causes $X$ [4, 10].

### 9.3 The correct question

When $X$ is downstream of $D_i$, the question "what is the value of observing
$X$ before choosing $D_i$?" requires a **counterfactual** re-interpretation:

> *"What would I gain if I could learn what $X$ would be under every possible
> action, before committing to any action?"*

This is not the same as observing the realised $X$ after the decision.

### 9.4 Two correct constructions

#### Construction A: Exogenous-driver formulation [4, 10]

If $X = f(D_i, E_X, \ldots)$ where $E_X$ are the exogenous parents of $X$ (not
downstream of any decision), then observing $E_X$ before $D_i$ fully determines
what $X$ would be under every action (since $D_i$ and $E_X$ together determine $X$).

**Algorithm:**
```
Input : G, X, D_i
Output: Augmented LIMID G' for exogenous-driver EVPI

E_X ← {parents of X in G that are exogenous w.r.t. D_i}
      = {p ∈ Pa(X) : p is not a decision node
                    AND no decision is a causal ancestor of p}
G' ← copy(G)
For each e ∈ E_X:
  Add information arc e → D_i to G'.
  (Under no-forgetting / full-memory LIMID: also add e → D_k for k > i.)
Return G', and compute EVPI as MEU(G') − MEU(G).
```

This gives $\text{EVPI}(E_X, D_i)$, the value of knowing the exogenous
drivers of $X$.  When $E_X$ fully determines all potential outcomes of $X$,
this equals the value of perfect counterfactual information about $X$.

#### Construction B: Potential-outcomes formulation [10, 11]

For each action $d \in \mathcal{A}(D_i)$, introduce a node $X^{(d)}$
representing $X$'s value under the intervention $D_i = d$.

**Algorithm:**
```
Input : G, X, D_i with action space A = {a_1, ..., a_m}
Output: Augmented LIMID G_PO for potential-outcomes EVPI

G_PO ← copy(G)
E_X  ← exogenous parents of X (as in Construction A)

For each action a_j ∈ A:
  Create node X^(a_j) with the same state space as X.
  Set Pa(X^(a_j)) ← E_X.   // only exogenous parents; D_i is NOT a parent
  Set CPT of X^(a_j) ← P(X | Pa_exog = ·, D_i = a_j)
                         // interventional distribution for action a_j
  Add information arc X^(a_j) → D_i to G_PO.

Create deterministic selector node X* :
  X* = X^(D_i)   // realised outcome under the chosen action
  Replace all causal arcs from X in G_PO with arcs from X*.

Compute EVPI_PO = MEU(G_PO) − MEU(G).
```

The CPT of $X^{(d)}$ must use the **interventional** distribution
$P(X \mid \text{do}(D_i = d))$, not the observational $P(X \mid D_i = d)$.
In a correctly specified ID these coincide because decisions are modelled as
interventions with no confounding [4, 10].

### 9.5 Relationship between the two constructions

$$
\text{EVPI}_\text{PO}(X, D_i)
\;\ge\;
\text{EVPI}(E_X, D_i)
\;\ge\;
\text{EVSI}(Z, D_i)
\quad \text{for any signal } Z \text{ about } X
$$

Equality $\text{EVPI}_\text{PO} = \text{EVPI}(E_X)$ holds if and only if $E_X$
fully determines all potential outcomes: $X^{(d)} = f(d, E_X)$ for each $d$.
In a causally complete model this is always the case.

### 9.6 Partial counterfactuality in multi-stage models

A variable $X$ sitting between two decisions $D_i$ and $D_k$ ($i < k$) is
simultaneously:

- **Counterfactual** with respect to $D_i$ (since $D_i$ causally precedes $X$).
- **Factual** with respect to $D_k$ (since $X$ precedes $D_k$).

Exogeneity must therefore be checked per $(X, D_j)$ pair, not globally.

### 9.7 Test-and-treat models: a canonical counterfactual trap

A recurring structure in medical and reliability decision models is the
*test-and-treat* pattern: a decision node $D_\text{test}$ (perform test / skip
test) has a chance node $T$ (test result: positive / negative / absent) as a
causal child, and $T$ in turn informs a subsequent treatment decision
$D_\text{treat}$.  This pattern is a prototypical instance where the
temporal-feasibility condition of §4.3 is violated for one of the two
decision–variable pairs, and where an automated or exhaustive VOI tool will
attempt an invalid computation if the exogeneity check of §9.1 is not in place.

#### 9.7.1 The graph structure

A test-then-treat model has the causal structure:

```
(prior state) θ
        |
        ↓
 D_test ──→ T ──→ D_treat ──→ outcome ──→ utility
              ↖ (also from θ)
```

$T$ has $D_\text{test}$ as a **causal parent**: the test result only exists if
the test is performed, and its distribution over {positive, negative} depends on
whether $D_\text{test} = \text{test}$ or $D_\text{test} = \text{skip}$.  When
$D_\text{test} = \text{skip}$, $T$ takes a special value "no test".

Therefore $T$ is **not exogenous** with respect to $D_\text{test}$.  The
automated EVPI recipe is invalid for this pair:

- Adding the arc $T \to D_\text{test}$ creates the cycle
  $D_\text{test} \to T \to D_\text{test}$.
- Even if acyclicity were preserved, the CPT of $T$ was parameterised for the
  policy "test"; it is undefined for the policy "skip".  Conditioning on $T$
  while choosing whether to test is incoherent.

#### 9.7.2 The three well-posed VOI queries in this pattern

**Value of the test result for the treatment decision.**
$T$ is exogenous with respect to $D_\text{treat}$: it is determined before
$D_\text{treat}$ is executed (conditionally on having tested), so the
standard arc-addition recipe applies:

$$
\text{EVPI}(T, D_\text{treat})
= \text{MEU}(G + \{T \to D_\text{treat}\}) - \text{MEU}(G)
$$

This is the value of the test result for guiding treatment — the central
quantity in classical test-and-treat analysis.

**Value of performing the test (EVSI).**
Whether to test at all is answered by comparing the MEU of the model in which
the test result informs treatment to the MEU of the model in which it does not:

$$
\text{EVSI}(T, D_\text{treat})
= \text{MEU}\bigl(G \text{ with } T \to D_\text{treat}\bigr)
- \text{MEU}\bigl(G \text{ without } T \to D_\text{treat}\bigr)
$$

If this quantity exceeds the cost of the test, performing the test is optimal.
The "value of testing" is the EVSI of $T$ for $D_\text{treat}$; it is not a VOI
quantity defined with respect to $D_\text{test}$.

**Counterfactual upper bound via the exogenous state.**
A valid VOI query *with respect to* $D_\text{test}$ is the EVPI of the
underlying state $\theta$, which is exogenous to that decision:

$$
\text{EVPI}(\theta, D_\text{test})
= \text{MEU}\bigl(G + \{\theta \to D_\text{test}\}\bigr)
- \text{MEU}(G)
$$

This measures the value of knowing the true health state before deciding whether
to test.  It is an upper bound on the value of any feasible pre-test signal and
corresponds to the exogenous-driver construction of §9.4.

#### 9.7.3 Guard for automated VOI pipelines

Any automated VOI pipeline that iterates over all (variable, decision) pairs
must run the **temporal feasibility check** (§9.1) before forming the augmented
diagram.  Without this guard, the pipeline will attempt invalid augmentations
for every downstream variable, including test results with respect to the
decision that triggers the test.

```
For each candidate pair (X, D_i):
  If is_exogenous(G, X, D_i) = False:
    Do NOT add arc X → D_i.
    Log: "X is downstream of D_i — counterfactual construction required."
    Optionally compute EVPI(E_X, D_i) using Construction A (§9.4).
    Skip the direct arc-addition recipe.
```

#### 9.7.4 Summary for the test-and-treat pattern

| VOI query | Valid? | Correct formulation |
|---|---|---|
| EVPI$(T, D_\text{test})$ | **No** — $T$ is downstream of $D_\text{test}$ | Not directly computable |
| EVPI$(T, D_\text{treat})$ | **Yes** — $T$ is upstream of $D_\text{treat}$ | Standard arc-addition recipe |
| EVSI$(T, D_\text{treat})$ (value of testing) | **Yes** | MEU with $T \to D_\text{treat}$ minus MEU without |
| EVPI$(\theta, D_\text{test})$ | **Yes** — $\theta$ is exogenous | Arc-addition with $\theta \to D_\text{test}$ |
| EVPI$(\theta, D_\text{treat})$ | **Yes** | Arc-addition with $\theta \to D_\text{treat}$ |

---

## 10. Unified VOI Framework

### 10.1 The unified formula

All VOI quantities — standard EVPI, exogenous-driver EVPI, and
potential-outcomes EVPI — are instances of:

$$
\boxed{
\text{VOI}(Y \to D_i)
= \mathbb{E}_Y\!\left[\max_d \mathbb{E}[V \mid Y = y,\, D_i = d]\right]
- \max_d \mathbb{E}[V \mid D_i = d]
}
$$

where $Y$ is a **pre-decision signal** defined as follows:

| $X$ relative to $D_i$ | Signal $Y$ | Distribution of $Y$ |
|---|---|---|
| Exogenous ($D_i \notin \text{CausalAnc}(X)$) | $Y = X$ | $P(X)$ from original model |
| Downstream; exogenous drivers sufficient | $Y = E_X$ | $P(E_X)$ from original model |
| Downstream; full potential outcomes desired | $Y = (X^{(d)})_{d \in \mathcal{A}}$ | Joint distribution over potential outcomes |

The only variation between cases is how $Y$ is constructed and its distribution
established.  The computation of VOI itself is identical in all cases.

### 10.2 Unified algorithm

```
Algorithm: VOI_unified(G, X, D_i, mode)

Input : ID or LIMID G
        Chance node X
        Decision node D_i
        mode ∈ {auto, direct, driver, potential}
Output: VOI(X → D_i) ≥ 0

──── Pre-screening ──────────────────────────────────────────────────────
Step 1.  d-separation check (§4.1):
  If X ⊥_d U | Pa(D_i):  return 0   (no information path)

Step 2.  Exogeneity check (§9.1):
  exog ← is_exogenous(G, X, D_i)
  If mode = "auto":
    mode ← "direct" if exog else "driver"
  If mode = "direct" and not exog:
    raise Error("X is downstream of D_i; use driver or potential mode.")

──── Signal construction ─────────────────────────────────────────────────
Step 3.  Build augmented model G' according to mode:

  Case "direct":
    G' ← copy(G)
    Add arc X → D_i (and forward arcs for no-forgetting if needed).

  Case "driver":
    E_X ← exogenous parents of X (§9.4, Construction A)
    G' ← copy(G)
    For each e ∈ E_X:
      Add arc e → D_i (and forward arcs as needed).

  Case "potential":
    G' ← copy(G)  augmented by potential-outcome nodes (§9.4, Construction B)
    (Requires interventional CPTs for X^(d) — must be supplied by the modeller.)

──── Inference ───────────────────────────────────────────────────────────
Step 4.  Baseline:
  MEU_0 ← solve(G)    // backward induction (classical ID) or SPU (LIMID)

Step 5.  Augmented:
  Verify G' is a DAG.
  If G is a LIMID: verify G' is soluble (§6.3); if not, result is lower bound.
  MEU_1 ← solve(G')

Step 6.  return max(0, MEU_1 − MEU_0)
```

### 10.3 Correctness guarantees

| G is … | Mode | Result |
|---|---|---|
| Classical ID | direct (exogenous $X$) | Exact EVPI |
| Classical ID | driver | Exact EVPI of $E_X$; equals EVPI$(X)$ if model is causally complete |
| Classical ID | potential | Exact EVPI$_\text{PO}$; upper bound on any feasible signal VOI |
| Soluble LIMID | any | Exact (SPU finds global optimum) |
| Non-soluble LIMID | any | Lower bound only |

---

## 11. Requisite Information

### 11.1 Definition

A set $\mathcal{R} \subseteq \text{Pa}(D_i)$ is a **requisite information set**
for $D_i$ if the optimal policy at $D_i$ conditioned on $\mathcal{R}$ is the
same as the optimal policy conditioned on the full parent set $\text{Pa}(D_i)$ [8].

The **minimal requisite set** $\text{Req}(D_i)$ is the smallest such set:

$$
\text{Req}(D_i) = \bigl\{X \in \text{Pa}(D_i) :
\text{removing } X \text{ strictly changes the optimal policy at } D_i\bigr\}
$$

### 11.2 Key theorem

$$
X \notin \bigcup_i \text{Req}(D_i)
\implies
\text{EVPI}(X, D_i) = 0 \quad \forall\, i
$$

This provides a structural pruning criterion: variables outside every requisite
set can be excluded from VOI analysis without loss [8].

### 11.3 Algorithm

```
Algorithm: compute_requisite_sets(G)

Input : ID or LIMID G
Output: Req(D_i) for each decision node D_i

For each D_i (process decisions in reverse order):
  S ← Pa(D_i) ∩ ChanceNodes
  Req(D_i) ← ∅
  For each X ∈ S:
    // Test: does conditioning on X change the argmax?
    Compute q(d, x) = E[V | X=x, Pa(D_i)\{X}] for all d, x.
    If ∃ x1, x2 such that argmax_d q(d,x1) ≠ argmax_d q(d,x2):
      Req(D_i) ← Req(D_i) ∪ {X}
Return {Req(D_i)}
```

### 11.4 Integration with the unified VOI algorithm

Requisite detection should be run **before** the augmented-diagram solve,
after the d-separation check:

```
Between Step 2 and Step 3 of VOI_unified:
  Compute Req(D_i).
  If X ∉ Req(D_i):  return 0   (not requisite; EVPI = 0)
```

This three-layer screening (d-separation → requisiteness → augmented solve)
avoids expensive inference in most practical cases.

---

## 12. Worked Example: Three-Stage Sequential Decision

### 12.1 Model structure

Consider a three-stage treatment-decision model:

- **Chance nodes:** $h_1$ (initial health state: sick/healthy), $t_1, t_2, t_3$
  (test results at each stage: positive/negative), $h_2, h_3, h_4$ (health
  states after each decision).
- **Decision nodes:** $d_1, d_2, d_3$ (treat/leave at each stage).
- **Utility:** $u$ dependent on $h_4$ (final sale value) and treatment costs.

Causal structure:
```
h1 → t1       h1 → h2 → t2       h2 → h3 → t3       h3 → h4
              d1 → h2             d2 → h3             d3 → h4
                                                                → u
```

Information arcs in the classical ID (no-forgetting gives):

| Decision | Information set |
|---|---|
| $d_1$ | $\{t_1\}$ |
| $d_2$ | $\{t_1, d_1, t_2\}$ |
| $d_3$ | $\{t_1, d_1, t_2, d_2, t_3\}$ |

### 12.2 Full-memory LIMID

The full-memory expansion adds:
- $t_1 \to d_2$, $d_1 \to d_2$ (stage 1 info remembered at stage 2).
- $t_1 \to d_3$, $d_1 \to d_3$, $t_2 \to d_3$, $d_2 \to d_3$ (all prior info at stage 3).

The resulting LIMID is soluble and yields the same MEU as backward induction.

### 12.3 Exogeneity classification

| Variable | Exogenous w.r.t. $d_1$? | Exogenous w.r.t. $d_2$? | Exogenous w.r.t. $d_3$? |
|---|---|---|---|
| $h_1$ | Yes | Yes | Yes |
| $t_1$ | Yes | Yes | Yes |
| $h_2$ | No ($d_1 \to h_2$) | Yes | Yes |
| $t_2$ | No ($d_1 \to h_2 \to t_2$) | Yes | Yes |
| $h_3$ | No | No ($d_2 \to h_3$) | Yes |
| $t_3$ | No | No | Yes |

### 12.4 EVPI calculations

**$\text{EVPI}(t_1, d_1)$** — standard recipe (exogenous):
```
G' ← full-memory LIMID + no additional arcs (t_1 → d_1 already present)
This reduces to: what is MEU(full-memory) − MEU(d_1 does not see t_1)?
Remove arc t_1 → d_1 from the full-memory LIMID.
MEU_reduced ← solve(G_reduced)
EVPI(t_1, d_1) = MEU(full-memory) − MEU_reduced
```

**$\text{EVPI}(h_2, d_1)$** — counterfactual ($h_2$ is downstream of $d_1$):

$h_2$ is not exogenous w.r.t. $d_1$ because $d_1 \to h_2$.  Use the driver
construction: the exogenous parent of $h_2$ that is not downstream of $d_1$ is
$h_1$ (plus any exogenous noise in $P(h_2 \mid h_1, d_1)$).  Adding $h_1 \to d_1$
grants the decision maker knowledge of the initial health state, from which, together
with $d_1$, the future health trajectory can be partially predicted.

**$\text{VOM}(t_1, d_3)$** — value of memory:
```
G_nomem ← full-memory LIMID with arc t_1 → d_3 removed
VOM(t_1, d_3) = MEU(full-memory) − MEU(G_nomem)
```
If this equals zero, the second and third test results already make the first test
redundant at stage 3.  If positive, remembering the first test adds value.

---

## 13. Summary of Key Results

### 13.1 Fundamental results

| Result | Statement |
|---|---|
| Non-negativity | $\text{EVPI} \ge 0$ always |
| Adaptivity interpretation | EVPI measures the gain from state-contingent vs. fixed policy |
| Inequality chain | $0 \le \text{EVSI}(Z) \le \text{EVPI}(X) \le \text{EVPI}(\Theta)$ |
| d-separation implies zero | $X \perp_d \mathbf{U} \mid H(D_i) \Rightarrow \text{EVPI}(X) = 0$ |
| Requisiteness | $X \notin \text{Req}(D_i) \Rightarrow \text{EVPI}(X) = 0$ |
| Arc-addition semantics | Adding $X \to D_i$ expands policy space, does not change CPTs |

### 13.2 ID vs. LIMID comparison

| Aspect | Classical ID | Soluble LIMID |
|---|---|---|
| No-forgetting | Implicit, enforced by solver | Must be explicit as arcs |
| Solver | Backward induction (exact) | SPU (exact if soluble) |
| EVPI concept | Single, globally propagated | Family indexed by which decisions receive arc |
| Value of memory | Not representable | VOM$(X, D_k)$ = MEU gain from restoring arc $X \to D_k$ |
| Solubility after arc modification | Always soluble (no-forgetting maintained) | Must be re-verified |
| EVPI validity for downstream $X$ | Same counterfactual rules apply | Same, checked per $(X, D_i)$ pair |

### 13.3 Decision procedure

```
To compute VOI of X at D_i:

1. Check d-separation.  If X ⊥_d U | H(D_i):  VOI = 0.  Stop.
2. Check temporal feasibility (is_exogenous).
   If exogenous: use direct construction.
   If downstream: use driver or potential-outcomes construction.
3. Check requisiteness.  If X ∉ Req(D_i):  VOI = 0.  Stop.
4. Build augmented model G'.
5. If G is a LIMID: verify G' is soluble.
6. Solve G' → MEU'.
7. Return max(0, MEU' − MEU).
```

---

## 14. References

| # | Reference | DOI |
|---|---|---|
| [1] | Howard, R. A. (1966). Information Value Theory. *IEEE Transactions on Systems Science and Cybernetics*, **SSC-2**(1), 22–26. | https://doi.org/10.1109/TSSC.1966.300074 |
| [2] | Raiffa, H. & Schlaifer, R. (1961). *Applied Statistical Decision Theory*. Harvard Business School Press. | No DOI (book). OCLC: 1048612 |
| [3] | Shachter, R. D. (1986). Evaluating influence diagrams. *Operations Research*, **34**(6), 871–882. | https://doi.org/10.1287/opre.34.6.871 |
| [4] | Dawid, A. P. (2002). Influence diagrams for causal modelling and inference. *International Statistical Review*, **70**(2), 161–189. | https://doi.org/10.1111/j.1751-5823.2002.tb00354.x |
| [5] | Shachter, R. D. (1999). Efficient value of information computation. *Proceedings of the Fifteenth Conference on Uncertainty in Artificial Intelligence (UAI 1999)*, 594–601. | https://doi.org/10.48550/arXiv.1301.7338 |
| [6] | Jensen, F. V. & Nielsen, T. D. (2007). *Bayesian Networks and Decision Graphs* (2nd ed.). Springer. | https://doi.org/10.1007/978-0-387-68282-2 |
| [7] | Shachter, R. D. (1998). Bayes-Ball: the rational pastime (for determining irrelevance and requisite information in belief networks and influence diagrams). *Proceedings of the Fourteenth Conference on Uncertainty in Artificial Intelligence (UAI 1998)*, 480–487. | https://doi.org/10.48550/arXiv.1301.7412 |
| [8] | Shachter, R. D. (1986). *Ibid.* §5 (requisite information) — see [3]. | https://doi.org/10.1287/opre.34.6.871 |
| [9] | Lauritzen, S. L. & Nilsson, D. (2001). Representing and solving decision problems with limited information. *Management Science*, **47**(9), 1238–1251. | https://doi.org/10.1287/mnsc.47.9.1238.9779 |
| [10] | Heckerman, D. & Shachter, R. (1995). Decision-theoretic foundations for causal reasoning. *Journal of Artificial Intelligence Research*, **3**, 405–430. | https://doi.org/10.1613/jair.202 |
| [11] | Pearl, J. (2009). *Causality: Models, Reasoning and Inference* (2nd ed.). Cambridge University Press. Ch. 4 and 7. | https://doi.org/10.1017/CBO9780511803161 |
| [12] | Howard, R. A. & Matheson, J. E. (1984). Influence diagrams. In *Readings on the Principles and Applications of Decision Analysis*, Vol. II, 721–762. Strategic Decisions Group. | Reprinted: https://doi.org/10.1111/j.1540-5915.2005.00073.x |
| [13] | Nilsson, D. & Lauritzen, S. L. (2000). Evaluating influence diagrams using LIMIDs. *Proceedings of the Sixteenth Conference on Uncertainty in Artificial Intelligence (UAI 2000)*, 436–445. | https://doi.org/10.48550/arXiv.1301.3846 |
