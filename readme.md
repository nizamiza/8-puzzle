# 8-puzzle

Simple 8-puzzle solver written in JavaScript.

## Memory complexity

Since, exact size of each data type in JavaScript is dependent on the engine and its specific implementation, we can only approximate size of each node based on the representative size of each primitive data type. So in our case, each node, which holds puzzle state, may approximately have these sizes for each of its properties:

| Property Name    | Data type  | Size in bytes       | Sample Value                  |
|------------------|------------|---------------------|-------------------------------|
| `state`          | `number[]` | 8 * ***N***^2       | `[1, 0, 2, 3, 5, 4, 6, 8, 7]` |
| `stateKey`       | `string`   | 2 * ***N***^2 - 1   | `1-0-2-3-5-4-6-8-7`           |
| `parentStateKey` | `string`   | 2 * ***N***^2 - 1   | `0-1-2-3-5-4-6-8-7`           |
| `cursorIndex`    | `number`   | 8                   | `1`                           |
| `cursorPosition` | `object`   | 16                  | `{ col: 0, row: 0 }`          |
| `heuristicValue` | `number`   | 8                   | `4`                           |
| Total            |            | 10 * ***N***^2 + 30 |                               |

> Primitive data structure sizes were taken from the [MDN page][1].

Where ***N*** is the size of the puzzle. Note, `cursorPosition` is an object, so in reality, its actual size could be much bigger, due to the inherited properties and metadata overhead.

So node of the classical *8 puzzle* would approximately have the size of **120 bytes**.

To provide specific numbers, below are data from snapshots taken in Edge (Chromium) browser, that uses [V8 JavaScript engine][0]. Each row  represents node size inside of the priority queue with specified puzzle size.

| Puzzle Size | Shallow Size (bytes) | Retained Size (bytes) |
|-------------|----------------------|-----------------------|
| 3           | 36                   | 116                   |
| 4           | 36                   | 144                   |
| 3           | 36                   | 180                   |

Same test in the Firefox browser, that uses SpiderMonkey JavaScript engine:

| Puzzle Size | Shallow Size (bytes) | Retained Size (bytes) |
|-------------|----------------------|-----------------------|
| 3           | 36                   | 116                   |
| 4           | 36                   | 144                   |
| 3           | 36                   | 180                   |

## References

[0]: https://v8.dev/
[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
[2]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey

* [V8 JavaScript Engine, v8.dev][0]
* [JavaScript Data Structures, Mozilla Developer Network][1]
* [SpiderMonkey, Mozilla Developer Network][2]