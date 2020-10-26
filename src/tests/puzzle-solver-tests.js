import solvePuzzle from '../components/puzzle-solver.js';
import StepsAssembler from '../components/steps-assembler.js';
import {manhattanDistance, invalidPlacedCellsCount} from '../heuristics.js';


const puzzleSolverTest = ({
  puzzleSize,
  heuristicFunction,
  initialState,
  targetState,
  correctDirections,
}) => {
  let testsPassed = true;
  
  const stepsAssembler = new StepsAssembler({
    puzzleSize,
    selectors: {
      containerId: 'solution-steps',
    },
  });
  
  const steps = solvePuzzle({
    initialState,
    targetState,
    heuristicFunction,
    puzzleSize,
    stepsAssembler,
  });

  const directions = steps.map(step => step.direction);

  directions.forEach((direction, index) => {
    if (direction !== correctDirections[index]) {
      console.warn(
        `Puzzle solving test failed. Expected direction ${correctDirections[index]}.`,
        `But got ${direction}`,
      );

      testsPassed = false;
    }
  });

  stepsAssembler.clearContainer();
  return testsPassed;
};

const runPuzzleSolverTests = () => {
  puzzleSolverTest({
    puzzleSize: 3,
    heuristicFunction: manhattanDistance,
    initialState: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    targetState: [1, 2, 3, 4, 6, 8, 7, 5, 0],
    correctDirections: ['right', 'down', 'left', 'up'],
  });

  puzzleSolverTest({
    puzzleSize: 3,
    heuristicFunction: invalidPlacedCellsCount,
    initialState: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    targetState: [1, 2, 3, 4, 6, 8, 7, 5, 0],
    correctDirections: ['right', 'down', 'left', 'up'],
  });

  puzzleSolverTest({
    puzzleSize: 4,
    heuristicFunction: invalidPlacedCellsCount,
    initialState: [1, 3, 0, 4, 5, 2, 6, 7, 9, 10, 12, 8, 13, 14, 11, 15],
    targetState: [1, 2, 3, 4, 5, 6, 8, 12, 9, 11, 14, 7, 13, 10, 0, 15],
    correctDirections: ['right', 'up', 'left', 'up', 'left', 'down', 'right', 'up', 'up', 'right', 'down', 'left', 'up'],
  });

  puzzleSolverTest({
    puzzleSize: 4,
    heuristicFunction: manhattanDistance,
    initialState: [1, 2, 3, 4, 5, 6, 0, 8, 9, 11, 7, 12, 13, 10, 14, 15],
    targetState: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
    correctDirections: ['up', 'right', 'up', 'left', 'left'],
  });

  puzzleSolverTest({
    puzzleSize: 5,
    heuristicFunction: manhattanDistance,
    initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 13, 14, 16, 17, 18, 20, 15, 21, 22, 23, 19, 24],
    targetState: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 19, 20, 21, 22, 18, 23, 24],
    correctDirections: ['left', 'left', 'up', 'right', 'up', 'right', 'down'],
  });
}

export default runPuzzleSolverTests;
