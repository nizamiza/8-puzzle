/**
 * Based on work by © Marijn Haverbeke, 2007
 * @see https://eloquentjavascript.net/1st_edition/appendix2.html
 */
class MinHeap {
  elements;
  getPriority;

  constructor(initialValue, getPriority = (element) => element) {
    this.elements = initialValue ? [initialValue] : [];
    this.getPriority = getPriority;
  }
  
  swapElements(indexA, indexB) {
    return [this.elements[indexA], this.elements[indexB]] = [
      this.elements[indexB],
      this.elements[indexA]
    ]
  }

  bottomHeapify() {
    let currentIndex = this.size() - 1;

    const element = this.elements[currentIndex];
    const priority = this.getPriority(element);

    while (currentIndex > 0) {

      const parentIndex = Math.floor((currentIndex + 1) / 2) - 1;
      const parentElement = this.elements[parentIndex];

      if (priority >= this.getPriority(parentElement))
        break;

      this.swapElements(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  topHeapify() {
    let currentIndex = 0;

    const element = this.elements[currentIndex];
    const priority = this.getPriority(element);

    const elementsCount = this.size();

    while (true) {

      let leftChildIndex = (currentIndex * 2) + 1;
      let rightChildIndex = (currentIndex * 2) + 2;

      let leftChildPriority;
      let rightChildPriority;

      let swapIndex;

      if (leftChildIndex < elementsCount) {
        leftChildPriority = this.getPriority(this.elements[leftChildIndex]);

        if (leftChildPriority < priority)
          swapIndex = leftChildIndex;
      }

      if (rightChildIndex < elementsCount) {
        rightChildPriority =  this.getPriority(this.elements[rightChildIndex]);
              
        if (rightChildPriority < (swapIndex ? leftChildPriority : priority))
          swapIndex = rightChildIndex;
      }

      if (!swapIndex)
        break;

      this.swapElements(currentIndex, swapIndex);
      currentIndex = swapIndex;
    }
  }

  pop() {
    const poppedElement = this.elements[0];
    const lastElement = this.elements.pop();

    if (this.elements.length > 0) {
      this.elements[0] = lastElement;
      this.topHeapify();
    }

    return poppedElement;
  }

  push(element) {
    this.elements.push(element);
    this.bottomHeapify();
  }

  size() {
    return this.elements.length;
  }
}

export default MinHeap;
