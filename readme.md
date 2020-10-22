# 8-puzzle

Simple 8-puzzle solver written in JavaScript.

## Memory complexity

Since it is hard to approximate precise size of a JavaScript object due to differences in
memory management between different browsers, and other runtime environments, we can focus
just on the primitive data that is stored inside of each object field, ignoring inherited
properties and metadata overhead. So in our case, each node is an object with these keys:

| Property name    | Size in bytes       |
|------------------|---------------------|
| `state`          | 8 * ***N***^2       |
| `stateKey`       | 2 * ***N***^2 - 1   |
| `parentStateKey` | 2 * ***N***^2 - 1   |
| `cursorIndex`    | 8                   |
| `cursorPosition` | 16                  |
| `heuristicValue` | 8                   |
| Total            | 10 * ***N***^2 + 30 |

Where ***N*** is the size of the puzzle. Note, `cursorPosition` is an object, so in reality,
its actual size would be much bigger, due to the inherited properties and metadata overhead
mentioned above.

So primitive data in nodes of the classical *8 puzzle* would have the size of **120 bytes**.