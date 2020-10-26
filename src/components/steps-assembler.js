import Puzzle from './puzzle.js';


class StepsAssembler {
  selectors;
  container;
  puzzleSize;
  stepStateCellsSeparator;

  constructor({selectors, puzzleSize, stepStateCellsSeparator = '-'}) {
    const {containerId, stepClassName = 'solution-step'} = selectors;
    
    const {
      stepDirectionClassName = `${stepClassName}-direction`,
      stepIndexClassName = `${stepClassName}-index`,
      stepCellClassName = `${stepClassName}-cell`,
      solutionMessageClassName = `${stepClassName}-message`,
      stepPuzzleWrapperClassName = `${stepClassName}-puzzle`,
    } = selectors;

    this.selectors = {
      containerId,
      stepClassName,
      stepDirectionClassName,
      stepIndexClassName,
      stepCellClassName,
      solutionMessageClassName,
      stepPuzzleWrapperClassName,
    };

    this.container = document.getElementById(containerId);
    this.puzzleSize = puzzleSize;
    this.stepStateCellsSeparator = stepStateCellsSeparator;
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

  createStep(cellValue, cellMoveDirection) {
    const container = document.createElement('div');
    const puzzleCell = document.createElement('div');
    const direction = document.createElement('span');
  
    container.className = this.selectors.stepClassName;
    puzzleCell.className = this.selectors.stepCellClassName;
    direction.className = this.selectors.stepDirectionClassName;
  
    puzzleCell.textContent = cellValue;
    direction.textContent = cellMoveDirection;
  
    container.append(puzzleCell, direction);
    container.setAttribute('data-direction', cellMoveDirection);

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
    const stepCellValue = Number.parseInt(
      stepElement.querySelector(`.${this.selectors.stepCellClassName}`).textContent
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
        .split(this.stepStateCellsSeparator)
        .map(cellValue => {
          const cellParsedValue = Number.parseInt(cellValue);

          if (cellParsedValue === stepCellValue)
            return cellParsedValue * -1;

          return cellParsedValue;
        }),
    });
  }

  assembleSteps({visitedStates, stateKey, minimizeOutput, reverseSteps}) {
    const getSolutionSteps = (stateKey, stepElements = [], steps = []) => {
      const {stepElement, parentKey} = visitedStates.get(stateKey);

      if (stepElement) {
        stepElements.push(stepElement);
        const cell = stepElement.querySelector(`.${this.selectors.stepCellClassName}`);

        steps.push({
          direction: stepElement.getAttribute('data-direction'),
          cellValue: Number.parseInt(cell.textContent),
        });
      }

      if (parentKey) {
        stepElement.setAttribute('data-state', stateKey);
        getSolutionSteps(parentKey, stepElements, steps);
      }

      return [stepElements, steps];
    };

    const [stepElements, steps] = getSolutionSteps(stateKey);

    if (!reverseSteps) {
      stepElements.reverse();
      steps.reverse();
    }

    const indexedSteps = stepElements.map((stepElement, index) => {
      return this.prependIndexToStep(stepElement, index, stepElements.length, reverseSteps);
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
