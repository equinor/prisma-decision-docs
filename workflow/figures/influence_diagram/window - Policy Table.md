## Read a decision's policy table

In Card view, open a decision's **Issue actions** menu and select **Policy Table**. In Shape view, hover over the decision and use its policy-table control. The table is a solver result, not an input: when information parents are shown, each row lists a combination of their states; each column is an option for that decision. A **1** marks the option selected by the optimal policy for that row; **0** means it is not selected. If no parent states are shown, the table has a single policy row.

Use the table to see how the recommended choice depends on information available before the decision. It reflects the model's structure, restrictions, probabilities and values, so revisit those assumptions before acting. The policy table is calculated for the base model rather than the selected what-if scenario.

![Event selection policy table](<./window - Policy Table.png>)
