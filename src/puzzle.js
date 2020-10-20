class Puzzle {
  /** @type {HTMLElement} */
  container;

  /** @type {[HTMLElement]} */
  items;

  /** @type {HTMLElement} */
  cursor;

  /**
   * @typedef PuzzleItemPosition
   * @property {number} col
   * @property {number} row
   */

  /** @type {[PuzzleItemPosition]} */
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

  _selectors = {
    containerId: '',
    cursorId: '',
    itemClassName: '',
  }

  constructor({
    selectors: {
      containerId,
      cursorId,
      itemClassName = '.puzzle-item',
    }
  }) {
    this._selectors = { containerId, cursorId, itemClassName }

    this._cursorColorHighlighted = getComputedStyle(document.documentElement)
      .getPropertyValue('--puzzle-cursor-color-highlighted') || 'green';

    this._cursorColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--puzzle-cursor-color') || 'purple';

    this.container = document.getElementById(containerId);
    this.cursor = document.getElementById(cursorId);
    this.items = Array.from(document.querySelectorAll(`#${containerId} ${itemClassName}`));

    this._addEventListeners();
    this._mapItemsPositions();
    this._setAvailableItems();
  }

  getState() {
    const { col: cursorCol, row: cursorRow } = this._cursorPosition;
    const state = [];

    state[cursorCol + cursorRow * 3] = 0;

    this.items.forEach((item, index) => {
      const { col, row } = this._itemsPositions[index];
      state[col + row * 3] = Number.parseInt(item.textContent);
    });

    return state;
  }

  /** @param {[number]} state */
  setState(state) {
    state.forEach((itemValue, index) => {
      const newPosition = {
        col: index % 3,
        row: Math.floor(index / 3),
      };

      if (itemValue === 0) {
        Puzzle.setItemGridPosition(this.cursor, newPosition);
      } else {
        this.items[index].textContent = itemValue;
        Puzzle.setItemGridPosition(this._itemsPositions[index], newPosition);
      }
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
    this._itemsPositions = this.items.map((_item, index) => ({
      col: index % 3,
      row: Math.floor(index / 3),
    }));
  }

  _setAvailableItems() {
    const { col: cursorCol, row: cursorRow } = this._cursorPosition;

    this.items.forEach((item, index) => {
      const itemPosition = this._itemsPositions[index];
      const { col: itemCol, row: itemRow } = itemPosition;

      if (!(Math.abs(cursorCol - itemCol) === 1 && cursorRow === itemRow) &&
        !(Math.abs(cursorRow - itemRow) === 1 && cursorCol === itemCol))
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
    const { col, row } = position;
    
    item.style.gridColumn = col + 1;
    item.style.gridRow = row + 1;
  }
}

export default Puzzle;
