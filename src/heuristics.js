import Puzzle from './components/puzzle.js'


export const manhattanDistance = (currentState, targetState, puzzleSize) => {

  return currentState.reduce((heuristicValue, currentValue, currentIndex) => {

    if (currentValue === 0 || currentValue === targetState[currentIndex])
      return heuristicValue;

    const targetIndex = targetState.indexOf(currentValue);

    const {col: currentCol, row: currentRow} = Puzzle.getCellPosition(currentIndex, puzzleSize);
    const {col: targetCol, row: targetRow} = Puzzle.getCellPosition(targetIndex, puzzleSize);

    return heuristicValue + Math.abs(currentCol - targetCol) + Math.abs(currentRow - targetRow);
  }, 0);
};


export const invalidPlacedCellsCount = (currentState, targetState) => {

  return currentState.reduce((heuristicValue, currentValue, currentIndex) => {

    if (currentValue === 0 || currentValue === targetState[currentIndex])
      return heuristicValue;

    return heuristicValue + 1;
  }, 0);
};
