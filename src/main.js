import Puzzle from './components/puzzle.js';
import StepsAssembler from './components/steps-assembler.js';
import {handleForm, handleInput} from './components/puzzle-form.js';
import solvePuzzle from './components/puzzle-solver.js';
import {manhattanDistance, invalidPlacedItemsCount} from './heuristics.js'
import runPuzzleTests from './tests/puzzle-tests.js';
import runMinHeapTests from './tests/min-heap-tests.js';
import runPuzzleSolverTests from './tests/puzzle-solver-tests.js';


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
};

const main = () => {
  const solvePuzzleFormId = 'solve-puzzle-form';
  const solvePuzzleForm = document.getElementById(solvePuzzleFormId);
  const puzzleWrappers = document.querySelectorAll('.puzzle-wrapper');

  let initialStatePuzzle;
  let targetStatePuzzle;
  let heuristicFunction;

  let puzzleSize = {
    cols: 3,
    rows: 3,
  };

  const setPuzzleSizeInputChangeHandler = (dimension) => {
    const inputId = `puzzle-size-${dimension}s`;
    const label = document.querySelector(`label[for="${inputId}"]`);

    const setLabelText = (value) => {
      label.textContent = `Puzzle ${dimension}s (current = ${value}):`
    };

    const currentValue = puzzleSize[`${dimension}s`];

    handleInput(inputId, (event) => setLabelText(event.target.value));

    document.getElementById(inputId).value = currentValue;
    setLabelText(currentValue);
  }

  setPuzzleSizeInputChangeHandler('col');
  setPuzzleSizeInputChangeHandler('row');
  
  handleForm('puzzle-form', (formData) => {
    puzzleSize = {
      cols: Number.parseInt(formData.get('puzzle-size-cols')),
      rows: Number.parseInt(formData.get('puzzle-size-rows')),
    }

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
      solvePuzzle({
        initialState: initialStatePuzzle.getState(),
        targetState: targetStatePuzzle.getState(),
        heuristicFunction,
        puzzleSize,
        stepsAssembler,
        minimizeOutput,
        reverseSteps,
      });

      stepsAssembler.setSolving(false);
    }, 50);
  });

  document.getElementById('initial-state-randomize-button').addEventListener('click', () => {
    initialStatePuzzle?.setRandomState();
  });

  document.getElementById('target-state-randomize-button').addEventListener('click', () => {
    targetStatePuzzle?.setRandomState();
  });

  document.getElementById('initial-state-reset-button').addEventListener('click', () => {
    initialStatePuzzle?.resetState();
  });

  document.getElementById('target-state-reset-button').addEventListener('click', () => {
    targetStatePuzzle?.resetState();
  });
}

runPuzzleTests();
runMinHeapTests();
runPuzzleSolverTests();
main();