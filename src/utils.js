import Puzzle from './components/puzzle.js';


/**
 * @param {number} start
 * @param {number} [end]
 */
export const range = (start = 0, end) => {
	let offset = 0;
	let length = start;

	if (end) {
		offset = start;
		length = end - start;
	}
	
	return [...Array(length).keys()].map(element => element + offset);
}

export const generateRandomState = (puzzleSize, turnsMin = 10, turnsMax = 1000) => {
	const itemsCount = puzzleSize ** 2;
	const state = [...range(1, itemsCount), 0];

	const turnsCount = Math.round(Math.random() * (turnsMax - turnsMin) + turnsMin);

	return range(turnsCount).reduce(({currentState, cursorIndex}, _turn) => {

		const moveableItemsIndices = [];
		const cursorPosition = Puzzle.getItemPosition(cursorIndex, puzzleSize);

		currentState.forEach((itemValue, itemIndex) => {
			if (itemValue === 0)
				return;

			const itemPosition = Puzzle.getItemPosition(itemIndex, puzzleSize);
			const itemMoveDirection = Puzzle.getItemMoveDirection(cursorPosition, itemPosition);

			if (!itemMoveDirection)
				return;

			moveableItemsIndices.push(itemIndex);
		});
		
		const moveableItemsCount = moveableItemsIndices.length;
		const swapIndex = moveableItemsIndices[Math.round(Math.random() * (moveableItemsCount - 1))];

		[state[swapIndex], state[cursorIndex]] = [state[cursorIndex], state[swapIndex]]
		return {currentState: state, cursorIndex: swapIndex};
	}, {
		currentState: state,
		cursorIndex: state.length - 1,
	});
};
