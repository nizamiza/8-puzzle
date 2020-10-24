import Puzzle from './puzzle.js';


class StepsAssembler {
  selectors;
  container;
  puzzleSize;
  stepStateItemsSeparator;

  constructor({selectors, puzzleSize, stepStateItemsSeparator = '-'}) {
    const {containerId, stepClassName = 'solution-step'} = selectors;
    
    const {
      stepDirectionClassName = `${stepClassName}-direction`,
      stepIndexClassName = `${stepClassName}-index`,
      stepItemClassName = `${stepClassName}-item`,
      solutionMessageClassName = `${stepClassName}-message`,
      stepPuzzleWrapperClassName = `${stepClassName}-puzzle`,
    } = selectors;

    this.selectors = {
      containerId,
      stepClassName,
      stepDirectionClassName,
      stepIndexClassName,
      stepItemClassName,
      solutionMessageClassName,
      stepPuzzleWrapperClassName,
    };

    this.container = document.getElementById(containerId);
    this.puzzleSize = puzzleSize;
    this.stepStateItemsSeparator = stepStateItemsSeparator;
  }

  setSolving(isSolving) {
    if (isSolving) {
      this.container.setAttribute('data-solving', 'true');
      this.container.innerHTML = '';
      this.addMessage('Solving 🧠...');
    } else {
      this.container.removeAttribute('data-solving');
    }
  }

  createStep(itemValue, itemMoveDirection) {
    const container = document.createElement('div');
    const puzzleItem = document.createElement('div');
    const direction = document.createElement('span');
  
    container.className = this.selectors.stepClassName;
    puzzleItem.className = this.selectors.stepItemClassName;
    direction.className = this.selectors.stepDirectionClassName;
  
    puzzleItem.textContent = itemValue;
    direction.textContent = itemMoveDirection;
  
    container.append(puzzleItem, direction);
    container.setAttribute('data-direction', itemMoveDirection);

    return container;
  }

  addMessage(params) {
    const message = document.createElement('p');
    message.className = this.selectors.solutionMessageClassName;

    if (typeof params === 'string') {
      message.textContent = params;
      this.container.append(message);

      return message;
    }

    const {messageText, appendAfter, textAlign} = params;
    message.textContent = messageText;

    if (textAlign)
      message.style.textAlign = textAlign;

    if (!appendAfter) {
      this.container.append(message);
      return message;
    }

    if (typeof appendAfter === 'string' && appendAfter === 'last-message') {
      const messages = document.getElementsByClassName(this.selectors.solutionMessageClassName);
      const lastMessage = messages[messages.length - 1];

      lastMessage.after(message);
    } else {
      appendAfter.after(message);
    }

    return message;
  }

  prependIndexToStep(stepElement, index, stepsCount, reversed) {
    const stepIndex = document.createElement('span');
    
    stepIndex.className = this.selectors.stepIndexClassName;
    stepIndex.textContent = reversed ? (stepsCount - index) : (index + 1);
    
    stepElement.id = this.getStepElementId(index);
    stepElement.prepend(stepIndex);

    return stepElement;
  };

  appendPuzzleToStep(stepElement, index) {
    const stepItemValue = Number.parseInt(
      stepElement.querySelector(`.${this.selectors.stepItemClassName}`).textContent
    );

    const puzzleWrapperId = `${this.getStepElementId(index)}-puzzle`;
    const puzzleWrapper = document.createElement('div');

    puzzleWrapper.id = puzzleWrapperId;
    puzzleWrapper.className = this.selectors.stepPuzzleWrapperClassName;

    stepElement.appendChild(puzzleWrapper);

    new Puzzle({
      clearContainer: false,
      selectors: {
        containerId: puzzleWrapperId,
        cursorId: `${puzzleWrapperId}-cursor`,
      },
      size: this.puzzleSize,
      state: stepElement.getAttribute('data-state')
        .split(this.stepStateItemsSeparator)
        .map(itemValue => {
          const itemParsedValue = Number.parseInt(itemValue);

          if (itemParsedValue === stepItemValue)
            return itemParsedValue * -1;

          return itemParsedValue;
        }),
    });
  }

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

    this.container.append(...indexedSteps);

    if (!minimizeOutput)
      indexedSteps.map(this.appendPuzzleToStep, this);

    return steps;
  }

  getStepElementId(index) {
    return `${this.selectors.stepClassName}-${index}`;
  }

  clearContainer() {
    this.container.innerHTML = '';
  }
}

export default StepsAssembler;
