const numIts = 1e5;
const numWords = 4500;
const numGames = 200;

const p = 1 - Math.pow(1 - 1 / numWords, 40);
console.log('prob of repeat word from last 40 games:', `${100 * p}%`);

let n2 = 0;
let n3 = 0;
for (let j = 0; j < numIts; j++) {
	let n = 0;
	for (let i = 0; i < numGames; i++) {
		if (Math.random() < 1 / 1000) {
			n++;
		}
	}
	if (n >= 2) {
		n2++;
	}

	n = 0;
	for (let i = 0; i < numGames; i++) {
		if (Math.random() < p) {
			n++;
		}
	}
	if (n >= 2) {
		n3++;
	}
}

console.log(`${(100 * n2) / numIts}%`);
console.log(`${(100 * n3) / numIts}%`);
