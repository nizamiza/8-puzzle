# 8-puzzle
- [8-puzzle](#8-puzzle)
  - [Implementation](#implementation)
    - [Heuristic functions](#heuristic-functions)
    - [Node structure](#node-structure)
    - [Memory complexity](#memory-complexity)
    - [Node generation](#node-generation)
    - [Time complexity](#time-complexity)
  - [Conclusion](#conclusion)
    - [Heuristic functions comparison](#heuristic-functions-comparison)
    - [Why JavaScript?](#why-javascript)
  - [Testing](#testing)
  - [References](#references)

Simple 8-puzzle solver written in JavaScript. User interface is realizes as a simple web page, where user can choose size of the puzzle (3x3, 4x4, or 5x5) and heuristic type.

## Implementation

This implementation utilizes [Greedy search algorithm][2] with [min heap][3] as the priority queue and [hash map][4] data structure for the visited states.

Algorithm is initialized with a single entry in the min heap and in the visited states map (the initial state). Then, each iteration following steps occur:

1. Check if queue is empty. If it is - solution has not been found, exit.
2. Pop (extract min) value from the priority queue.
3. Check if its heuristic value is 0. If it is - solution has been found, exit.
4. For each puzzle item, check if it can be moved. If yes:
   - move it;
   - generate new state;
   - calculate its heuristic value;
   - add it to the priority queue.
5. Repeat step 1.

### Heuristic functions

This implementation contains two heuristic functions to choose from:
- *Manhattan Distance* - sum of distances from current position of each puzzle item to its target position. Formula for the distance calculation is: `|x2 - x1| + |y2 - y1|`, where `x1`, `y1`, `x2`, `y2` are coordinates of the puzzle item, and its target position, respectively.
- *Invalid placed items count* - count of invalid placed items.

Second options is obviously much worse, because it provides much less relevant information about the state of the puzzle. This is also projected in the final testing results.

### Node structure

Each puzzle state stored in the priority queue is represented as an object with these fields:

| Field Name       | Data type  | Sample Value                  |
|------------------|------------|-------------------------------|
| `state`          | `number[]` | `[1, 0, 2, 3, 5, 4, 6, 8, 7]` |
| `stateKey`       | `string`   | `1-0-2-3-5-4-6-8-7`           |
| `cursorIndex`    | `number`   | `1`                           |
| `heuristicValue` | `number`   | `4`                           |

- `state` - current state of the puzzle, represented as one dimensional array, where `0` is an *empty space*;
- `stateKey` - string representation of the puzzle state, used to identify it in the hash table of the visited states;
- `cursorIndex` - locations of the element `0` (*empty space*) in the puzzle;
- `heuristicValue` - value returned by the heuristic function for the current state of the puzzle.

### Memory complexity

Since, exact size of each data type in JavaScript is dependent on the engine and its specific implementation, we can only approximate size of each node based on the representative size of each primitive data type. So in our case, each node, which holds puzzle state, may approximately have these sizes for each of its fields:

| Field Name       | Data type  | Size in bytes               |
|------------------|------------|-----------------------------|
| `state`          | `number[]` | 8 * ***N*** * ***M***       |
| `stateKey`       | `string`   | 2 * ***N*** * ***M*** - 1   |
| `cursorIndex`    | `number`   | 8                           |
| `heuristicValue` | `number`   | 8                           |
| Total            |            | 10 * ***N*** * ***M*** + 15 |

> Primitive data structure sizes were taken from the [MDN page][1].

Where ***N*** and ***M*** are the dimensions of the puzzle.

So node of the classical *8 puzzle* would approximately have the size of **105 bytes**.

To provide specific numbers, below are data from snapshots taken in Edge (Chromium) browser, that uses [V8 JavaScript engine][0]. Each row  represents node size inside of the priority queue with specified puzzle size.

| Puzzle Size | Shallow Size (bytes) | Retained Size (bytes) |
|-------------|----------------------|-----------------------|
| 3x3         | 28                   | 120                   |
| 4x4         | 28                   | 120                   |
| 5x5         | 28                   | 120                   |

> Yes, they are the same. This has been tested multiple times, but same results were received.

**Shallow size** - is the actual size of memory used by given object.

**Retained size** - is the size of memory that will be freed, when garbage collectors collects given object.

### Node generation

Here are some results of node generation for the given amount of steps.

**With Manhattan Distance heuristic**:

| Puzzle Size | Steps count | Nodes count |
|-------------|-------------|-------------|
| 3x3         | 4           | 12          |
| 3x3         | 36          | 82          |
| 3x3         | 39          | 208         |
| 3x3         | 81          | 763         |
| 3x3         | 93          | 479         |
| 4x4         | 81          | 616         |
| 4x4         | 162         | 2913        |
| 4x4         | 171         | 2367        |
| 4x4         | 195         | 3334        |
| 4x4         | 247         | 3724        |
| 5x5         | 317         | 15359       |
| 5x5         | 430         | 35238       |
| 5x5         | 444         | 13747       |
| 5x5         | 519         | 22754       |
| 5x5         | 542         | 122182      |

**With Invalid placed items count heuristic**:

| Puzzle Size | Steps count | Nodes count |
|-------------|-------------|-------------|
| 3x3         | 4           | 12          |
| 3x3         | 48          | 621         |
| 3x3         | 72          | 727         |
| 3x3         | 76          | 941         |
| 3x3         | 95          | 909         |
| 4x4         | 245         | 21507       |
| 4x4         | 307         | 30847       |
| 4x4         | 361         | 21006       |
| 4x4         | 466         | 39759       |
| 4x4         | 529         | 82370       |
| 5x5         | 504         | 108010      |
| 5x5         | 561         | 255612      |
| 5x5         | 579         | 62502       |
| 5x5         | 708         | 289949      |
| 5x5         | 716         | 206154      |

### Time complexity

Here are average results of duration for each heuristic with random state generation:

| Puzzle Size | Runs count | Manhattan Distance   | Invalid placed items count               |
|-------------|------------|----------------------|------------------------------------------|
| 3           | 250        | ~0.0041777s          | ~0.0125658s                              |
| 4           | 125        | ~0.0576453s          | ~0.35580458                              |
| 5           | 100        | ~0.3606378s          | ~1.7524236s                              |

## Conclusion

Greedy algorithm is not an ideal solution for 8, 15, or 24 puzzles, because it utilizes single heuristic and doesn't evaluate its previous states to make better decisions. Something like A* algorithm with good heuristic function, would produce much better results.

### Heuristic functions comparison

As far as the heuristic functions go, it is evident from the results that *Manhattan Distance* heuristic is much more efficient than *Invalid placed items count*, both in time and memory complexities.

### Why JavaScript?

It also worth noting that JavaScript is not the fastest language out there. It's main limitation in terms of execution speed comes from the fact that it is an interpreted language. Languages such as C and C++ can solve this type of problems with higher time and memory efficiency. But JavaScript has an advantage of being sole programming language that web browsers understand. This allows to create beautiful user interfaces with HTML and CSS, and define their logic with JavaScript. Browser environment also allows to directly take memory snapshots to analyze memory consumption of the page. These are the main reasons why JavaScript was selected for this project.

## Testing

Several test scenarios can be found in the `puzzle-solver-tests.js` file in the `src/tests` directory of the project.

## References

[0]: https://v8.dev/
[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
[2]: https://en.wikipedia.org/wiki/Greedy_algorithm
[3]: cs.cmu.edu/~tcortina/15-121sp10/Unit06B.pdf
[4]: https://en.wikipedia.org/wiki/Hash_table

* [V8 JavaScript Engine, v8.dev][0]
* [JavaScript Data Structures, Mozilla Developer Network][1]
* [Greedy algorithm, Wikipedia][2]
* [Heap, Carnegie Mellon University][3]
* [Hash table, Wikipedia][4]