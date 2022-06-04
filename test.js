require('./dict2.js');

const uniqueDict = [];
for (const dictWord of dict) {
	if (!uniqueDict.includes(dictWord)) {
		uniqueDict.push(dictWord);
	}
}
console.log('guess,mean,max,eta');

const startTime = new Date();
let i = 0;
for (const guess of uniqueDict) {
	// console.log(`guess: ${guess}`);
	let sum = 0,
		max = 0;
	for (const word of uniqueDict) {
		const possibilities = uniqueDict.filter((w) => {
			return guessMatchesWord(guess, w, word);
		});
		sum += possibilities.length;
		max = Math.max(max, possibilities.length);
	}
	const mean = sum / uniqueDict.length;
	// console.log(`mean: ${mean.toFixed(2)}`);
	// console.log(`max: ${max}`);
	i++;
	const finishedRatio = i / uniqueDict.length;
	const elapsedTime = new Date() - startTime;
	const totalTime = elapsedTime / finishedRatio;
	const eta = new Date(startTime.getTime() + totalTime);
	// console.log(`${(100 * finishedRatio).toFixed(2)}% finished. ETA: ${eta}`);
	// console.log();
	console.log(`${guess},${mean},${max},${eta}`);
}

function guessMatchesWord(guess, dictWord, word) {
	let regex = '';
	const charMatches = [];
	const noCharMatches = [];
	let i = 0;
	for (const ch of guess) {
		const lcChar = ch.toLowerCase();
		if (word[i++] == lcChar) {
			regex += lcChar;
		} else if (word.includes(lcChar)) {
			regex += `[^${lcChar}]`;
			charMatches.push(lcChar);
		} else {
			regex += '.';
			noCharMatches.push(lcChar);
		}
	}
	const r = new RegExp(regex);
	if (dictWord.match(r)) {
		for (const c of charMatches) {
			if (!dictWord.includes(c)) {
				return false;
			}
		}
		for (const c of noCharMatches) {
			if (dictWord.includes(c)) {
				return false;
			}
		}
		return true;
	}
}
