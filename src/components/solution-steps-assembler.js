import Puzzle from './puzzle.js';


class SolutionStepsAssembler {
  /**
   * @typedef SolutionStepsAssemblerSelectors
   * @property {string} containerId
   * @property {string} solutionMessageClassName
   * @property {string} stepClassName
   * @property {string} stepItemClassName
   * @property {string} stepIndexClassName
   * @property {string} stepDirectionClassName
   * @property {string} stepPuzzleWrapperClassName
   * 
   * @typedef SolutionStepsAssemblerParams
   * @property {SolutionStepsAssemblerSelectors} selectors
   * @property {number} puzzleSize
   * @property {string} stepStateItemsSeparator
   */
  
   /** @type {SolutionStepsAssemblerSelectors} */
  _selectors;

  /** @type {HTMLElement} */
  _container;

  /** @type {number} */
  _puzzleSize;

  /** @type {string} */
  _stepStateItemsSeparator;

  /** @param {SolutionStepsAssemblerParams} params */
  constructor({selectors, puzzleSize, stepStateItemsSeparator = '-'}) {
    const {containerId, stepClassName = 'solution-step'} = selectors;
    
    const {
      stepDirectionClassName = `${stepClassName}-direction`,
      stepIndexClassName = `${stepClassName}-index`,
      stepItemClassName = `${stepClassName}-item`,
      solutionMessageClassName = `${stepClassName}-message`,
      stepPuzzleWrapperClassName = `${stepClassName}-puzzle`,
    } = selectors;

    this._selectors = {
      containerId,
      stepClassName,
      stepDirectionClassName,
      stepIndexClassName,
      stepItemClassName,
      solutionMessageClassName,
      stepPuzzleWrapperClassName,
    };

    this._container = document.getElementById(containerId);
    this._puzzleSize = puzzleSize;
    this._stepStateItemsSeparator = stepStateItemsSeparator;
  }

  /** @param {boolean} isSolving */
  setSolving(isSolving) {
    if (isSolving) {
      this._container.setAttribute('data-solving', 'true');
      this._container.innerHTML = '';
      this.addMessage('Solving 🧠...');
    } else {
      this._container.removeAttribute('data-solving');
    }
  }

  /**
   * @param {number} itemValue 
   * @param {string} itemMoveDirection 
   */
  createStep(itemValue, itemMoveDirection) {
    const container = document.createElement('div');
    const puzzleItem = document.createElement('div');
    const direction = document.createElement('span');
  
    container.className = this._selectors.stepClassName;
    puzzleItem.className = this._selectors.stepItemClassName;
    direction.className = this._selectors.stepDirectionClassName;
  
    puzzleItem.textContent = itemValue;
    direction.textContent = itemMoveDirection;
  
    container.append(puzzleItem, direction);
    return container;
  }

  /**
   * @param {object} params
   * @param {string} params.messageText
   * @param {HTMLElement} [params.appendAfter]
   * @param {string} [params.textAlign]
   */
  addMessage(params) {
    const message = document.createElement('p');
    message.className = this._selectors.solutionMessageClassName;

    if (typeof params === 'string') {
      message.textContent = params;
      this._container.append(message);

      return message;
    }

    const {messageText, appendAfter, textAlign} = params;
    message.textContent = messageText;

    if (textAlign)
      message.style.textAlign = textAlign;

    if (appendAfter)
      appendAfter.after(message);
    else
      this._container.append(message);

    return message;
  }

  /**
   * @param {HTMLElement} stepElement 
   * @param {number} index
   * @param {number} stepsCount
   * @param {boolean} reversed
   */
  prependIndexToStep(stepElement, index, stepsCount, reversed) {
    const stepIndex = document.createElement('span');
    
    stepIndex.className = this._selectors.stepIndexClassName;
    stepIndex.textContent = reversed ? (stepsCount - index) : (index + 1);
    
    stepElement.id = this.getStepElementId(index);
    stepElement.prepend(stepIndex);

    return stepElement;
  };

  /**
   * @param {HTMLElement} stepElement 
   * @param {number} index
   */
  appendPuzzleToStep(stepElement, index) {
    const stepItemValue = Number.parseInt(
      stepElement.querySelector(`.${this._selectors.stepItemClassName}`).textContent
    );

    const puzzleWrapperId = `${this.getStepElementId(index)}-puzzle`;
    const puzzleWrapper = document.createElement('div');

    puzzleWrapper.id = puzzleWrapperId;
    puzzleWrapper.className = this._selectors.stepPuzzleWrapperClassName;

    stepElement.appendChild(puzzleWrapper);

    new Puzzle({
      clearContainer: false,
      selectors: {
        containerId: puzzleWrapperId,
        cursorId: `${puzzleWrapperId}-cursor`,
      },
      size: this._puzzleSize,
      state: stepElement.getAttribute('data-state')
        .split(this._stepStateItemsSeparator)
        .map(itemValue => {
          const itemParsedValue = Number.parseInt(itemValue);

          if (itemParsedValue === stepItemValue)
            return itemParsedValue * -1;

          return itemParsedValue;
        }),
    });
  }

  /**
   * @param {object} params
   * @param {Map<string, {parentKey: string, stepElement: HTMLElement}>} params.visitedStates 
   * @param {string} params.stateKey
   * @param {boolean} params.minimizeOutput
   * @param {boolean} params.reverseSteps
   * 
   * @returns {number} Solutions steps count.
   */
  assembleSteps({visitedStates, stateKey, minimizeOutput, reverseSteps}) {
    const getSolutionSteps = (stateKey, steps = []) => {
      const {stepElement, parentKey} = visitedStates.get(stateKey);

      if (stepElement)
        steps.push(stepElement);

      if (parentKey) {
        stepElement.setAttribute('data-state', stateKey);
        getSolutionSteps(parentKey, steps);
      }

      return steps;
    };

    const steps = reverseSteps ? getSolutionSteps(stateKey) : getSolutionSteps(stateKey).reverse();

    const indexedSteps = steps.map((stepElement, index) => {
      return this.prependIndexToStep(stepElement, index, steps.length, reverseSteps);
    });

    this._container.append(...indexedSteps);

    if (!minimizeOutput)
      indexedSteps.map(this.appendPuzzleToStep, this);

    return steps.length;
  }

  /** @param {number} index */
  getStepElementId(index) {
    return `${this._selectors.stepClassName}-${index}`;
  }

  clearContainer() {
    this._container.innerHTML = '';
  }
}

export default SolutionStepsAssembler;
