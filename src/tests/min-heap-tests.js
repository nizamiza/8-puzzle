import MinHeap from '../components/min-heap.js';
import {range} from '../utils.js'


const randomPositiveDelta = () => Math.abs(Math.round(Math.random() * 100 + 1));

const minHeapInsertionTest = (runsCount = 5, maxHeapSize = 1000) => {
  return range(runsCount).reduce(({testPassed, passedTestsCount}) => {
    let currentPassedTestsCount = 0;

    const heapSize = Math.round(Math.random() * (maxHeapSize - 1) + 1);
    const heapValues = range(heapSize).map(randomPositiveDelta);

    const heap = new MinHeap();
    heapValues.forEach(value => heap.push(value));

    const sortedValues = [...heapValues].sort((a, b) => a - b);
  
    const minValue = sortedValues[0];
    const smallerThanMinValue = minValue - randomPositiveDelta();
    
    heap.push(smallerThanMinValue);
    const poppedValue = heap.pop();
    
    const minValueTestPassed = poppedValue === smallerThanMinValue;

    if (!minValueTestPassed) {
      console.warn(
        `MinHeap test failed. Popped value expected to be ${smallerThanMinValue}.`,
        `But actual value was ${poppedValue}.`,
        {heapElements: heap.elements},
      );
    } else {
      currentPassedTestsCount++;
    }
  
    const maxValue = sortedValues[sortedValues.length - 1];
    const biggerThanMaxValue = maxValue + randomPositiveDelta();
    
    heap.push(biggerThanMaxValue);
    const indexOfMaxValue = heap.elements.indexOf(biggerThanMaxValue)
    
    const maxValueTestPassed = indexOfMaxValue >= heap.size() / 2;

    if (!maxValueTestPassed) {
      console.warn(
        'MinHeap test failed. Max value expected to be at the bottom of the heap',
        `But index of the max value was ${indexOfMaxValue}.`,
        {heapElements: heap.elements},
      )
    } else {
      currentPassedTestsCount++;
    }

    return {
      testPassed: testPassed && minValueTestPassed && maxValueTestPassed,
      passedTestsCount: passedTestsCount + currentPassedTestsCount,
    };
  }, {
    testPassed: true,
    passedTestsCount: 0,
  });
};

export default minHeapInsertionTest;
