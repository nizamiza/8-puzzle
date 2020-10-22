import {swapArrayElements} from '../utils.js';
import MinHeap from './min-heap.js';
import Puzzle from './puzzle.js';
import SolutionStepsAssembler from './solution-steps-assembler.js';


/** @param {number[]} state  */
const generateStateKey = (state) => {
  return state.reduce((hash, currentValue) => `${hash ? `${hash}-` : ''}${currentValue}`, '');
};

/**
 * @param {object} params
 * @param {number[]} params.initialState 
 * @param {number[]} params.targetState
 * @param {(current: number[], target: number[], size: number) => number} params.heuristicFunction
 * @param {number} params.puzzleSize
 * @param {SolutionStepsAssembler} params.solutionStepsAssembler
 * @param {boolean} params.minimizeOutput
 * @param {boolean} params.reverseSteps
 */
const solvePuzzle = ({
  initialState,
  targetState,
  heuristicFunction,
  puzzleSize,
  solutionStepsAssembler,
  minimizeOutput,
  reverseSteps,
}) => {
  const startTime = performance.now();
  solutionStepsAssembler.clearContainer();

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

  /** @type {Map<string, {parentKey: string, stepElement: HTMLElement}>} */
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

    if (priorityQueue.size() > 500000) {
      solutionStepsAssembler.addMessage('Too many nodes were generated. Terminating execution ⚠');
      return null;
    }

    if (heuristicValue === 0) {
      const endTime = performance.now();
      const timeElapsed = ((endTime - startTime) / 1000).toFixed(6);

      const sectionDivider = '--------------------------';

      solutionStepsAssembler.addMessage('Solution has been found 😊');
      solutionStepsAssembler.addMessage(sectionDivider);

      const nodesCountMessage = solutionStepsAssembler.addMessage(
        `Nodes created 🧱: ${visitedStates.size}`
      );

      const stepsCount = solutionStepsAssembler.assembleSteps({
        visitedStates,
        minimizeOutput,
        reverseSteps,
        stateKey: parentStateKey,
      });

      const stepsCountMessage = solutionStepsAssembler.addMessage({
        messageText: `Steps count 🚶‍♀️: ${stepsCount}`,
        appendAfter: nodesCountMessage,
      });

      const timeElapsedMessage = solutionStepsAssembler.addMessage({
        messageText: `Time elapsed ⏰: ${timeElapsed}s`,
        appendAfter: stepsCountMessage,
      });

      solutionStepsAssembler.addMessage({
        messageText: sectionDivider,
        appendAfter: timeElapsedMessage,
      });

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
        stepElement: solutionStepsAssembler.createStep(itemValue, itemMoveDirection)
      });

      priorityQueue.push({
        stateKey,
        parentStateKey,
        state: newState,
        cursorIndex: itemIndex,
        cursorPosition: itemPosition,
        heuristicValue: heuristicFunction(newState, targetState, puzzleSize),
      });
    });
  }

  solutionStepsAssembler.addMessage('Failed to find solution 😭');
  return null;
};

export default solvePuzzle;
