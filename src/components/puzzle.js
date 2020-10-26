import {generateRandomState, range} from '../utils.js';

class Puzzle {
  container;
  size;
  items;
  cursor;
  itemsPositions;
  cursorPosition;
  selectedItem;
  cellHighlightedColor;
  cursorColor;
  selectors;

  constructor({
    clearContainer = true,
    selectors: {
      containerId,
      cursorClassName = 'puzzle-cursor',
      cursorId,
      itemClassName = 'puzzle-item',
    },
    size,
    state,
  }) {
    this.selectors = {containerId, cursorClassName, cursorId, itemClassName}

    this.cellHighlightedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--cell-highlighted-color') || 'green';

    this.cursorColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--puzzle-cursor-color') || 'purple';

    this.size = typeof size === 'number' ? {cols: size, rows: size} : size;
    this.items = [];

    this.itemsPositions = [];
    this.selectedItem = null;

    this.container = document.getElementById(containerId);

    this.renderPuzzle(clearContainer);
    this.addEventListeners();

    if (state)
      this.setState(state);
  }

  getState() {
    const {col: cursorCol, row: cursorRow} = this.cursorPosition;
    const state = [];

    state[cursorCol + cursorRow * this.size.cols] = 0;

    this.items.forEach((item, index) => {
      const { col, row } = this.itemsPositions[index];
      state[col + row * this.size.cols] = Number.parseInt(item.textContent);
    });

    return state;
  }

  setState(state) {
    const cursorIndex = state.indexOf(0);
    const stateItems = state.map((value, positionIndex) => ({value, positionIndex}))
      .filter(({value}) => value !== 0);

    this.cursorPosition = Puzzle.getItemPosition(cursorIndex, this.size);
    Puzzle.setItemGridPosition(this.cursor, this.cursorPosition);

    stateItems.forEach(({value, positionIndex}, index) => {
      const highlighted = value < 0;
      const itemPosition = Puzzle.getItemPosition(positionIndex, this.size);
      
      this.items[index].textContent = Math.abs(value);
      this.itemsPositions[index] = itemPosition;

      Puzzle.setItemGridPosition(this.items[index], itemPosition);

      if (highlighted)
        this.items[index].style.backgroundColor = this.cellHighlightedColor;
    });

    this.setAvailableItems();
  }

  handleDragStart(event) {
    this.selectedItem = event.target;
  }

  handleDragEnd(_event) {
    this.selectedItem = null;
  }

  handleDragOver(event) {
    event.preventDefault();
  }

  handleDragEnter(event) {
    if (this.dragEventTargetIsCursor(event))
      this.cursor.style.backgroundColor = this.cellHighlightedColor;
  }

  handleDragLeave(event) {
    if (this.dragEventTargetIsCursor(event))
      this.cursor.style.backgroundColor = this.cursorColor;
  }

  handleDrop(event) {
    event.preventDefault();
    
    if (!this.dragEventTargetIsCursor(event))
      return;

    const itemIndex = this.items.indexOf(this.selectedItem);
    const itemPosition = this.itemsPositions[itemIndex];

    Puzzle.setItemGridPosition(this.selectedItem, this.cursorPosition);
    Puzzle.setItemGridPosition(this.cursor, itemPosition);

    this.cursor.style.backgroundColor = this.cursorColor;

    [this.itemsPositions[itemIndex], this.cursorPosition] = [this.cursorPosition, itemPosition];
    this.setAvailableItems();
  }

  dragEventTargetIsCursor(event) {
    return event.target.id === this.selectors.cursorId;
  }
  
  addEventListeners() {
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd   = this.handleDragEnd.bind(this);
    this.handleDragOver  = this.handleDragOver.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop      = this.handleDrop.bind(this);

    document.addEventListener('dragstart',  this.handleDragStart);
    document.addEventListener('dragend',    this.handleDragEnd);
    document.addEventListener('dragover',   this.handleDragOver);
    document.addEventListener('dragenter',  this.handleDragEnter);
    document.addEventListener('dragleave',  this.handleDragLeave);
    document.addEventListener('drop',       this.handleDrop);
  }
  
  removeEventListeners() {
    document.removeEventListener('dragstart',  this.handleDragStart);
    document.removeEventListener('dragend',    this.handleDragEnd);
    document.removeEventListener('dragover',   this.handleDragOver);
    document.removeEventListener('dragenter',  this.handleDragEnter);
    document.removeEventListener('dragleave',  this.handleDragLeave);
    document.removeEventListener('drop',       this.handleDrop);
  }

  setAvailableItems() {
    this.items.forEach((item, index) => {
      const itemPosition = this.itemsPositions[index];

      if (!Puzzle.getItemMoveDirection(this.cursorPosition, itemPosition))
        item.removeAttribute('draggable');

      else item.setAttribute('draggable', 'true');
    })
  }

  renderPuzzle(clearContainer) {
    if (clearContainer)
      this.container.innerHTML = '';

    document.documentElement.style.setProperty('--puzzle-cols', this.size.cols);
    document.documentElement.style.setProperty('--puzzle-rows', this.size.rows);

    this.cursor = document.createElement('div');

    this.cursor.id = this.selectors.cursorId;
    this.cursor.className = this.selectors.cursorClassName;

    range(1, this.size.cols * this.size.rows).forEach((itemValue, index) => {
      const item = document.createElement('div');

      item.className = this.selectors.itemClassName;
      item.textContent = itemValue;

      this.items.push(item);
      this.itemsPositions.push(Puzzle.getItemPosition(index, this.size));

      this.container.appendChild(item);
    });

    this.container.appendChild(this.cursor);
    
    this.cursorPosition = {
      col: this.size.cols - 1,
      row: this.size.rows - 1,
    };
  
    this.setAvailableItems();
  }

  setRandomState() {
    this.setState(generateRandomState(this.size));
  }

  resetState() {
    this.setState([...range(1, this.size.cols * this.size.rows), 0]);
  }

  static setItemGridPosition(item, position) {
    const {col, row} = position;
    
    item.style.gridColumn = col + 1;
    item.style.gridRow = row + 1;
  }

  static getItemMoveDirection({col: cursorCol, row: cursorRow}, {col: itemCol, row: itemRow}) {
    const verticalDelta = cursorCol - itemCol;
    const horizontalDelta = cursorRow - itemRow;
    
    if (Math.abs(verticalDelta) === 1 && cursorRow === itemRow) {
      return verticalDelta === 1 ? 'right' : 'left';
    }

    if (Math.abs(horizontalDelta) === 1 && cursorCol === itemCol) {
      return horizontalDelta === 1 ? 'down' : 'up';
    }

    return null;
  };

  static getItemPosition(itemIndex, puzzleSize) {
    const {cols} = typeof puzzleSize === 'number' ? {
      cols: puzzleSize,
      rows: puzzleSize,
    } : puzzleSize;
    
    return {
      col: itemIndex % cols,
      row: Math.floor(itemIndex / cols),
    };
  }
}

export default Puzzle;
