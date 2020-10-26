import {generateRandomState, range} from '../utils.js';

class Puzzle {
  container;
  size;
  cells;
  cursor;
  cellsPositions;
  cursorPosition;
  selectedCell;
  cellHighlightedColor;
  cursorColor;
  selectors;

  constructor({
    clearContainer = true,
    selectors: {
      containerId,
      cursorClassName = 'puzzle-cursor',
      cursorId,
      cellClassName = 'puzzle-cell',
    },
    size,
    state,
  }) {
    this.selectors = {containerId, cursorClassName, cursorId, cellClassName}

    this.cellHighlightedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--cell-highlighted-color') || 'green';

    this.cursorColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--puzzle-cursor-color') || 'purple';

    this.size = typeof size === 'number' ? {cols: size, rows: size} : size;
    this.cells = [];

    this.cellsPositions = [];
    this.selectedCell = null;

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

    this.cells.forEach((cell, index) => {
      const { col, row } = this.cellsPositions[index];
      state[col + row * this.size.cols] = Number.parseInt(cell.textContent);
    });

    return state;
  }

  setState(state) {
    const cursorIndex = state.indexOf(0);
    const stateCells = state.map((value, positionIndex) => ({value, positionIndex}))
      .filter(({value}) => value !== 0);

    this.cursorPosition = Puzzle.getCellPosition(cursorIndex, this.size);
    Puzzle.setCellGridPosition(this.cursor, this.cursorPosition);

    stateCells.forEach(({value, positionIndex}, index) => {
      const highlighted = value < 0;
      const cellPosition = Puzzle.getCellPosition(positionIndex, this.size);
      
      this.cells[index].textContent = Math.abs(value);
      this.cellsPositions[index] = cellPosition;

      Puzzle.setCellGridPosition(this.cells[index], cellPosition);

      if (highlighted)
        this.cells[index].style.backgroundColor = this.cellHighlightedColor;
    });

    this.setAvailableCells();
  }

  handleDragStart(event) {
    this.selectedCell = event.target;
  }

  handleDragEnd(_event) {
    this.selectedCell = null;
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

    const cellIndex = this.cells.indexOf(this.selectedCell);
    const cellPosition = this.cellsPositions[cellIndex];

    Puzzle.setCellGridPosition(this.selectedCell, this.cursorPosition);
    Puzzle.setCellGridPosition(this.cursor, cellPosition);

    this.cursor.style.backgroundColor = this.cursorColor;

    [this.cellsPositions[cellIndex], this.cursorPosition] = [this.cursorPosition, cellPosition];
    this.setAvailableCells();
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

  setAvailableCells() {
    this.cells.forEach((cell, index) => {
      const cellPosition = this.cellsPositions[index];

      if (!Puzzle.getCellMoveDirection(this.cursorPosition, cellPosition))
        cell.removeAttribute('draggable');

      else cell.setAttribute('draggable', 'true');
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

    range(1, this.size.cols * this.size.rows).forEach((cellValue, index) => {
      const cell = document.createElement('div');

      cell.className = this.selectors.cellClassName;
      cell.textContent = cellValue;

      this.cells.push(cell);
      this.cellsPositions.push(Puzzle.getCellPosition(index, this.size));

      this.container.appendChild(cell);
    });

    this.container.appendChild(this.cursor);
    
    this.cursorPosition = {
      col: this.size.cols - 1,
      row: this.size.rows - 1,
    };
  
    this.setAvailableCells();
  }

  setRandomState() {
    this.setState(generateRandomState(this.size));
  }

  resetState() {
    this.setState([...range(1, this.size.cols * this.size.rows), 0]);
  }

  static setCellGridPosition(cell, position) {
    const {col, row} = position;
    
    cell.style.gridColumn = col + 1;
    cell.style.gridRow = row + 1;
  }

  static getCellMoveDirection({col: cursorCol, row: cursorRow}, {col: cellCol, row: cellRow}) {
    const verticalDelta = cursorCol - cellCol;
    const horizontalDelta = cursorRow - cellRow;
    
    if (Math.abs(verticalDelta) === 1 && cursorRow === cellRow) {
      return verticalDelta === 1 ? 'right' : 'left';
    }

    if (Math.abs(horizontalDelta) === 1 && cursorCol === cellCol) {
      return horizontalDelta === 1 ? 'down' : 'up';
    }

    return null;
  };

  static getCellPosition(cellIndex, puzzleSize) {
    const {cols} = typeof puzzleSize === 'number' ? {
      cols: puzzleSize,
      rows: puzzleSize,
    } : puzzleSize;
    
    return {
      col: cellIndex % cols,
      row: Math.floor(cellIndex / cols),
    };
  }
}

export default Puzzle;
