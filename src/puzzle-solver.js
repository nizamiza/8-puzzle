import MinHeap from './min-heap.js';
import Puzzle from './puzzle.js';


/**
 * @param {number[]} currentState 
 * @param {number[]} targetState 
 */
const manhattanHeuristic = (currentState, targetState, puzzleSize = 3) => {

  return currentState.reduce((heuristicValue, currentValue, currentIndex) => {

    if (currentValue === 0 || currentValue === targetState[currentIndex])
      return heuristicValue;

    const targetIndex = targetState.indexOf(currentValue);

    const {col: currentCol, row: currentRow} = Puzzle.getItemPosition(currentIndex, puzzleSize);
    const {col: targetCol, row: targetRow} = Puzzle.getItemPosition(targetIndex, puzzleSize);

    return Math.abs(currentCol - targetCol) + Math.abs(currentRow - targetRow);
  }, 0);
};

/**
 * @template T
 * @param {[T]} array
 * @param {number} indexA
 * @param {number} indexB
 * @returns {[T]} New array with swapped items at original indices A and B.
 */
const swapArrayElements = (array, indexA, indexB) => {
  return array.map((value, index) => {
    if (index === indexA) return array[indexB];
    if (index === indexB) return array[indexA];
    return value;
  })
};

/** @param {number[]} state  */
const generateStateKey = (state) => {
  return state.reduce((hashValue, currentValue) => `${hashValue}${currentValue}`, '');
}

/**
 * @param {object} params
 * @param {number[]} params.initialState 
 * @param {number[]} params.targetState
 * @param {(initialState: number[], targetState: number[]) => number} params.heuristicFunction
 * @param {HTMLElement} params.outputContainer
 */
const solvePuzzle = ({
  initialState,
  targetState,
  heuristicFunction = manhattanHeuristic,
  puzzleSize = 3,
}) => {
  const cursorIndex = initialState.indexOf(0);
  
  const priorityQueue = new MinHeap((state) => state.heuristicValue, [{
    state: initialState,
    cursorIndex,
    cursorPosition: Puzzle.getItemPosition(cursorIndex, puzzleSize),
    heuristicValue: heuristicFunction(initialState, targetState)
  }]);

  const visitedStates = new Map();

  while (priorityQueue.size() > 0) {
    const currentState = priorityQueue.pop();

    if (currentState.heuristicValue === 0)
      return currentState.state;

    currentState.state.forEach((_itemValue, itemIndex, state) => {
      const itemPosition = Puzzle.getItemPosition(itemIndex, puzzleSize);

      if (!Puzzle.itemIsMoveable(currentState.cursorPosition, itemPosition))
        return;

      const newState = swapArrayElements(state, currentState.cursorIndex, itemIndex);
      const stateKey = generateStateKey(newState);
      
      if (visitedStates.get(stateKey))
        return;

      visitedStates.set(stateKey, true);

      priorityQueue.push({
        state: newState,
        cursorIndex: itemIndex,
        cursorPosition: itemPosition,
        heuristicValue: heuristicFunction(newState, targetState),
      });
    })
  }  
};

export default solvePuzzle