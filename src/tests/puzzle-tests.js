import Puzzle from '../components/puzzle.js';
import {range, generateRandomState} from '../utils.js';


export const getPuzzleItemPositionTest = (state, puzzleSize) => {
  return state.reduce(({testPassed, passedTestsCount}, currentItem, currentIndex) => {
    const { col, row } = Puzzle.getItemPosition(currentIndex, puzzleSize);

    const expectedCol = currentIndex % puzzleSize;
    const expectedRow = Math.floor(currentIndex / puzzleSize);

    const colIsCorrect = col === expectedCol;
    const rowIsCorrect = row === expectedRow;

    const currentTestPassed = colIsCorrect && rowIsCorrect && testPassed;

    if (!currentTestPassed) {
      console.warn(
        `Position test for puzzle item ${currentItem} has failed!`,
        `Position was expected to be: col = ${expectedCol}, row = ${expectedRow}.`,
        `But result was: col = ${col}, row = ${row}`,
      );
    }

    return {
      testPassed: currentTestPassed,
      passedTestsCount: currentTestPassed ? passedTestsCount + 1 : passedTestsCount,
    };
  }, {
    testPassed: true,
    passedTestsCount: 0,
  });
};


export const puzzleStateTest = (state, puzzleSize) => {

}


const runTests = (runsCount = 5) => {
  range(runsCount).forEach(() => {
    const puzzleSize = Math.round(Math.random() * 7 + 3);
    const state = generateRandomState(puzzleSize);

    const {testPassed, passedTestsCount} = getPuzzleItemPositionTest(state, puzzleSize);

    if (!testPassed) {
      console.warn(
        'Puzzle item position function tests have failed!',
        `Successfully passed tests count: ${passedTestsCount} / ${state.length}`,
      );
    }
  })
};

export default runTests;
