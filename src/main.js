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

const setDataOpenAttribute = (element, value) => {
  if (value)
    element.setAttribute('data-open', value)
  else
    element.removeAttribute('data-open');
};

const handleStateForm = (formId, puzzle) => {
  const input = document.getElementById(formId).querySelector('input');

  input.pattern = `^([0-9]+[\\s-]?){${puzzle.size.cols * puzzle.size.rows}}$`;

  handleForm(formId, (formData) => {
    const state = formData.get('puzzle-state');
    const parsedState = state.split(/[\s-]+/).map(value => Number.parseInt(value));
    
    puzzle.setState(parsedState);
  });
}

const main = () => {
  const solvePuzzleFormId = 'solve-puzzle-form';
  const solvePuzzleForm = document.getElementById(solvePuzzleFormId);

  const puzzleWrappers = document.querySelectorAll('.puzzle-wrapper');
  const solutionStepsWrapper = document.getElementById('solution-steps-wrapper');

  const titlePuzzleSize = document.getElementById('puzzle-size');
  const shortcutIcon = document.head.querySelector('link[rel="shortcut icon"]');

  let initialStatePuzzle;
  let targetStatePuzzle;
  let heuristicFunction;
  let stepsAssembler;

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

  const setPagePuzzleSizeInfo = () => {
    const size = (puzzleSize.cols * puzzleSize.rows) - 1;

    const bgColor = document.documentElement.style.getPropertyValue('--background-color');
    const fgColor = document.documentElement.style.getPropertyValue('--foreground-color');

    titlePuzzleSize.textContent = size;
    shortcutIcon.href = `https://dummyimage.com/192x192/${bgColor}/${fgColor}&text=${size}`;
  } 

  setPagePuzzleSizeInfo();

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

    if (stepsAssembler)
      stepsAssembler.clearContainer();

    [initialStatePuzzle, targetStatePuzzle] = createPuzzles(puzzleSize);

    puzzleWrappers.forEach(wrapper => setDataOpenAttribute(wrapper, true));
  
    setDataOpenAttribute(solvePuzzleForm, true);
    setDataOpenAttribute(solutionStepsWrapper, true);

    handleStateForm('initial-state-form', initialStatePuzzle);
    handleStateForm('target-state-form', targetStatePuzzle);

    setPagePuzzleSizeInfo();
  });

  handleForm(solvePuzzleFormId, (formData) => {
    const heuristicType = formData.get('heuristic-type');
    const minimizeOutput = formData.get('minimized-output');
    const reverseSteps = formData.get('reversed-steps');

    if (heuristicType === 'manhattan')
      heuristicFunction = manhattanDistance;

    else if (heuristicType === 'incorrect-items-count')
      heuristicFunction = invalidPlacedItemsCount;

    stepsAssembler = new StepsAssembler({
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