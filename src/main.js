import Puzzle from './puzzle.js';
import {handleForm, handleInput} from './puzzle-form.js';
import {manhattanDistance, invalidPlacedItemsCount} from './heuristics.js'
import solvePuzzle from './puzzle-solver.js';
import runTests from './tests/puzzle-tests.js';
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
  const puzzleSolutionStepsContainer = document.getElementById('solution-steps');

  const initialStateRandomizeButton = document.getElementById('initial-state-randomize-button');
  const targetStateRandomizeButton = document.getElementById('target-state-randomize-button');

  const initialStateResetButton = document.getElementById('initial-state-reset-button');
  const targetStateResetButton = document.getElementById('target-state-reset-button');

  puzzleSizeLabel.textContent = puzzleSizeLabel.textContent.replace(
    /\d+/,
    document.getElementById(puzzleSizeInputId).value
  );

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

    if (heuristicType === 'manhattan')
      heuristicFunction = manhattanDistance;
    else if (heuristicType === 'incorrect-items-count')
      heuristicFunction = invalidPlacedItemsCount;

    if (!initialStatePuzzle || !targetStatePuzzle) {
      [initialStatePuzzle, targetStatePuzzle] = createPuzzles(puzzleSize);
    }

    solvePuzzle({
      initialState: initialStatePuzzle.getState(),
      targetState: targetStatePuzzle.getState(),
      heuristicFunction,
      puzzleSize,
      solutionStepsContainer: puzzleSolutionStepsContainer,
    })
  })

  handleInput(puzzleSizeInputId, (event) => {
    puzzleSizeLabel.textContent = puzzleSizeLabel.textContent.replace(/\d+/, event.target.value);
  });

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
      initialStatePuzzle.setState([...range(1, puzzleSize * puzzleSize), 0]);
  });

  targetStateResetButton.addEventListener('click', () => {
    if (targetStatePuzzle)
      targetStatePuzzle.setState([...range(1, puzzleSize * puzzleSize), 0]);
  });
}

main();
runTests();