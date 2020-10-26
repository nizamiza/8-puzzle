import {handleForm} from './puzzle-form.js';
import solvePuzzle from './puzzle-solver.js';
import {invalidPlacedCellsCount, manhattanDistance} from '../heuristics.js';
import {generateRandomState} from '../utils.js';


const bulkTests = () => {
  const progressBarId = 'bulk-tests-progress';
  const bulkTestResultsId = 'bulk-test-results';

  const progressBar = document.getElementById(progressBarId);

  const progressBarLabel = document.querySelector(`label[for="${progressBarId}"]`);
  const bulkTestResults = document.getElementById(bulkTestResultsId);

  const bulkTestsContainer = document.getElementById('bulk-tests');
  const bulkTestsCheckBox = document.getElementById('run-bulk-tests');

  bulkTestsCheckBox.addEventListener('change', () => {
      bulkTestsContainer.toggleAttribute('aria-hidden');
  });

	handleForm('bulk-tests-form', (formData) => {
    let totalTime = 0;
    let totalNodesAmount = 0;
    let solvedPuzzles = 0;
    let heuristicFunction;

    bulkTestResults.innerHTML = '';

		const testsAmount = Number.parseInt(formData.get('tests-amount'));

		const puzzleSize = {
      cols: Number.parseInt(formData.get('puzzle-size-cols')),
      rows: Number.parseInt(formData.get('puzzle-size-rows')),
		}

		const heuristicType = formData.get('heuristic-type');
    const minimizeOutput = formData.get('minimized-output');
    const reverseSteps = formData.get('reversed-steps');

		if (heuristicType === 'manhattan')
      heuristicFunction = manhattanDistance;

    else if (heuristicType === 'incorrect-cells-count')
      heuristicFunction = invalidPlacedCellsCount;
		
    progressBar.max = testsAmount;
    progressBarLabel.textContent = 'Running...';
		
		for (let i = 0; i < testsAmount; i++) {			
			setTimeout(() => {
        const {stats} = solvePuzzle({
          initialState: generateRandomState(puzzleSize),
          targetState: generateRandomState(puzzleSize),
          heuristicFunction,
          puzzleSize,
          minimizeOutput,
          reverseSteps,
        });

        progressBar.value = i + 1;

        if (stats) {
          totalTime += stats.timeElapsed;
          totalNodesAmount += stats.nodesAmount; 
          solvedPuzzles++;
        }

        if (i === testsAmount - 1) {
          const averageTime = document.createElement('span');
          averageTime.textContent = `Average time ⏲: ${(totalTime / testsAmount).toFixed(5)}ms`;

          const averageNodesAmount = document.createElement('span');
          averageNodesAmount.textContent = (
            `Average nodes amount 🧱: ${(totalNodesAmount / testsAmount).toFixed(2)}`
          );

          const solvedPuzzlesAmount = document.createElement('span');
          solvedPuzzlesAmount.textContent = `Solved puzzles ✅: ${solvedPuzzles} / ${testsAmount}`;

          bulkTestResults.append(averageTime, averageNodesAmount, solvedPuzzlesAmount);
          progressBarLabel.textContent = 'All tests completed 👏';
          progressBar.value = 0;
        }
      }, 0);
    }
	});
};

export default bulkTests;
