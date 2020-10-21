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
  _itemsPositions = [];

  /** @type {PuzzleItemPosition} */
  _cursorPosition = {
    col: 2,
    row: 2,
  };

  /** @type {HTMLElement} */
  _selectedItem = null;

  _cursorColorHighlighted = '';
  _cursorColor = '';

  /**
   * @typedef PuzzleSelectors
   * @property {string} containerId
   * @property {string} cursorId
   * @property {string} itemClassName
   */

  /** @type {PuzzleSelectors} */
  _selectors = {
    containerId: '',
    cursorId: '',
    itemClassName: '',
  }

  /**
   * @param {object} params
   * @param {PuzzleSelectors} params.selectors
   * @param {number} params.size
   */
  constructor({
    selectors: {
      containerId,
      cursorId,
      itemClassName = '.puzzle-item',
    },
    size = 3,
  }) {
    this._selectors = {containerId, cursorId, itemClassName}

    this._cursorColorHighlighted = getComputedStyle(document.documentElement)
      .getPropertyValue('--puzzle-cursor-color-highlighted') || 'green';

    this._cursorColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--puzzle-cursor-color') || 'purple';

    this.size = size;
    this.container = document.getElementById(containerId);
    this.cursor = document.getElementById(cursorId);
    this.items = Array.from(document.querySelectorAll(`#${containerId} ${itemClassName}`));

    this._addEventListeners();
    this._mapItemsPositions();
    this._setAvailableItems();
  }

  getState() {
    const {col: cursorCol, row: cursorRow} = this._cursorPosition;
    const state = [];

    state[cursorCol + cursorRow * 3] = 0;

    this.items.forEach((item, index) => {
      const { col, row } = this._itemsPositions[index];
      state[col + row * 3] = Number.parseInt(item.textContent);
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
      this.items[index].textContent = value;

      Puzzle.setItemGridPosition(
        this.items[index],
        Puzzle.getItemPosition(positionIndex, this.size)
      );
    })
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
      this.cursor.style.backgroundColor = this._cursorColorHighlighted;
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

  _mapItemsPositions() {
    this._itemsPositions = this.items.map((_item, index) => {
      return Puzzle.getItemPosition(index, this.size);
    });
  }

  _setAvailableItems() {
    this.items.forEach((item, index) => {
      const itemPosition = this._itemsPositions[index];

      if (!Puzzle.itemIsMoveable(this._cursorPosition, itemPosition))
        item.removeAttribute('draggable');

      else item.setAttribute('draggable', 'true');
    })
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
   * @param {PuzzleItemPosition} cursorPosition 
   * @param {PuzzleItemPosition} itemPosition
   */
  static itemIsMoveable({col: cursorCol, row: cursorRow}, {col: itemCol, row: itemRow}) {
    const cannotMoveVertically = Math.abs(cursorCol - itemCol) === 1 && cursorRow === itemRow
    const cannotMoveHorizontally = Math.abs(cursorRow - itemRow) === 1 && cursorCol === itemCol

    return cannotMoveVertically || cannotMoveHorizontally;
  };

  /**
   * @param {number} itemIndex
   * @param {number} puzzleSize
   * @returns {PuzzleItemPosition}
   */
  static getItemPosition(itemIndex, puzzleSize = 3) {
    return {
      col: itemIndex % puzzleSize,
      row: Math.floor(itemIndex / puzzleSize),
    };
  }
}

export default Puzzle;
