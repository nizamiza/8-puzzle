import Puzzle from './puzzle.js';
import solvePuzzle from './puzzle-solver.js';


const main = () => {
  const solveButton = document.getElementById('solve-button');

  const initialState = new Puzzle({
    selectors: {
      containerId: 'initial-state',
      cursorId: 'initial-state-cursor',
    }
  });

  const targetState = new Puzzle({
    selectors: {
      containerId: 'target-state',
      cursorId: 'target-state-cursor',
    }
  });

  solveButton.addEventListener('click', () => {
    initialState.setState(solvePuzzle({
      initialState: initialState.getState(),
      targetState: targetState.getState(),
    }));
  });
}

main();