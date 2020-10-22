import {range} from '../utils.js';

class Puzzle {
  /** @type {HTMLElement} */
  container;

  /** @type {number} */
  size;

  /** @type {HTMLElement[]} */
  items;

  /** @type {HTMLElement} */
  cursor;

  /**
   * @typedef PuzzleItemPosition
   * @property {number} col
   * @property {number} row
   */

  /** @type {PuzzleItemPosition[]} */
  _itemsPositions;

  /** @type {PuzzleItemPosition} */
  _cursorPosition;

  /** @type {HTMLElement} */
  _selectedItem;

  /** @type {string} */
  _cellHighlightedColor;

  /** @type {string} */
  _cursorColor;

  /**
   * @typedef PuzzleSelectors
   * @property {string} containerId
   * @property {string} cursorClassName
   * @property {string} cursorId
   * @property {string} itemClassName
   */

  /**
   * @typedef PuzzleParams
   * @property {boolean} clearContainer
   * @property {PuzzleSelectors} selectors
   * @property {number} size
   * @property {number[]} state
   */

  /** @type {PuzzleSelectors} */
  _selectors;

  /** @param {PuzzleParams} params */
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
    this._clearContainer = clearContainer;
    this._selectors = {containerId, cursorClassName, cursorId, itemClassName}

    this._cellHighlightedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--cell-highlighted-color') || 'green';

    this._cursorColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--puzzle-cursor-color') || 'purple';

    this.size = size;
    this.items = [];

    this._itemsPositions = [];
    this._selectedItem = null;

    this.container = document.getElementById(containerId);

    this._renderPuzzle(clearContainer);
    this._addEventListeners();

    if (state)
      this.setState(state);
  }

  getState() {
    const {col: cursorCol, row: cursorRow} = this._cursorPosition;
    const state = [];

    state[cursorCol + cursorRow * this.size] = 0;

    this.items.forEach((item, index) => {
      const { col, row } = this._itemsPositions[index];
      state[col + row * this.size] = Number.parseInt(item.textContent);
    });

    return state;
  }

  /** @param {number[]} state */
  setState(state) {
    const cursorIndex = state.indexOf(0);
    const stateItems = state.map((value, positionIndex) => ({value, positionIndex}))
      .filter(({value}) => value !== 0);

    this._cursorPosition = Puzzle.getItemPosition(cursorIndex, this.size);
    Puzzle.setItemGridPosition(this.cursor, this._cursorPosition);

    stateItems.forEach(({value, positionIndex}, index) => {
      const highlighted = value < 0;
      const itemPosition = Puzzle.getItemPosition(positionIndex, this.size);
      
      this.items[index].textContent = Math.abs(value);
      this._itemsPositions[index] = itemPosition;

      Puzzle.setItemGridPosition(this.items[index], itemPosition);

      if (highlighted)
        this.items[index].style.backgroundColor = this._cellHighlightedColor;
    });

    this._setAvailableItems();
  }

  /** @param {DragEvent} event */
  handleDragStart(event) {
    this._selectedItem = event.target;
  }

  /** @param {DragEvent} event */
  handleDragEnd(_event) {
    this._selectedItem = null;
  }

  /** @param {DragEvent} event */
  handleDragOver(event) {
    event.preventDefault();
  }

  /** @param {DragEvent} event */
  handleDragEnter(event) {
    if (this._dragEventTargetIsCursor(event))
      this.cursor.style.backgroundColor = this._cellHighlightedColor;
  }

  /** @param {DragEvent} event */
  handleDragLeave(event) {  
    if (this._dragEventTargetIsCursor(event))
      this.cursor.style.backgroundColor = this._cursorColor;
  }

  /** @param {DragEvent} event */
  handleDrop(event) {
    event.preventDefault();
    
    if (!this._dragEventTargetIsCursor(event))
      return;

    const itemIndex = this.items.indexOf(this._selectedItem);
    const itemPosition = this._itemsPositions[itemIndex];

    Puzzle.setItemGridPosition(this._selectedItem, this._cursorPosition);
    Puzzle.setItemGridPosition(this.cursor, this._itemsPositions[itemIndex]);

    this.cursor.style.backgroundColor = this._cursorColor;
    [this._itemsPositions[itemIndex], this._cursorPosition] = [this._cursorPosition, itemPosition];

    this._setAvailableItems();
  }

  removeEventListeners() {
    document.removeEventListener('dragstart',  this.handleDragStart);
    document.removeEventListener('dragend',    this.handleDragEnd);
    document.removeEventListener('dragover',   this.handleDragOver);
    document.removeEventListener('dragenter',  this.handleDragEnter);
    document.removeEventListener('dragleave',  this.handleDragLeave);
    document.removeEventListener('drop',       this.handleDrop);
  }

  /** @param {DragEvent} event */
  _dragEventTargetIsCursor(event) {
    return event.target.id === this._selectors.cursorId;
  }
  
  _addEventListeners() {
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

  _setAvailableItems() {
    this.items.forEach((item, index) => {
      const itemPosition = this._itemsPositions[index];

      if (!Puzzle.getItemMoveDirection(this._cursorPosition, itemPosition))
        item.removeAttribute('draggable');

      else item.setAttribute('draggable', 'true');
    })
  }

  _renderPuzzle(clearContainer) {
    if (clearContainer)
      this.container.innerHTML = '';

    this.container.style.setProperty('--size', this.size);
    this.cursor = document.createElement('div');

    this.cursor.id = this._selectors.cursorId;
    this.cursor.className = this._selectors.cursorClassName;

    range(1, this.size * this.size).forEach((itemValue, index) => {
      const item = document.createElement('div');

      item.className = this._selectors.itemClassName;
      item.textContent = itemValue;

      this.items.push(item);
      this._itemsPositions.push(Puzzle.getItemPosition(index, this.size));

      this.container.appendChild(item);
    });

    this.container.appendChild(this.cursor);
    
    this._cursorPosition = {
      col: this.size - 1,
      row: this.size - 1,
    };

    this._setAvailableItems();
  }

  /**
   * @param {HTMLElement} item 
   * @param {PuzzleItemPosition} position 
   */
  static setItemGridPosition(item, position) {
    const {col, row} = position;
    
    item.style.gridColumn = col + 1;
    item.style.gridRow = row + 1;
  }

  /**
   * @typedef {'down' | 'up' | 'right' | 'left'} PuzzleItemMoveDirection
   * @param {PuzzleItemPosition} cursorPosition 
   * @param {PuzzleItemPosition} itemPosition
   * @returns {PuzzleItemMoveDirection}
   */
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

  /**
   * @param {number} itemIndex
   * @param {number} puzzleSize
   * @returns {PuzzleItemPosition}
   */
  static getItemPosition(itemIndex, puzzleSize) {
    return {
      col: itemIndex % puzzleSize,
      row: Math.floor(itemIndex / puzzleSize),
    };
  }
}

export default Puzzle;
