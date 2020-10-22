/**
 * Based on work by © Marijn Haverbeke, 2007
 * @see https://eloquentjavascript.net/1st_edition/appendix2.html
 * 
 * @template T
 */
class MinHeap {
  /** @type {T[]} */
  elements;

  /** @type {(element: T) => number} */
  getPriority;

  /**
   * @param {T[]} initialValues
   * @param {(heapElement: T) => number} getPriority
   */
  constructor(getPriority, initialValues) {
    this.elements = initialValues;
    this.getPriority = getPriority;
  }
  
  /**
   * @param {number} indexA 
   * @param {number} indexB 
   */
  _swapElements(indexA, indexB) {
    return [this.elements[indexA], this.elements[indexB]] = [this.elements[indexB], this.elements[indexA]]
  }

  /** @param {number} index */
  _orderElementsFromBottom(index = 0) {
    let currentIndex = index;

    const element = this.elements[currentIndex];
    const priority = this.getPriority(element);

    while (currentIndex > 0) {

      const parentIndex = Math.floor((currentIndex + 1) / 2) - 1;
      const parentElement = this.elements[parentIndex];

      if (priority >= this.getPriority(parentElement))
        break;

      this._swapElements(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  /** @param {number} index */
  _orderElementsFromTop(index = 0) {
    let currentIndex = index;
    
    const elementsCount = this.elements.length;

    const element = this.elements[currentIndex];
    const priority = this.getPriority(element);

    while (true) {
      let rightChildIndex = (currentIndex + 1) * 2;
      let leftChildIndex = rightChildIndex - 1;

      let swapIndex;
      let leftChildPriority;

      if (leftChildIndex < elementsCount) {

        const leftChild = this.elements[leftChildIndex];
        leftChildPriority = this.getPriority(leftChild);

        if (leftChildPriority < priority)
          swapIndex = leftChildIndex;
      }

      if (rightChildIndex < elementsCount) {
        const rightChild = this.elements[rightChildIndex];
        const rightChildPriority = this.getPriority(rightChild);
        
        if (rightChildPriority < (!swapIndex ? priority : leftChildPriority))
          swapIndex = rightChildIndex;
      }

      if (!swapIndex)
        break;

      this._swapElements(currentIndex, swapIndex);
      currentIndex = swapIndex;
    }
  }

  pop() {
    const poppedElement = this.elements[0];
    const lastElement = this.elements.pop();

    if (this.elements.length > 0) {
      this.elements[0] = lastElement;
      this._orderElementsFromTop();
    }

    return poppedElement;
  }

  /** @param {T} element */
  push(element) {
    this.elements.push(element);
    this._orderElementsFromBottom(this.elements.length - 1);
  }

  size() {
    return this.elements.length;
  }
}

export default MinHeap;
