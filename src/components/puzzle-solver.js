import MinHeap from './min-heap.js';
import Puzzle from './puzzle.js';


const generateStateKey = (state) => {
  return state.reduce((stateKey, currentValue) => {
    return `${stateKey ? `${stateKey}-` : ''}${currentValue}`;
  }, '');
};

const generateNewState = (state, cursorIndex, itemIndex) => {
  let newStateKey = '';
  let newState = [];

  for (let index = 0; index < state.length; index++) {
    if (index === cursorIndex)
      newState[index] = state[itemIndex];

    else if (index === itemIndex)
      newState[index] = state[cursorIndex];

    else
      newState[index] = state[index];

    newStateKey += `${newStateKey ? `-` : ''}${newState[index]}`;
  }

  return [newState, newStateKey];
};

const solvePuzzle = ({
  initialState,
  heuristicFunction,
  minimizeOutput = false,
  puzzleSize = 3,
  reverseSteps = false,
  stepsAssembler,
  targetState,
}) => {
  stepsAssembler.clearContainer();

  const startTime = performance.now();
  const cursorIndex = initialState.indexOf(0);

  const initialStateEntry = {
    cursorIndex: cursorIndex,
    heuristicValue: heuristicFunction(initialState, targetState, puzzleSize),
    state: initialState,
    stateKey: generateStateKey(initialState),
  };

  const priorityQueue = new MinHeap(initialStateEntry, (state) => state.heuristicValue);

  const visitedStates = new Map([[initialStateEntry.stateKey, {
    parentKey: null,
    stepElement: null,
  }]]);

  let priorityQueueSize = priorityQueue.size()

  while (priorityQueueSize > 0) {

    // if (priorityQueueSize > 500000) {
    //   stepsAssembler.addMessage('Too many nodes were generated. Terminating execution 🛑');
    //   return null;
    // }

    const {cursorIndex, heuristicValue, state, stateKey: parentStateKey} = priorityQueue.pop();
    const cursorPosition = Puzzle.getItemPosition(cursorIndex, puzzleSize);

    if (heuristicValue === 0) {

      const endTime = performance.now();
      const timeElapsed = ((endTime - startTime) / 1000).toFixed(5);

      const sectionDivider = '--------------------------';

      stepsAssembler.addMessage('Solution has been found 😊');
      stepsAssembler.addMessage(sectionDivider);

      const nodesCountMessage = stepsAssembler.addMessage(
        `Nodes created 🧱: ${visitedStates.size}`
      );

      const steps = stepsAssembler.assembleSteps({
        visitedStates,
        minimizeOutput,
        reverseSteps,
        stateKey: parentStateKey,
      });

      const stepsCountMessage = stepsAssembler.addMessage({
        messageText: `Steps count 🚶‍♀️: ${steps.length}`,
        appendAfter: nodesCountMessage,
      });

      const timeElapsedMessage = stepsAssembler.addMessage({
        messageText: `Time elapsed ⏰: ${timeElapsed}s`,
        appendAfter: stepsCountMessage,
      });
      
      if ('memory' in performance) {
        const memory = performance.memory
        const used = (memory.usedJSHeapSize / 1024).toFixed(2);
        const total =  (memory.jsHeapSizeLimit / 1024).toFixed(2);

        stepsAssembler.addMessage({
          messageText: `Heap memory used 💹: ${used}KB / ${total}KB`,
          appendAfter: timeElapsedMessage,
        })
      }

      stepsAssembler.addMessage({
        messageText: sectionDivider,
        appendAfter: 'last-message',
      });

      return steps;
    }

    state.forEach((itemValue, itemIndex) => {
      if (itemValue === 0)
        return;

      const itemPosition = Puzzle.getItemPosition(itemIndex, puzzleSize);
      const itemMoveDirection = Puzzle.getItemMoveDirection(cursorPosition, itemPosition);

      if (!itemMoveDirection)
        return;

      const [newState, newStateKey] = generateNewState(state, cursorIndex, itemIndex);
      if (visitedStates.get(newStateKey))
        return;

      visitedStates.set(newStateKey, {
        parentKey: parentStateKey,
        stepElement: stepsAssembler.createStep(itemValue, itemMoveDirection)
      });

      priorityQueue.push({
        cursorIndex: itemIndex,
        heuristicValue: heuristicFunction(newState, targetState, puzzleSize),
        state: newState,
        stateKey: newStateKey,
      });
    });

    priorityQueueSize = priorityQueue.size();
  }

  stepsAssembler.addMessage('Failed to find solution 😭');
  return null;
};

export default solvePuzzle;
