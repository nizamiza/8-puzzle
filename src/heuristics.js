import Puzzle from './components/puzzle.js'


/**
 * @param {number[]} currentState 
 * @param {number[]} targetState 
 */
export const manhattanDistance = (currentState, targetState, puzzleSize) => {

  return currentState.reduce((heuristicValue, currentValue, currentIndex) => {

    if (currentValue === 0 || currentValue === targetState[currentIndex])
      return heuristicValue;

    const targetIndex = targetState.indexOf(currentValue);

    const {col: currentCol, row: currentRow} = Puzzle.getItemPosition(currentIndex, puzzleSize);
    const {col: targetCol, row: targetRow} = Puzzle.getItemPosition(targetIndex, puzzleSize);

    return heuristicValue + Math.abs(currentCol - targetCol) + Math.abs(currentRow - targetRow);
  }, 0);
};

/**
 * @param {number[]} currentState 
 * @param {number[]} targetState 
 */
export const invalidPlacedItemsCount = (currentState, targetState) => {

  return currentState.reduce((heuristicValue, currentValue, currentIndex) => {

    if (currentValue === 0 || currentValue === targetState[currentIndex])
      return heuristicValue;

    return heuristicValue + 1;
  }, 0);
};
