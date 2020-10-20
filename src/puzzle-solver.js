
/**
 * @param {[number]} currentState 
 * @param {[number]} targetState 
 */
const manhattanHeuristic = (currentState, targetState) => {
  return currentState.reduce((heuristicValue, currentValue, currentIndex) => {
    if (currentValue === targetState[currentIndex])
      return heuristicValue;

    return heuristicValue + Math.abs(currentIndex - targetState.indexOf(currentValue));
  });
}

/**
 * @param {[number]} initialState 
 * @param {[number]} targetState 
 */
const solvePuzzle = (initialState, targetState) => {
  console.log(initialState, targetState);
}

export default solvePuzzle