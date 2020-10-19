import Puzzle from './puzzle.js';


function main() {
  const initialState = new Puzzle({
    selectors: {
      containerId: '#initial-state',
      cursorId: '#initial-state-cursor',
    }
  });

  const targetState = new Puzzle({
    selectors: {
      containerId: '#target-state',
      cursorId: '#target-state-cursor',
    }
  });
}

main();