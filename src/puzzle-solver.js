import MinHeap from './min-heap.js';
import Puzzle from './puzzle.js';


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
  return state.reduce((hashValue, currentValue) => `${hashValue}${currentValue}-`, '');
};

/**
 * @param {number} itemValue 
 * @param {string} itemMoveDirection 
 * @param {string} className 
 */
const createSolutionStepElement = (itemValue, itemMoveDirection, className) => {
  const container = document.createElement('div');
  const item = document.createElement('div');
  const direction = document.createElement('span');

  container.className = className;
  item.className = `${className}-item`;
  direction.className = `${className}-direction`;

  item.textContent = itemValue;
  direction.textContent = itemMoveDirection;

  container.append(item, direction);
  return container;
};

/**
 * @param {number} itemValue 
 * @param {string} itemMoveDirection 
 * @param {string} className 
 */
const createSolutionMessage = (success, className) => {
  const message = document.createElement('p');
  
  message.className = `${className}-failure-message`;
  
  if (success)
    message.textContent = 'Solution has been found 😊';
  else
    message.textContent = 'Failed to find solution 😭';

  return message;
};

/**
 * @typedef {Map<string, {parentKey: string, stepElement: HTMLElement}>} VisitedStatesMap
 * @param {VisitedStatesMap} visitedStates 
 * @param {string} stateKey
 * @param {HTMLElement} stepsContainer 
 */
const assembleSolutionSteps = (visitedStates, stateKey, stepsContainer, stepClassName) => {
  const prependIndexToStep = (stepElement, index) => {
    const stepIndex = document.createElement('span');
    
    stepIndex.className = `${stepClassName}-index`;
    stepIndex.textContent = index + 1;
    
    stepElement.prepend(stepIndex);
    return stepElement;
  };
  
  const getSolutionSteps = (stateKey, steps = []) => {
    const {stepElement, parentKey} = visitedStates.get(stateKey);

    if (stepElement)
      steps.push(stepElement);

    if (parentKey)
      getSolutionSteps(parentKey, steps);

    return steps;
  };

  const reversedSteps = getSolutionSteps(stateKey).reverse();

  stepsContainer.append(
    createSolutionMessage(true, stepClassName),
    ...reversedSteps.map(prependIndexToStep)
  );
}

/**
 * @param {object} params
 * @param {number[]} params.initialState 
 * @param {number[]} params.targetState
 * @param {(initialState: number[], targetState: number[], puzzleSize: number) => number} params.heuristicFunction
 * @param {number} params.puzzleSize
 * @param {HTMLElement} params.solutionStepsContainer
 * @param {string} params.solutionStepClassName
 */
const solvePuzzle = ({
  initialState,
  targetState,
  heuristicFunction,
  puzzleSize,
  solutionStepsContainer,
  solutionStepClassName = 'solution-step',
}) => {
  solutionStepsContainer.innerHTML = '';

  const cursorIndex = initialState.indexOf(0);
  const initialStateKey = generateStateKey(initialState);

  const priorityQueue = new MinHeap((state) => state.heuristicValue, [{
    state: initialState,
    stateKey: initialStateKey,
    parentStateKey: null,
    cursorIndex,
    cursorPosition: Puzzle.getItemPosition(cursorIndex, puzzleSize),
    heuristicValue: heuristicFunction(initialState, targetState, puzzleSize),
  }]);

  /** @type {VisitedStatesMap} */
  const visitedStates = new Map([[initialStateKey, {
    parentKey: null,
    stepElement: null,
  }]]);

  while (priorityQueue.size() > 0) {
    const {
      cursorIndex,
      cursorPosition,
      state,
      stateKey: parentStateKey,
      heuristicValue,
    } = priorityQueue.pop();

    if (heuristicValue === 0) {
      assembleSolutionSteps(
        visitedStates,
        parentStateKey,
        solutionStepsContainer,
        solutionStepClassName
      );

      return state;
    }

    state.forEach((itemValue, itemIndex, currentState) => {
      if (itemValue === 0)
        return;

      const itemPosition = Puzzle.getItemPosition(itemIndex, puzzleSize);
      const itemMoveDirection = Puzzle.getItemMoveDirection(cursorPosition, itemPosition);

      if (!itemMoveDirection)
        return;

      const newState = swapArrayElements(currentState, cursorIndex, itemIndex);
      const stateKey = generateStateKey(newState);
      
      if (visitedStates.get(stateKey))
        return;

      visitedStates.set(stateKey, {
        parentKey: parentStateKey,
        stepElement: createSolutionStepElement(
          itemValue,
          itemMoveDirection,
          solutionStepClassName,
        )
      });

      priorityQueue.push({
        stateKey,
        parentStateKey,
        state: newState,
        cursorIndex: itemIndex,
        cursorPosition: itemPosition,
        heuristicValue: heuristicFunction(newState, targetState, puzzleSize),
      });
    })
  }

  solutionStepsContainer.append(createSolutionMessage(false, solutionStepClassName));
  return null;
};

export default solvePuzzle