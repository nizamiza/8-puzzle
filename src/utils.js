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

export const generateRandomState = (puzzleSize) => {
	const itemsCount = puzzleSize * puzzleSize;

	return range(itemsCount).reduce(state => {
		let itemValue;
		
		do {
			itemValue = Math.abs(Math.round(Math.random() * (itemsCount - 1)));
		} while (state.includes(itemValue));

		return [...state, itemValue];
	}, []);
};


/**
 * @template T
 * @param {[T]} array
 * @param {number} indexA
 * @param {number} indexB
 * @returns {[T]} New array with swapped items at original indices A and B.
 */
export const swapArrayElements = (array, indexA, indexB) => {
  return array.map((value, index) => {
    if (index === indexA) return array[indexB];
    if (index === indexB) return array[indexA];
    return value;
  })
};
