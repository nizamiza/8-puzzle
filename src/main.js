import Puzzle from './components/puzzle.js';
import StepsAssembler from './components/steps-assembler.js';
import {handleForm, handleInput} from './components/puzzle-form.js';
import solvePuzzle from './components/puzzle-solver.js';
import {manhattanDistance, invalidPlacedItemsCount} from './heuristics.js'
import runPuzzleTests from './tests/puzzle-tests.js';
import runMinHeapTests from './tests/min-heap-tests.js';
import runPuzzleSolverTests from './tests/puzzle-solver-tests.js';
import {generateRandomState, range} from './utils.js';


const createPuzzles = (puzzleSize) => {
  return [
    new Puzzle({
      selectors: {
        containerId: 'initial-state',
        cursorId: 'initial-state-cursor',
      },
      size: puzzleSize,
    }),

    new Puzzle({
      selectors: {
        containerId: 'target-state',
        cursorId: 'target-state-cursor',
      },
      size: puzzleSize,
    }),
  ];
}

const main = () => {
  const solvePuzzleFormId = 'solve-puzzle-form';
  const solvePuzzleForm = document.getElementById(solvePuzzleFormId);

  const puzzleWrappers = document.querySelectorAll('.puzzle-wrapper');

  const puzzleSizeInputId = 'puzzle-size';
  const puzzleSizeLabel = document.querySelector(`label[for="${puzzleSizeInputId}"]`);

  const initialStateRandomizeButton = document.getElementById('initial-state-randomize-button');
  const targetStateRandomizeButton = document.getElementById('target-state-randomize-button');

  const initialStateResetButton = document.getElementById('initial-state-reset-button');
  const targetStateResetButton = document.getElementById('target-state-reset-button');

  if (puzzleSizeLabel) {
    puzzleSizeLabel.textContent = puzzleSizeLabel?.textContent.replace(
      /\d+/,
      document.getElementById(puzzleSizeInputId).value
    );

    handleInput(puzzleSizeInputId, (event) => {
      puzzleSizeLabel.textContent = puzzleSizeLabel.textContent.replace(/\d+/, event.target.value);
    });
  }

  let initialStatePuzzle;
  let targetStatePuzzle;
  let heuristicFunction;
  let puzzleSize = 3;
  
  handleForm('puzzle-form', (formData) => {
    puzzleSize = Number.parseInt(formData.get('puzzle-size'));

    if (initialStatePuzzle)
      initialStatePuzzle.removeEventListeners();

    if (targetStatePuzzle)
      targetStatePuzzle.removeEventListeners();

    [initialStatePuzzle, targetStatePuzzle] = createPuzzles(puzzleSize);

    puzzleWrappers.forEach(wrapper => wrapper.setAttribute('data-open', 'true'));
    solvePuzzleForm.setAttribute('data-open', 'true');
  });

  handleForm(solvePuzzleFormId, (formData) => {
    const heuristicType = formData.get('heuristic-type');
    const minimizeOutput = formData.get('minimized-output');
    const reverseSteps = formData.get('reversed-steps');

    if (heuristicType === 'manhattan')
      heuristicFunction = manhattanDistance;

    else if (heuristicType === 'incorrect-items-count')
      heuristicFunction = invalidPlacedItemsCount;

    const stepsAssembler = new StepsAssembler({
      puzzleSize,
      selectors: {
        containerId: 'solution-steps',
      },
    });

    if (!initialStatePuzzle || !targetStatePuzzle)
      [initialStatePuzzle, targetStatePuzzle] = createPuzzles(puzzleSize);

    stepsAssembler.setSolving(true);

    setTimeout(() => {
      const [solutionSteps, priorityQueue] = solvePuzzle({
        initialState: initialStatePuzzle.getState(),
        targetState: targetStatePuzzle.getState(),
        heuristicFunction,
        puzzleSize,
        stepsAssembler,
        minimizeOutput,
        reverseSteps,
      });

      console.log({solutionSteps, priorityQueue});
      stepsAssembler.setSolving(false);
    }, 50);
  })

  initialStateRandomizeButton.addEventListener('click', () => {
    if (initialStatePuzzle)
      initialStatePuzzle.setState(generateRandomState(puzzleSize));
  });

  targetStateRandomizeButton.addEventListener('click', () => {
    if (targetStatePuzzle)
      targetStatePuzzle.setState(generateRandomState(puzzleSize));
  });

  initialStateResetButton.addEventListener('click', () => {
    if (initialStatePuzzle)
      initialStatePuzzle.setState([...range(1, puzzleSize ** 2), 0]);
  });

  targetStateResetButton.addEventListener('click', () => {
    if (targetStatePuzzle)
      targetStatePuzzle.setState([...range(1, puzzleSize ** 2), 0]);
  });
}

runPuzzleTests();
runMinHeapTests();
runPuzzleSolverTests();
main();